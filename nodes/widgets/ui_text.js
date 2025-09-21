const statestore = require('../store/state.js')
const { asyncEvaluateNodeProperty } = require('../utils/index.js')

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

        const beforeSend = async function (msg) {
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

            // Process the value using TypedInput configuration
            const processValue = async () => {
                const value = msg.payload // default to payload if evaluation fails

                if (config.valueType && config.value) {
                    const results = await asyncEvaluateNodeProperty(RED, config.value, config.valueType, node, msg)
                    msg.payload = results
                } else {
                    msg.payload = value
                }
            }

            try {
                await processValue()
            } catch (err) {
                node.warn('Error evaluating value property: ' + err.message)
                // msg.payload remains unchanged on error
            }

            return msg
        }

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)
        // inform the dashboard UI that we are adding this node
        if (group) {
            group.register(node, config, {
                beforeSend
            })
        } else {
            node.error('No group configured')
        }
    }

    RED.nodes.registerType('ui-text', TextNode)
}
