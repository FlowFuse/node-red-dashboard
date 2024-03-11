// Store to manage any dynamic properties set

const state = {}
const config = {
    RED: null
}

/**
 * Checks if a Client/Socket ID has been assigned to this message,
 * If so, do not store this in our centralised datastore
 * @param {*} msg
 * @returns
 */
function canSaveInStore (base, node, msg) {
    const checks = []

    if (msg) {
        // core check
        if (base.acceptsClientConfig.includes(node.type)) {
            // we are in a node type that allows for definition of specific clients,
            if (msg._client?.socketId) {
                // and a client has been defined
                checks.push(false)
            } else {
                // whilst this node does allow for constraints, none were defined in this message
                checks.push(true)
            }
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
    // given a widget id, return all dynamically set properties
    all (id) {
        return state[id]
    },
    // given a widget id, return a specific dynamically set property
    property (id, property) {
        if (Object.prototype.hasOwnProperty.call(state, id)) {
            return state[id][property]
        } else {
            return undefined
        }
    }
}

const setters = {
    // map the instance of Node-RED to this module
    setConfig (RED) {
        config.RED = RED
    },
    /**
     *
     * @param {*} base  - associated ui-base node
     * @param {*} node  - the Node-RED node object we're storing state for
     * @param {*} msg   - the full received msg (allows us to check for credentials/socketid constraints)
     * @param {*} prop  - the property we are setting on the node
     * @param {*} value - the value we are setting
     */
    set (base, node, msg, prop, value) {
        if (canSaveInStore(base, node, msg)) {
            if (!state[node.id]) {
                state[node.id] = {}
            }
            state[node.id][prop] = value
        }
    },
    // remove data associated to a given widget
    reset (id) {
        delete state[id]
    }
}

module.exports = {
    getAll: getters.all,
    getProperty: getters.property,
    RED: getters.RED,
    setConfig: setters.setConfig,
    set: setters.set,
    reset: setters.reset
}
