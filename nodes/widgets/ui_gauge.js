// const statestore = require('../store/state.js')
// const { appendTopic } = require('../utils/index.js')

module.exports = function (RED) {
    function GaugeNode (config) {
        RED.nodes.createNode(this, config)
        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        // In-place upgrades - ensure properties are set
        if (typeof config.label === 'undefined') { config.label = config.title || 'gauge' }
        if (typeof config.labelType === 'undefined') { config.labelType = 'str' }
        if (typeof config.property === 'undefined') { config.property = 'payload' }
        if (typeof config.propertyType === 'undefined') { config.propertyType = 'msg' }
        config.title = '' // TODO: deprecated (remove in next major version)

        // register typed inputs
        const typedInputs = {
            value: { nodeProperty: 'property', nodePropertyType: 'propertyType' },
            label: { nodeProperty: 'label', nodePropertyType: 'labelType' }
        }
        // register dynamic props (ui_base will take care of storing these)
        const dynamicProperties = {
            label: true,
            icon: true,
            gtype: true,
            gstyle: true,
            min: true,
            max: true,
            segments: true,
            prefix: true,
            suffix: true,
            units: true
        }

        // ensure values are numerical, not strings
        config.min = Number(config.min)
        config.max = Number(config.max)
        config.sizeThickness = Number(config.sizeThickness)
        config.sizeGap = Number(config.sizeGap)
        config.sizeKeyThickness = Number(config.sizeKeyThickness)

        config.segments.forEach(segment => {
            segment.from = Number(segment.from)
        })

        // inform the dashboard UI that we are adding this node
        group.register(node, config, {}, { dynamicProperties, typedInputs })
    }
    RED.nodes.registerType('ui-gauge', GaugeNode)
}
