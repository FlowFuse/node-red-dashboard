const statestore = require('../store/state.js')

module.exports = function (RED) {
    function DropdownNode (config) {
        // create node in Node-RED
        RED.nodes.createNode(this, config)
        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const evts = {
            onChange: true,
            beforeSend: function (msg) {
                if (msg.ui_update) {
                    const update = msg.ui_update
                    if (update.options) {
                        // dynamically set "options" property
                        statestore.set(group.getBase(), node, msg, 'options', update.options)
                    }
                    if (typeof update.label !== 'undefined') {
                        // dynamically set "label" property
                        statestore.set(group.getBase(), node, msg, 'label', update.label)
                    }
                    if (typeof update.multiple !== 'undefined') {
                        // dynamically set "label" property
                        statestore.set(group.getBase(), node, msg, 'multiple', update.multiple)
                    }
                    if (typeof update.msgTrigger !== 'undefined') {
                        // dynamically set "msgTrigger" property
                        statestore.set(group.getBase(), node, msg, 'msgTrigger', update.msgTrigger)
                    }
                }
                if (msg.options) {
                    // backward compatibility support
                    statestore.set(group.getBase(), node, msg, 'options', msg.options)
                }
                return msg
            }
        }

        // inform the dashboard  UI that we are adding this node
        group.register(node, config, evts)
    }

    RED.nodes.registerType('ui-dropdown', DropdownNode)
}
