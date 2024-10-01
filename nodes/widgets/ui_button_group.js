const statestore = require('../store/state.js')

module.exports = function (RED) {
    function ButtonGroupNode (config) {
        // create node in Node-RED
        RED.nodes.createNode(this, config)
        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        // Keep the code of this function in sync with the client-side function
        function findOptionByValue (val) {
            const opt = config.options?.find(option => {
                if (typeof (val) === 'object') {
                    return (JSON.stringify(val) === JSON.stringify(option.value))
                } else {
                    return option.value === val
                }
            })
            if (opt) {
                return opt
            }
            return null
        }

        const evts = {
            onChange: true,
            beforeSend: function (msg) {
                if (typeof msg.payload !== 'undefined') {
                    const option = findOptionByValue(msg.payload)
                    if (option) {
                        node.status({ fill: 'blue', shape: 'dot', text: option.label || option.value })
                    }
                }

                if (msg.ui_update) {
                    const update = msg.ui_update
                    if (typeof update.options !== 'undefined') {
                        // dynamically set "options" property
                        statestore.set(group.getBase(), node, msg, 'options', update.options)
                    }
                    if (typeof update.label !== 'undefined') {
                        // dynamically set "label" property
                        statestore.set(group.getBase(), node, msg, 'label', update.label)
                    }
                }
                return msg
            }
        }

        // loop over the options and ensure we've got the correct types for each option
        config.options.forEach(option => {
            option.value = RED.util.evaluateNodeProperty(option.value, option.valueType, node)
        })

        // inform the dashboard UI that we are adding this node
        if (group) {
            group.register(node, config, evts)
        } else {
            node.error('No group configured')
        }
    }

    RED.nodes.registerType('ui-button-group', ButtonGroupNode)
}
