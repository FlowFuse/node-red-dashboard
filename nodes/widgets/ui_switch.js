const datastore = require('../store/data.js')
const { appendTopic } = require('../utils/index.js')

module.exports = function (RED) {
    function SwitchNode (config) {
        // create node in Node-RED
        RED.nodes.createNode(this, config)

        const node = this
        node.status({})

        const states = ['off', 'on']

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const evts = {
            // runs on UI interaction
            // value = true | false from the ui-switch
            onChange: async function (msg, value) {
                // ensure we have latest instance of the widget's node
                const wNode = RED.nodes.getNode(node.id)

                node.status({
                    fill: value ? 'green' : 'red',
                    shape: 'ring',
                    text: value ? states[1] : states[0]
                })

                // retrieve the assigned on/off value
                const on = RED.util.evaluateNodeProperty(config.onvalue, config.onvalueType, wNode)
                const off = RED.util.evaluateNodeProperty(config.offvalue, config.offvalueType, wNode)
                msg.payload = value ? on : off

                if (config.topic || config.topicType) {
                    msg = await appendTopic(RED, config, node, msg)
                }

                datastore.save(group.getBase(), node, msg)

                // simulate Node-RED node receiving an input
                wNode.send(msg)
            },
            onInput: async function (msg, send) {
                let error = null
                // ensure we have latest instance of the widget's node
                const wNode = RED.nodes.getNode(node.id)

                // retrieve the assigned on/off value
                const on = RED.util.evaluateNodeProperty(config.onvalue, config.onvalueType, wNode)
                const off = RED.util.evaluateNodeProperty(config.offvalue, config.offvalueType, wNode)

                if (msg.payload === undefined) {
                    // may be setting class dynamically or something else that doesn't require a payload
                    datastore.save(group.getBase(), node, msg)
                    if (config.passthru) {
                        send(msg)
                    }
                } else {
                    if (typeof msg.payload === 'object') {
                        if (JSON.stringify(msg.payload) === JSON.stringify(on)) {
                            msg.payload = on
                        } else if (JSON.stringify(msg.payload) === JSON.stringify(off)) {
                            msg.payload = off
                        } else {
                            // throw Node-RED error
                            error = 'Invalid payload value'
                        }
                    } else {
                        if (msg.payload === true || msg.payload === on) {
                            msg.payload = on
                        } else if (msg.payload === false || msg.payload === off) {
                            msg.payload = off
                        } else {
                            // throw Node-RED error
                            error = 'Invalid payload value'
                        }
                    }
                    if (!error) {
                        // store the latest msg passed to node
                        datastore.save(group.getBase(), node, msg)

                        node.status({
                            fill: (msg.payload === true || msg.payload === on) ? 'green' : 'red',
                            shape: 'ring',
                            text: (msg.payload === true || msg.payload === on) ? states[1] : states[0]
                        })

                        if (config.passthru) {
                            send(msg)
                        }
                    } else {
                        const err = new Error(error)
                        err.type = 'warn'
                        throw err
                    }
                }
            },
            beforeSend: async function (msg) {
                // ensure we have latest instance of the widget's node
                const wNode = RED.nodes.getNode(node.id)

                msg = await appendTopic(RED, config, wNode, msg)
                return msg
            }
        }

        const on = RED.util.evaluateNodeProperty(config.onvalue, config.onvalueType, node)
        const off = RED.util.evaluateNodeProperty(config.offvalue, config.offvalueType, node)

        config.evaluated = {
            on,
            off
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }

    RED.nodes.registerType('ui-switch', SwitchNode)
}
