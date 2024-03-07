module.exports = function (RED) {
    function ButtonGroupNode (config) {
        // create node in Node-RED
        RED.nodes.createNode(this, config)
        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const evts = {
            onChange: true
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
