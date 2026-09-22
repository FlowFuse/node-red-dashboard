const { attachToContext, SET_ENTRY, APPEND_ENTRY } = require('./reactive.js')

const data = {}

const config = {
    RED: null
}

let storeOptions = {}
let storeEnabled = true
const trimCounts = {}
const TRIM_BATCH = 60

function getOrCreateStore (globalContext) {
    return attachToContext(globalContext, { clone: config.RED.util.cloneMessage, ...storeOptions })
}

function initStore (globalContext, opts) {
    storeOptions = { ...opts }
    storeEnabled = true
    return getOrCreateStore(globalContext)
}

function disableStore () {
    storeEnabled = false
}

function writeToStore (node, msg, stored) {
    if (!storeEnabled) return
    if (!msg || typeof msg !== 'object' || !('payload' in msg)) return
    try {
        const clone = config.RED.util.cloneMessage
        getOrCreateStore(node.context().global)[SET_ENTRY](node.id, msg.payload, clone(stored))
    } catch (err) {}
}

function chartPoints (msgs) {
    if (!storeEnabled) return
    const points = []
    for (const m of msgs) {
        const d = m?._datapoint
        if (d === undefined || d === null) continue
        if (Array.isArray(d)) points.push(...d)
        else points.push(d)
    }
    return points
}

function appendToStore (node, msg) {
    if (!storeEnabled) return
    try {
        const stored = config.RED.util.cloneMessage(msg)
        getOrCreateStore(node.context().global)[APPEND_ENTRY](node.id, chartPoints([stored]), stored)
    } catch (err) {}
}

function replaceInStore (node, msgs) {
    if (!storeEnabled) return
    try {
        const clone = config.RED.util.cloneMessage
        const stored = msgs.map((m) => clone(m))
        getOrCreateStore(node.context().global)[SET_ENTRY](node.id, chartPoints(stored), stored)
        delete trimCounts[node.id]
    } catch (err) {}
}

function trimStore (node, msgs) {
    if (!storeEnabled) return
    trimCounts[node.id] = (trimCounts[node.id] || 0) + 1
    if (trimCounts[node.id] < TRIM_BATCH) return
    replaceInStore(node, msgs)
}

function clearFromStore (node) {
    if (!storeEnabled) return
    try {
        delete getOrCreateStore(node.context().global)[node.id]
        delete trimCounts[node.id]
    } catch (err) {}
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
        if (msg._client?.socketId) {
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

// Strip msg of properties that are not needed for storage
function stripMsg (msg) {
    const newMsg = config.RED.util.cloneMessage(msg)

    // don't need to store ui_updates in the datastore, as this is handled in statestore
    delete newMsg.ui_update

    return newMsg
}

const getters = {
    RED () {
        return config.RED
    },
    // given a widget id, return the latest msg received
    msg (id) {
        return config.RED.util.cloneMessage(data[id])
    }
}

const setters = {
    // map the instance of Node-RED to this module
    setConfig (RED) {
        config.RED = RED
    },
    // remove data associated to a given widget
    clear (id) {
        delete data[id]
    },
    /**
     *
     * @param {*} base - the ui-base node associated with this widget
     * @param {*} node - the UI node for which we are storing data
     * @param {*} msg - the msg to be stored
     */
    save (base, node, msg) {
        if (Array.isArray(msg)) {
            /// need to check msg by msg
            const filtered = []
            for (const m of msg) {
                if (canSaveInStore(base, node, m)) {
                    filtered.push(config.RED.util.cloneMessage(m))
                }
            }
            data[node.id] = filtered
            replaceInStore(node, filtered)
        } else {
            if (canSaveInStore(base, node, msg)) {
                const newMsg = stripMsg(msg)
                data[node.id] = {
                    ...data[node.id],
                    ...newMsg
                }
                writeToStore(node, msg, data[node.id])
            }
        }
    },
    // given a widget id, and msg, store in an array of history of values
    // useful for charting widgets
    append (base, node, msg) {
        if (canSaveInStore(base, node, msg)) {
            if (!data[node.id]) {
                data[node.id] = []
            }
            data[node.id].push(config.RED.util.cloneMessage(msg))
            appendToStore(node, msg)
        }
    },
    /**
     * Fast filtering of existing array data (skips cloning and save checks for fast data cleanup)
     * @param {*} base - the base node
     * @param {*} node - the owner node
     * @param {(msg) => Boolean} filterFunction
     */
    filter (base, node, filterFunction) {
        const currentData = data[node.id]
        if (filterFunction && Array.isArray(currentData) && currentData.length) {
            const filteredMessages = currentData.filter(filterFunction)
            if (filteredMessages.length !== currentData.length) {
                // no need for save operation to process messages - just apply them
                data[node.id] = filteredMessages
                trimStore(node, filteredMessages)
            }
        }
    }
}

module.exports = {
    get: getters.msg,
    RED: getters.RED,
    setConfig: setters.setConfig,
    save: setters.save,
    append: setters.append,
    filter: setters.filter,
    clear: setters.clear,
    clearFromStore,
    initStore,
    disableStore
}
