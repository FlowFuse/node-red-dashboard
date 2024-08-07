module.exports = function (RED) {
    function NotificationNode (config) {
        const node = this

        RED.nodes.createNode(this, config)

        // which ui are we rendering this widget
        const ui = RED.nodes.getNode(config.ui)

        const evts = {
            onAction: true,
            beforeSend: function (msg) {
                if (msg.ui_update) {
                    const update = msg.ui_update
                    if (typeof update.title !== 'undefined') {
                        // dynamically set "title" property
                        statestore.set(group.getBase(), node, msg, 'title', update.title)
                    }
                    // Note that update.close will NOT be stored in the data store, 
                    // since it does not need to be remembered
                }
                return msg
            }
        }

        // inform the dashboard UI that we are adding this node
        ui.register(null, null, node, config, evts)
    }
    RED.nodes.registerType('ui-notification', NotificationNode)
}
