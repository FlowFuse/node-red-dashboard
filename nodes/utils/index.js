function asyncEvaluateNodeProperty (RED, value, type, node, msg) {
    return new Promise(function (resolve, reject) {
        RED.util.evaluateNodeProperty(value, type, node, msg, function (e, r) {
            if (e) {
                reject(e)
            } else {
                resolve(r)
            }
        })
    })
}

async function appendTopic (RED, config, wNode, msg) {
    // populate topic if the node specifies one
    if (config.topic || config.topicType) {
        try {
            msg.topic = await asyncEvaluateNodeProperty(RED, config.topic, config.topicType || 'str', wNode, msg) || ''
        } catch (_err) {
            // do nothing
            console.error(_err)
        }
    }

    // ensure we have a topic property in the msg, even if it's an empty string
    if (!('topic' in msg)) {
        msg.topic = ''
    }

    return msg
}

/**
 * Evaluates the property/propertyType and sets ui_payload in the message object
 * This leaves the original payload untouched
 * This permits an TypedInput widget to be used to set the payload
 * @param {*} RED - The RED object
 * @param {Object} config - The node configuration
 * @param {Object} wNode - The node object
 * @param {Object} msg - The message object
 * @returns {Object} - The updated message object
 */
async function updatePayload (RED, config, wNode, msg) {
    if (config.propertyType && config.property) {
        try {
            msg.ui_payload = await asyncEvaluateNodeProperty(RED, config.property, config.propertyType || 'msg', wNode, msg) || ''
        } catch (_err) {
            // do nothing
            console.error(_err)
        }
    }
    return msg
}

/**
 * Adds socket/client data to a msg payload, if enabled
 *
 */
function addConnectionCredentials (RED, msg, conn, config) {
    if (config.includeClientData) {
        if (!msg._client) {
            msg._client = {}
        }
        RED.plugins.getByType('node-red-dashboard-2').forEach(plugin => {
            if (plugin.hooks?.onAddConnectionCredentials && msg) {
                msg = plugin.hooks.onAddConnectionCredentials(conn, msg)
            }
        })
        msg._client = {
            ...msg._client,
            ...{
                socketId: conn.id,
                socketIp: conn.handshake?.address
            }
        }
    }
    return msg
}

module.exports = {
    asyncEvaluateNodeProperty,
    appendTopic,
    addConnectionCredentials,
    updatePayload
}
