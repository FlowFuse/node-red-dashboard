const data = {}

/**
 * Checks if a Client/Socket ID has been assigned to this message,
 * and whether the node type is being scoped to a specific client.
 * If so, do not store this in our centralised datastore
 * @param {*} msg
 * @returns
 */
function isScopedMessage (base, node, msg) {
    const constrained = base.acceptsClientConfig
    if (constrained.includes(node.type) && msg.socketid) {
        // we are in a node type that allows for definition of specific clients,
        // and a client has been defined
        return true
    }
    return false
}

const getters = {
    // given a widget id, return the latest msg received
    msg (id) {
        return data[id]
    }
}

const setters = {
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
        if (!isScopedMessage(base, node, msg)) {
            data[node.id] = msg
        }
    },
    // given a widget id, and msg, store in an array of history of values
    // useful for charting widgets
    append (base, node, msg) {
        if (!isScopedMessage(base, node, msg)) {
            if (!data[node.id]) {
                data[node.id] = []
            }
            data[node.id].push(msg)
        }
    }
}

module.exports = {
    get: getters.msg,
    save: setters.save,
    append: setters.append,
    clear: setters.clear
}
