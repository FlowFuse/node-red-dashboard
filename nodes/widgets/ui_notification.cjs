module.exports = function (RED) {
    function NotificationNode (config) {
        const node = this

        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const ui = RED.nodes.getNode(config.ui)

        // inform the dashboard UI that we are adding this node
        ui.register(null, null, node, config)
    }
    RED.nodes.registerType('ui-notification', NotificationNode)
}
