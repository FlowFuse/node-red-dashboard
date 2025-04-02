const { appendTopic } = require('../utils/index.js')

module.exports = function (RED) {
    function ButtonNode (config) {
        // create node in Node-RED
        RED.nodes.createNode(this, config)
        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        // backward compatibility
        if (typeof config.enableClick === 'undefined') {
            config.enableClick = true
        }

        // In-place upgrades - ensure properties are set
        if (typeof config.label === 'undefined') { config.label = config.title || 'gauge' }
        if (typeof config.labelType === 'undefined') { config.labelType = 'str' }

        const typedInputs = {
            label: { nodeProperty: 'label', nodePropertyType: 'labelType' }
        }
        const dynamicProperties = {
            label: true,
            icon: true,
            iconPosition: true,
            buttonColor: true,
            textColor: true,
            iconColor: true
        }

        const beforeSend = async function (msg) {
            let error = null
            let payload = null
            let payloadType = null

            msg._event = msg._event || { type: 'inject' }

            switch (msg._event.type) {
            case 'pointerup':
                payload = config.pointerupPayload
                payloadType = config.pointerupPayloadType
                break
            case 'pointerdown':
                payload = config.pointerdownPayload
                payloadType = config.pointerdownPayloadType
                break
            case 'click':
                payload = config.payload
                payloadType = config.payloadType
                break
            case 'inject':
                payload = config.payload
                payloadType = config.payloadType
                break
            default:
                payload = config.payload
                payloadType = config.payloadType
                break
            }

            if (payloadType === 'flow' || payloadType === 'global') {
                try {
                    const parts = RED.util.normalisePropertyExpression(payload)
                    if (parts.length === 0) {
                        throw new Error()
                    }
                    payload = RED.util.evaluateNodeProperty(payload, payloadType, node)
                } catch (err) {
                    node.warn('Invalid payload property expression - defaulting to node id')
                    payload = node.id
                    payloadType = 'str'
                }
            } else if (payloadType === 'date') {
                payload = Date.now()
            } else if (payloadType === 'num') {
                payload = Number(payload)
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
            msg.payload = payload
            if (!error) {
                return msg
            } else {
                node.error(error)
                return null
            }
        }

        const evts = {
            onAction: true,
            beforeSend,
            onInput: async function (msg) {
                if (config.emulateClick && config.enableClick) {
                    msg = await beforeSend(msg)

                    if (config.topic || config.topicType) {
                        msg = await appendTopic(RED, config, node, msg)
                    }

                    node.send(msg)
                }
            }
        }

        // inform the dashboard UI that we are adding this node
        if (group) {
            group.register(node, config, evts, { dynamicProperties, typedInputs })
        } else {
            node.error('No group configured')
        }
    }

    RED.nodes.registerType('ui-button', ButtonNode)
}
