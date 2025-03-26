const datastore = require('../store/data.js')

module.exports = function (RED) {
    function NumberInputNode (config) {
        const node = this

        // create node in Node-RED
        RED.nodes.createNode(this, config)

        // In-place upgrades - ensure properties are set
        if (typeof config.label === 'undefined') { config.label = 'number' }
        if (typeof config.labelType === 'undefined') { config.labelType = 'str' }
        if (typeof config.property === 'undefined') { config.property = 'payload' }
        if (typeof config.propertyType === 'undefined') { config.propertyType = 'msg' }

        const typedInputs = {
            label: { nodeProperty: 'label', nodePropertyType: 'labelType' },
            payload: { nodeProperty: 'property', nodePropertyType: 'propertyType' }
        }
        const dynamicProperties = {
            label: true,
            clearable: true,
            icon: true,
            iconPosition: true,
            iconInnerPosition: true,
            spinner: true
        }

        // this node need to store content/value from UI
        node.value = null

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const evts = {
            onChange: true,
            onInput: function (msg, send) {
                // store the latest msg passed to node
                datastore.save(group.getBase(), node, msg)
                // only send msg on if we have passthru enabled
                if (config.passthru) {
                    send(msg)
                }
            }
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts, { dynamicProperties, typedInputs })

        node.on('close', async function (done) {
            done()
        })
    }

    RED.nodes.registerType('ui-number-input', NumberInputNode)
}
