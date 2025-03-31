const datastore = require('../store/data.js')
const { appendTopic } = require('../utils/index.js')

module.exports = function (RED) {
    function SwitchNode (config) {
        // create node in Node-RED
        RED.nodes.createNode(this, config)

        const node = this
        node.status({})

        // In-place upgrades - ensure properties are set
        if (typeof config.label === 'undefined') { config.label = config.title || 'gauge' }
        if (typeof config.labelType === 'undefined') { config.labelType = 'str' }
        if (typeof config.property === 'undefined') { config.property = 'payload' }
        if (typeof config.propertyType === 'undefined') { config.propertyType = 'msg' }

        const typedInputs = {
            label: { nodeProperty: 'label', nodePropertyType: 'labelType' },
            payload: { nodeProperty: 'property', nodePropertyType: 'propertyType' }
        }
        const dynamicProperties = { label: true, layout: true, font: true, fontSize: true, color: true }

        const states = ['off', 'on']

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)
        const base = group.getBase()

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
            onChange: async function (msg, value, conn, id) {
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
                    datastore.save(base, node, msg)

                    const exclude = [conn.id] // sync this change to all clients with the same widget
                    base.emit('widget-sync:' + id, msg, node, exclude) // let all other connect clients now about the value change

                    // simulate Node-RED node receiving an input
                    node.send(msg)
                }
            },
            onInput: async function (msg, send) {
                let error = null
                const payload = msg.ui_update?.payload // at this point, payload has been evaluated in the base onInput handler and if present, will be added to the msg.ui_update object

                if (typeof payload === 'undefined') {
                    // may be setting class dynamically or something else that doesn't require a payload
                    datastore.save(group.getBase(), node, msg)
                    if (config.passthru) {
                        send(msg)
                    }
                } else {
                    if (typeof payload === 'object') {
                        if (JSON.stringify(payload) === JSON.stringify(on)) {
                            msg.payload = on
                        } else if (JSON.stringify(payload) === JSON.stringify(off)) {
                            msg.payload = off
                        } else {
                            // throw Node-RED error
                            error = 'Invalid payload value'
                        }
                    } else {
                        if (payload === true || payload === on) {
                            msg.payload = on
                        } else if (payload === false || payload === off) {
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
                            fill: (payload === true || payload === on) ? 'green' : 'red',
                            shape: 'ring',
                            text: (payload === true || payload === on) ? states[1] : states[0]
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
            }
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts, { dynamicProperties, typedInputs })
    }

    RED.nodes.registerType('ui-switch', SwitchNode)
}
