module.exports = function (RED) {
    function NotificationNode (config) {
        const node = this
        config.passthru = false // prevent default passthru by setting it explicity to `false`. The notification itself will send msg on timeout, dismissal or confirmation!

        RED.nodes.createNode(this, config)
        // Which ui are we rendering this widget.
        // In contradiction to other ui nodes (which belong to a group), the notification node belongs to a ui instead.
        const ui = RED.nodes.getNode(config.ui)

        const evts = {
            onAction: true
        }

        const dynamicProperties = {
            allowConfirm: true,
            allowDismiss: true,
            color: true,
            confirmText: true,
            dismissText: true,
            displayTime: true,
            position: true,
            raw: true,
            showCountdown: true
        }
        const typedInputs = {
            message: { nodeProperty: 'message', nodePropertyType: 'messageType' }
        }

        // inform the dashboard UI that we are adding this node
        // function register (page, group, widgetNode, widgetConfig, widgetEvents, widgetOptions) {
        ui.register(null, null, node, config, evts, { dynamicProperties, typedInputs })
    }
    RED.nodes.registerType('ui-notification', NotificationNode)
}
