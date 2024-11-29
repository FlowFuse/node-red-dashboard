const statestore = require('../store/state.js')

module.exports = function (RED) {
    function AudioNode (config) {
        const node = this

        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const evts = {
            onAction: true,
            beforeSend: function (msg) {
                if (msg.ui_update) {
                    const updates = msg.ui_update

                    if (updates) {
                        if (typeof updates.src !== 'undefined') {
                            // dynamically set "src" property
                            statestore.set(group.getBase(), node, msg, 'src', updates.src)
                        }
                        if (typeof updates.autoplay !== 'undefined') {
                            if (['on', 'off'].includes(updates.autoplay)) {
                                // dynamically set "autoplay" property
                                statestore.set(group.getBase(), node, msg, 'autoplay', updates.autoplay)
                            } else {
                                node.error('Property msg.ui_update.autoplay should be "on" or "off"')
                            }
                        }
                        if (typeof updates.loop !== 'undefined') {
                            if (['on', 'off'].includes(updates.loop)) {
                                // dynamically set "loop" property
                                statestore.set(group.getBase(), node, msg, 'loop', updates.loop)
                            } else {
                                node.error('Property msg.ui_update.loop should be "on" or "off"')
                            }
                        }
                        if (typeof updates.muted !== 'undefined') {
                            if (['on', 'off'].includes(updates.muted)) {
                                // dynamically set "muted" property
                                statestore.set(group.getBase(), node, msg, 'muted', updates.muted)
                            } else {
                                node.error('Property msg.ui_update.muted should be "on" or "off"')
                            }
                        }
                    }
                }
                return msg
            }
        }

        // inform the dashboard UI that we are adding this node
        if (group) {
            group.register(node, config, evts)
        } else {
            node.error('No group configured')
        }
    }
    RED.nodes.registerType('ui-audio', AudioNode)
}
