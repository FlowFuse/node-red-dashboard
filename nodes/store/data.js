const data = {}

const config = {
    RED: null
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
        } else {
            if (canSaveInStore(base, node, msg)) {
                const newMsg = stripMsg(msg)
                data[node.id] = {
                    ...data[node.id],
                    ...newMsg
                }
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
        }
    }
}

module.exports = {
    get: getters.msg,
    RED: getters.RED,
    setConfig: setters.setConfig,
    save: setters.save,
    append: setters.append,
    clear: setters.clear
}
