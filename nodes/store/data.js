const { isClientScoped } = require('../utils/index.js')

const { createDataStore, attachToContext, MERGE_ENTRY, APPEND_ENTRY, SET_SERIES, TRIM_SERIES, ENTRY_MSG } = require('./reactive.js')

const config = {
    RED: null
}

let storeOptions = {}
let fallbackStore = null
let storeContext = null
let storeBase = null
let warned = false

function warnOnce (problem) {
    if (warned || !storeBase) return
    warned = true
    storeBase.warn(`Dashboard data store: ${problem}. Further store failures are not reported until the next full deploy or restart.`)
}

const attachOptions = () => ({ clone: config.RED.util.cloneMessage, ...storeOptions })

function getOrCreateStore (globalContext) {
    let unavailable = null
    const store = attachToContext(globalContext, { ...attachOptions(), onUnavailable: (err) => { unavailable = err } })
    if (!store) throw unavailable || new Error('global context saved a copy of the store rather than the store itself, which happens with context stores that serialise values')
    return store
}

function getStoreOrWarn (action, id) {
    try {
        return fallbackStore || getOrCreateStore(storeContext)
    } catch (err) { warnOnce(`${action} ${id} failed (${err.message})`) }
}

function initStore (globalContext, { node, ...opts } = {}) {
    storeOptions = opts
    storeContext = globalContext
    storeBase = node
    warned = false
    let store = null
    try {
        store = attachToContext(globalContext, attachOptions())
    } finally {
        if (store) {
            fallbackStore = null
        } else if (!fallbackStore) {
            fallbackStore = createDataStore(attachOptions())
        }
    }
    return store
}

function latestPerTopic (msgs, maxPoints) {
    const counts = {}
    const kept = []
    for (let i = msgs.length - 1; i >= 0; i--) {
        const topic = msgs[i].topic
        counts[topic] = (counts[topic] || 0) + 1
        if (counts[topic] <= maxPoints) {
            kept.push(msgs[i])
        }
    }
    return kept.reverse()
}

/**
 * Checks if a Client/Socket ID has been assigned to this message,
 * and whether the node type is being scoped to a specific client.
 * If so, do not store this in our centralised datastore
 * @param {*} msg
 * @returns
 */
function canSaveInStore (base, node, msg) {
    // gets a list of node types that allow for client configuration/limits
    const constrained = base.acceptsClientConfig

    const checks = []

    if (constrained.includes(node.type)) {
        // core check
        if (isClientScoped(msg)) {
            // we are in a node type that allows for definition of specific clients,
            // and a client has been defined
            checks.push(false)
        }
        // plugin checks

        // loop over plugins and check if any have defined a custom isValidConnection function
        // if so, use that to determine if the connection is valid
        for (const plugin of config.RED.plugins.getByType('node-red-dashboard-2')) {
            if (plugin.hooks?.onCanSaveInStore) {
                checks.push(plugin.hooks.onCanSaveInStore(msg))
            }
        }
    }

    return checks.length === 0 || !checks.includes(false)
}

const getters = {
    RED () {
        return config.RED
    },
    // given a widget id, return the latest msg received
    msg (id) {
        return config.RED.util.cloneMessage(getStoreOrWarn('reading', id)?.[ENTRY_MSG](id))
    },
    has (id) {
        const store = getStoreOrWarn('reading', id)
        return !!store && id in store
    }
}

const setters = {
    // map the instance of Node-RED to this module
    setConfig (RED) {
        config.RED = RED
    },
    // remove data associated to a given widget
    clear (id) {
        const store = getStoreOrWarn('clearing', id)
        if (store) {
            delete store[id]
        }
    },
    /**
     *
     * @param {*} base - the ui-base node associated with this widget
     * @param {*} node - the UI node for which we are storing data
     * @param {*} msg - the msg to be stored
     */
    save (base, node, msg) {
        if (Array.isArray(msg)) {
            const msgs = msg.filter((m) => canSaveInStore(base, node, m))
            if (msgs.every((m) => m && typeof m === 'object')) {
                getStoreOrWarn('saving', node.id)?.[SET_SERIES](node.id, msgs)
            }
        } else if (msg && typeof msg === 'object' && canSaveInStore(base, node, msg)) {
            const { ui_update: uiUpdate, ...rest } = msg
            getStoreOrWarn('saving', node.id)?.[MERGE_ENTRY](node.id, rest)
        }
    },
    // given a widget id, and msg, store in an array of history of values
    // useful for charting widgets
    append (base, node, msg) {
        if (msg && typeof msg === 'object' && canSaveInStore(base, node, msg)) {
            getStoreOrWarn('saving', node.id)?.[APPEND_ENTRY](node.id, msg)
        }
    },
    /**
     * Fast filtering of existing array data (skips cloning and save checks for fast data cleanup)
     * @param {*} base - the base node
     * @param {*} node - the owner node
     * @param {(msg) => Boolean} filterFunction
     */
    filter (base, node, filterFunction) {
        if (filterFunction) {
            getStoreOrWarn('trimming', node.id)?.[TRIM_SERIES](node.id, (msgs) => msgs.filter(filterFunction))
        }
    },
    keepLatestPerTopic (base, node, maxPoints) {
        getStoreOrWarn('trimming', node.id)?.[TRIM_SERIES](node.id, (msgs) => latestPerTopic(msgs, maxPoints))
    }
}

module.exports = {
    get: getters.msg,
    has: getters.has,
    RED: getters.RED,
    setConfig: setters.setConfig,
    save: setters.save,
    append: setters.append,
    filter: setters.filter,
    keepLatestPerTopic: setters.keepLatestPerTopic,
    clear: setters.clear,
    initStore
}
