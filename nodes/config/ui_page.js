module.exports = function(RED) {
    /**
     * 
     * @param {*} config
     */
    function UIPageNode(config) {
        const node = this
        RED.nodes.createNode(node, config);
        
        // which UI are we rendering this page in
        var ui = RED.nodes.getNode(config.ui);
        node.log('UI Page Constructor')
        node.log(ui.type)

        /**
         * Function for widgets to register themselves with this page
         * Calls the parent UI Base "register" function and registers this page,
         * along with the widget
         * @param {*} widget 
         */
        node.register = function (widget) {
            const page = node
            ui.register(page, widget)
        }
    }
    RED.nodes.registerType("ui_page", UIPageNode);
}