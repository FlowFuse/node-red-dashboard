module.exports = function (RED) {
    function TextNode (config) {
        const node = this
        // In-place upgrades - ensure properties are set
        if (typeof config.property === 'undefined') { config.property = 'payload' }
        if (typeof config.propertyType === 'undefined') { config.propertyType = 'msg' }
        if (typeof config.label === 'undefined') { config.label = 'text' }
        if (typeof config.labelType === 'undefined') { config.labelType = 'str' }

        const typedInputs = {
            payload: { nodeProperty: 'property', nodePropertyType: 'propertyType' },
            label: { nodeProperty: 'label', nodePropertyType: 'labelType' }
        }
        const dynamicProperties = { label: true, layout: true, font: true, fontSize: true, color: true }

        RED.nodes.createNode(this, config)

        let style = ''
        if (config.style) {
            if (config.color) {
                style += `color: ${config.color};`
            }
            if (config.fontSize) {
                style += `font-size: ${config.fontSize}px;`
                style += `line-height: ${config.fontSize}px;`
            }
            if (config.font) {
                style += `font-family: ${config.font};`
            }
            config.style = style
        }

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)
        // inform the dashboard UI that we are adding this node
        group.register(node, config, {}, { dynamicProperties, typedInputs })
    }

    RED.nodes.registerType('ui-text', TextNode)
}
