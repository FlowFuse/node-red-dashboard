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

        // backward compatibility
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
         * @param {*} group - the group we are registering
         * @param {*} widgetNode - the node we are registering
         * @param {*} widgetConfig - the nodes' configuration object
         * @param {*} widgetEvents - the widget event hooks
         * @param {Object} [widgetOptions] - additional configuration options for dynamic features the widget
         * @param {Object} [widgetOptions.dynamicProperties] - dynamic properties that the node will support
         * @param {import('../utils/index.js').NodeTypedInputs} [widgetOptions.typedInputs] - typed inputs that the node will support
         */
        node.register = function (group, widgetNode, widgetConfig, widgetEvents, widgetOptions) {
            const page = config
            if (ui) {
                ui.register(page, group, widgetNode, widgetConfig, widgetEvents, widgetOptions)
            } else {
                node.error(`Error registering Widget - ${widgetNode.name || widgetNode.id}. No parent ui-base node found for ui-page node: ${(page.name || page.id)}`)
            }
        }
        node.deregister = function (group, widgetNode) {
            const page = config
            if (ui) {
                ui.deregister(page, group, widgetNode)
            }
        }

        // Return the UI Base Node this page lives in
        node.getBase = function () {
            return RED.nodes.getNode(config.ui)
        }
    }
    RED.nodes.registerType('ui-page', UIPageNode)
}
