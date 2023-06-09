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
        console.log('UI Page Constructor')
        console.log(ui.type)
    }
    RED.nodes.registerType("ui_page", UIPageNode);
}