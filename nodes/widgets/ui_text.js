const statestore = require('../store/state.js')

module.exports = function (RED) {
    function TextNode (config) {
        const node = this

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

        const beforeSend = function (msg) {
            const updates = msg.ui_update
            if (updates) {
                if (typeof updates.label !== 'undefined') {
                    // dynamically set "label" property
                    statestore.set(group.getBase(), node, msg, 'label', updates.label)
                }
                if (typeof updates.layout !== 'undefined') {
                    // dynamically set "label" property
                    statestore.set(group.getBase(), node, msg, 'layout', updates.layout)
                }
                if (typeof updates.font !== 'undefined') {
                    // dynamically set "label" property
                    statestore.set(group.getBase(), node, msg, 'font', updates.font)
                }
                if (typeof updates.fontSize !== 'undefined') {
                    // dynamically set "label" property
                    statestore.set(group.getBase(), node, msg, 'fontSize', updates.fontSize)
                }
                if (typeof updates.color !== 'undefined') {
                    // dynamically set "label" property
                    statestore.set(group.getBase(), node, msg, 'color', updates.color)
                }
            }
            return msg
        }

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)
        // inform the dashboard UI that we are adding this node
        group.register(node, config, {
            beforeSend
        })
    }

    RED.nodes.registerType('ui-text', TextNode)
}
