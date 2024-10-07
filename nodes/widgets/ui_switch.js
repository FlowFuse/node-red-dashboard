const datastore = require('../store/data.js')
const statestore = require('../store/state.js')
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

        // retrieve the assigned on/off values
        const on = RED.util.evaluateNodeProperty(config.onvalue, config.onvalueType, node)
        const off = RED.util.evaluateNodeProperty(config.offvalue, config.offvalueType, node)

        config.evaluated = {
            on,
            off
        }

        const evts = {
            // runs on UI interaction
            // value = true | false from the ui-switch
            onChange: async function (msg, value) {
                msg.payload = value ? on : off

                if (config.topic || config.topicType) {
                    msg = await appendTopic(RED, config, node, msg)
                }

                if (!config.passthru && config.decouple) {
                    node.send(msg)
                } else {
                    node.status({
                        fill: value ? 'green' : 'red',
                        shape: 'ring',
                        text: value ? states[1] : states[0]
                    })
                    datastore.save(group.getBase(), node, msg)

                    // simulate Node-RED node receiving an input
                    node.send(msg)
                }
            },
            onInput: async function (msg, send) {
                let error = null

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
                const updates = msg.ui_update
                if (updates) {
                    if (typeof updates.label !== 'undefined') {
                        // dynamically set "label" property
                        statestore.set(group.getBase(), node, msg, 'label', updates.label)
                    }
                    if (typeof updates.clickableArea !== 'undefined') {
                        // dynamically set "clickableArea" property
                        statestore.set(group.getBase(), node, msg, 'clickableArea', updates.clickableArea)
                    }
                    if (typeof updates.passthru !== 'undefined') {
                        // dynamically set "passthru" property
                        statestore.set(group.getBase(), node, msg, 'passthru', updates.passthru)
                    }
                    if (typeof updates.decouple !== 'undefined') {
                        // dynamically set "decouple" property
                        statestore.set(group.getBase(), node, msg, 'decouple', updates.decouple)
                    }
                    if (typeof updates.oncolor !== 'undefined') {
                        // dynamically set "oncolor" property
                        statestore.set(group.getBase(), node, msg, 'oncolor', updates.oncolor)
                    }
                    if (typeof updates.offcolor !== 'undefined') {
                        // dynamically set "offcolor" property
                        statestore.set(group.getBase(), node, msg, 'offcolor', updates.offcolor)
                    }
                    if (typeof updates.onicon !== 'undefined') {
                        // dynamically set "onicon" property
                        statestore.set(group.getBase(), node, msg, 'onicon', updates.onicon)
                    }
                    if (typeof updates.officon !== 'undefined') {
                        // dynamically set "officon" property
                        statestore.set(group.getBase(), node, msg, 'officon', updates.officon)
                    }
                    if (typeof updates.layout !== 'undefined') {
                        // dynamically set "layout" property
                        statestore.set(group.getBase(), node, msg, 'layout', updates.layout)
                    }
                }

                msg = await appendTopic(RED, config, node, msg)
                return msg
            }
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }

    RED.nodes.registerType('ui-switch', SwitchNode)
}
