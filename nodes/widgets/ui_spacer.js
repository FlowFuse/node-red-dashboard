module.exports = function (RED) {
    function SpacerNode (config) {
        RED.nodes.createNode(this, config)
        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        // inform the dashboard UI that we are adding this node
        group.register(node, config)
    }
    RED.nodes.registerType('ui-spacer', SpacerNode)
}
