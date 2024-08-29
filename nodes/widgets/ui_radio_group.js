const statestore = require('../store/state.js')
const { appendTopic } = require('../utils/index.js')

module.exports = function (RED) {
    function RadioGroupNode (config) {
        // create node in Node-RED
        RED.nodes.createNode(this, config)

        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const evts = {
            onChange: true,
            beforeSend: async function (msg) {
                const updates = msg.ui_update
                if (typeof updates?.label !== 'undefined') {
                    // dynamically set "label" property
                    statestore.set(group.getBase(), node, msg, 'label', updates.label)
                }
                if (typeof updates?.columns !== 'undefined') {
                    // dynamically set "columns" property
                    statestore.set(group.getBase(), node, msg, 'columns', updates.columns)
                }
                if (updates?.options) {
                    // dynamically set "options" property
                    statestore.set(group.getBase(), node, msg, 'options', updates.options)
                }
                msg = await appendTopic(RED, config, node, msg)
                return msg
            }
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }

    RED.nodes.registerType('ui-radio-group', RadioGroupNode)
}
