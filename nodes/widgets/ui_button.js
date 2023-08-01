module.exports = function (RED) {
    function ButtonNode (config) {
        const node = this

        // create node in Node-RED
        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const evts = {
            onAction: true,
            beforeSend: function (msg) {
                let error = null

                // retrieve the payload we're sending from this button
                let payloadType = config.payloadType
                let payload = config.payload

                if (payloadType === 'flow' || payloadType === 'global') {
                    try {
                        const parts = RED.util.normalisePropertyExpression(payload)
                        if (parts.length === 0) {
                            throw new Error()
                        }
                    } catch (err) {
                        node.warn('Invalid payload property expression - defaulting to node id')
                        payload = node.id
                        payloadType = 'str'
                    }
                } else if (payloadType === 'date') {
                    payload = Date.now()
                } else {
                    try {
                        payload = RED.util.evaluateNodeProperty(payload, payloadType, node)
                    } catch (err) {
                        error = err
                        if (payloadType === 'bin') {
                            node.error('Badly formatted buffer')
                        } else {
                            node.error(err, payload)
                        }
                    }
                }
                // retrieve the topic we're sending from this button
                if (!error) {
                    const topic = RED.util.evaluateNodeProperty(config.topic, config.topicType || 'str', node, msg)
                    msg.payload = payload
                    if (topic) {
                        msg.topic = topic
                    }
                    return msg
                } else {
                    return null
                }
            }
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }

    RED.nodes.registerType('ui-button', ButtonNode)
}
