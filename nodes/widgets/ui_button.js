const statestore = require('../store/state.js')
const { appendTopic } = require('../utils/index.js')

module.exports = function (RED) {
    function ButtonNode (config) {
        // create node in Node-RED
        RED.nodes.createNode(this, config)
        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const beforeSend = async function (msg) {
            let error = null

            
            if (!(msg.pointerUp || msg.pointerDown || false)) {
                // retrieve the payload we're sending from this button
                let payloadType = config.payloadType
                let payload = config.payload
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
            }

            if (msg.pointerUp  || false) {
                let pointerupPayloadType = config.pointeruppayloadType
                let pointerupPayload = config.pointeruppayload

                if (pointerupPayloadType === 'flow' || pointerupPayloadType === 'global') {
                    try {
                        const parts = RED.util.normalisePropertyExpression(pointerupPayload)
                        if (parts.length === 0) {
                            throw new Error()
                        }
                        pointerupPayload = RED.util.evaluateNodeProperty(pointerupPayload, pointerupPayloadType, node)
                    } catch (err) {
                        node.warn('Invalid payload property expression - defaulting to node id')
                        pointerupPayload = node.id
                        pointerupPayloadType = 'str'
                    }
                } else if (pointerupPayloadType === 'date') {
                    pointerupPayload = Date.now()
                } else {
                    try {
                        pointerupPayload = RED.util.evaluateNodeProperty(pointerupPayload, pointerupPayloadType, node)
                    } catch (err) {
                        error = err
                        if (pointerupPayloadType === 'bin') {
                            node.error('Badly formatted buffer')
                        } else {
                            node.error(err, pointerupPayload)
                        }
                    }
                }
                msg.topic = 'pointerup'
                msg.pointerupPayload = payload
            }

            if (msg.pointerDown || false) {
                let pointerdownPayloadType = config.pointerdownpayloadType
                let pointerdownPayload = config.pointerdownpayload

                if (pointerdownPayloadType === 'flow' || pointerdownPayloadType === 'global') {
                    try {
                        const parts = RED.util.normalisePropertyExpression(pointerdownPayload)
                        if (parts.length === 0) {
                            throw new Error()
                        }
                        pointerdownPayload = RED.util.evaluateNodeProperty(pointerdownPayload, pointerdownPayloadType, node)
                    } catch (err) {
                        node.warn('Invalid payload property expression - defaulting to node id')
                        pointerdownPayload = node.id
                        pointerdownPayloadType = 'str'
                    }
                } else if (pointerdownPayloadType === 'date') {
                    pointerdownPayload = Date.now()
                } else {
                    try {
                        pointerdownPayload = RED.util.evaluateNodeProperty(pointerdownPayload, pointerdownPayloadType, node)
                    } catch (err) {
                        error = err
                        if (pointerdownPayloadType === 'bin') {
                            node.error('Badly formatted buffer')
                        } else {
                            node.error(err, pointerdownPayload)
                        }
                    }
                }
                msg.topic = 'pointerdown'
                msg.pointerdownPayload = payload
            }


            const updates = msg.ui_update

            if (updates) {
                // dynamic properties
                if (typeof updates.label !== 'undefined') {
                    // dynamically set "label" property
                    statestore.set(group.getBase(), node, msg, 'label', updates.label)
                }
                if (typeof updates.icon !== 'undefined') {
                    // dynamically set "icon" property
                    statestore.set(group.getBase(), node, msg, 'icon', updates.icon)
                }
                if (typeof updates.iconPosition !== 'undefined') {
                    // dynamically set "iconPosition" property
                    statestore.set(group.getBase(), node, msg, 'iconPosition', updates.iconPosition)
                }
                if (typeof updates.buttonColor !== 'undefined') {
                    // dynamically set "buttonColor" property
                    statestore.set(group.getBase(), node, msg, 'buttonColor', updates.buttonColor)
                }
                if (typeof updates.textColor !== 'undefined') {
                    // dynamically set "textColor" property
                    statestore.set(group.getBase(), node, msg, 'textColor', updates.textColor)
                }
                if (typeof updates.iconColor !== 'undefined') {
                    // dynamically set "iconColor" property
                    statestore.set(group.getBase(), node, msg, 'iconColor', updates.iconColor)
                }
            }

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
                if (config.emulateClick) {
                    msg = await beforeSend(msg)

                    if (config.topic || config.topicType) {
                        msg = await appendTopic(RED, config, node, msg)
                    }

                    node.send(msg)
                }
            },
        }

        // inform the dashboard UI that we are adding this node
        if (group) {
            group.register(node, config, evts)
        } else {
            node.error('No group configured')
        }
    }

    RED.nodes.registerType('ui-button', ButtonNode)
}
