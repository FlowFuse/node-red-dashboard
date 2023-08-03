module.exports = function (RED) {
    /**
     *
     * @param {*} config
     */
    function UIPageNode (config) {
        const node = this
        RED.nodes.createNode(node, config)

        // which UI are we rendering this page in
        const ui = RED.nodes.getNode(config.ui)
        node.log('UI Page Constructor')

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
            const page = config
            ui.register(page, group, widgetNode, widgetConfig, widgetEvents)
        }
        node.deregister = function (group, widgetNode) {
            const page = config
            ui.deregister(page, group, widgetNode)
        }
    }
    RED.nodes.registerType('ui-page', UIPageNode)
}
