const statestore = require('../store/state.js')

module.exports = function (RED) {
    function NotificationNode (config) {
        const node = this

        RED.nodes.createNode(this, config)

        // Which ui are we rendering this widget.
        // In contradiction to other ui nodes (which belong to a group), the notification node belongs to a ui instead.
        const ui = RED.nodes.getNode(config.ui)

        const evts = {
            onAction: true,
            beforeSend: function (msg) {
                if (msg.ui_update) {
                    const updates = msg.ui_update

                    const allowedPositions = ['top right', 'top center', 'top left', 'bottom right', 'bottom center', 'bottom left', 'center center']

                    if (updates) {
                        if (typeof updates.allowConfirm !== 'undefined') {
                            // dynamically set "allowConfirm" property
                            statestore.set(ui, node, msg, 'allowConfirm', updates.allowConfirm)
                        }
                        if (typeof updates.allowDismiss !== 'undefined') {
                            // dynamically set "allowDismiss" property
                            statestore.set(ui, node, msg, 'allowDismiss', updates.allowDismiss)
                        }
                        if (typeof updates.color !== 'undefined') {
                            // dynamically set "color" property
                            statestore.set(ui, node, msg, 'color', updates.color)
                        }
                        if (typeof updates.confirmText !== 'undefined') {
                            // dynamically set "confirmText" property
                            statestore.set(ui, node, msg, 'confirmText', updates.confirmText)
                        }
                        if (typeof updates.dismissText !== 'undefined') {
                            // dynamically set "dismissText" property
                            statestore.set(ui, node, msg, 'dismissText', updates.dismissText)
                        }
                        if (typeof updates.displayTime !== 'undefined') {
                            // dynamically set "displayTime" property
                            statestore.set(ui, node, msg, 'displayTime', updates.displayTime)
                        }
                        if (typeof updates.position !== 'undefined' && allowedPositions.includes(updates.position)) {
                            // dynamically set "position" property
                            statestore.set(ui, node, msg, 'position', updates.position)
                        }
                        if (typeof updates.raw !== 'undefined') {
                            // dynamically set "raw" property
                            statestore.set(ui, node, msg, 'raw', updates.raw)
                        }
                        if (typeof updates.showCountdown !== 'undefined') {
                            // dynamically set "showCountdown" property
                            statestore.set(ui, node, msg, 'showCountdown', updates.showCountdown)
                        }
                        // Note that update.close will NOT be stored in the data store,
                        // since it does not need to be remembered
                    }
                }
                return msg
            }
        }

        // inform the dashboard UI that we are adding this node
        ui.register(null, null, node, config, evts)
    }
    RED.nodes.registerType('ui-notification', NotificationNode)
}
