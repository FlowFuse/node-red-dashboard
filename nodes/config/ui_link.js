module.exports = function (RED) {
    /**
     *
     * @param {*} config
     */
    function UILinkNode (config) {
        RED.nodes.createNode(this, config)
        const node = this

        node.on('close', function (removed, done) {
            node.deregister() // deregister self
            done()
        })

        // handle bad typing in Node-RED
        if (!('disabled' in config)) {
            // ensure we have a value
            config.disabled = false
        } else {
            // ensure we have a boolean
            config.disabled = (config.disabled === 'true' || config.disabled === true)
        }
        if (!('visible' in config)) {
            // ensure we have a value
            config.visible = true
        } else {
            // ensure we have a boolean
            config.visible = (config.visible === 'true' || config.visible === true)
        }

        const ui = RED.nodes.getNode(config.ui)

        // register self
        ui.register(config)

        /**
         * Function for widgets to register themselves with this page
         * Calls the parent UI Base "register" function and registers this page,
         * along with the widget
         * @param {*} widget
         */
        node.register = function (group, widgetNode, widgetConfig, widgetEvents) {
            const link = config
            if (ui) {
                ui.register(link, group, widgetNode, widgetConfig, widgetEvents)
            } else {
                node.error(`Error registering Widget - ${widgetNode.name || widgetNode.id}. No parent ui-base node found for ui-link node: ${(link.name || link.id)}`)
            }
        }
        node.deregister = function (group, widgetNode) {
            const link = config
            if (ui) {
                ui.deregister(link, group, widgetNode)
            }
        }

        // Return the UI Base Node this page lives in
        node.getBase = function () {
            return RED.nodes.getNode(config.ui)
        }
    }
    RED.nodes.registerType('ui-link', UILinkNode)
}
