module.exports = function (RED) {
    function MarkdownNode (config) {
        const node = this

        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        // inform the dashboard UI that we are adding this node
        if (group) {
            group.register(node, config)
        } else {
            node.error('No group configured')
        }
    }
    RED.nodes.registerType('ui-markdown', MarkdownNode)
}
