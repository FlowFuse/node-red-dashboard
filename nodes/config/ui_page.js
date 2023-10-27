module.exports = function (RED) {
    /**
     *
     * @param {*} config
     */
    function UIPageNode (config) {
        RED.nodes.createNode(this, config)
        const node = this

        node.on('close', function (removed, done) {
            node.deregister() // deregister self
            done()
        })

        /**
         * Function for widgets to register themselves with this page
         * Calls the parent UI Base "register" function and registers this page,
         * along with the widget
         * @param {*} widget
         */
        node.register = function (group, widgetNode, widgetConfig, widgetEvents) {
            const ui = RED.nodes.getNode(config.ui)
            const page = config
            if (ui) {
                ui.register(page, group, widgetNode, widgetConfig, widgetEvents)
            } else {
                node.error(`Error registering Widget - ${widgetNode.name || widgetNode.id}. No parent ui-base node found for ui-page node: ${(page.name || page.id)}`)
            }
        }
        node.deregister = function (group, widgetNode) {
            const ui = RED.nodes.getNode(config.ui)
            const page = config
            if (ui) {
                ui.deregister(page, group, widgetNode)
            }
        }
    }
    RED.nodes.registerType('ui-page', UIPageNode)
}
