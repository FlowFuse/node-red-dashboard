const statestore = require('../store/state.js')

module.exports = function (RED) {
    function ProgressNode (config) {
        RED.nodes.createNode(this, config)
        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const beforeSend = function (msg) {
            // Handle dynamic properties
            const updates = msg.ui_update
            if (updates) {
                if (typeof updates.label !== 'undefined') {
                    statestore.set(group.getBase(), node, msg, 'label', updates.label)
                }
                if (typeof updates.color !== 'undefined') {
                    statestore.set(group.getBase(), node, msg, 'color', updates.color)
                }
            }
            return msg
        }

        // inform the dashboard UI that we are adding this node
        if (group) {
            group.register(node, config, {
                beforeSend
            })
        } else {
            node.error('No group configured')
        }
    }
    RED.nodes.registerType('ui-progress', ProgressNode)
}
