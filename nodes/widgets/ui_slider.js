const { applyUpdates } = require('../utils/index.js')

module.exports = function (RED) {
    function SliderNode (config) {
        RED.nodes.createNode(this, config)
        const node = this

        // In-place upgrades - ensure properties are set
        if (typeof config.property === 'undefined') { config.property = 'payload' }
        if (typeof config.propertyType === 'undefined') { config.propertyType = 'msg' }
        if (typeof config.label === 'undefined') { config.label = 'slider' }
        if (typeof config.labelType === 'undefined') { config.labelType = 'str' }

        const typedInputs = {
            payload: { nodeProperty: 'property', nodePropertyType: 'propertyType' },
            label: { nodeProperty: 'label', nodePropertyType: 'labelType' }
        }
        const dynamicProperties = {
            label: true,
            thumbLabel: true,
            showTicks: true,
            min: true,
            step: true,
            max: true,
            iconPrepend: true,
            iconAppend: true,
            color: true,
            colorTrack: true,
            colorThumb: true,
            showTextField: true
        }

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        this.pt = config.passthru
        this.state = [' ', ' ']

        const thumbLabel = config.thumbLabel
        if (thumbLabel === 'false') {
            config.thumbLabel = false
        } else if (thumbLabel === 'true') {
            config.thumbLabel = true
        }

        const showTicks = config.showTicks
        if (showTicks === 'false') {
            config.showTicks = false
        } else if (showTicks === 'true') {
            config.showTicks = true
        }

        node.status({})

        const evts = {
            onChange: true,
            beforeSend: async function (msg) {
                // backward compatibility for older selection type

                if (typeof msg.payload !== 'undefined') {
                    if (!node.pt) {
                        node.state[0] = msg.payload
                        node.status({ shape: 'dot', fill: 'grey', text: node.state[0] + ' | ' + node.state[1] })
                    } else if (node._wireCount === 0) {
                        node.status({ shape: 'dot', fill: 'grey', text: msg.payload })
                    }
                }
                msg = await applyUpdates(RED, node, msg)
                return msg
            }
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts, { dynamicProperties, typedInputs })
    }
    RED.nodes.registerType('ui-slider', SliderNode)
}
