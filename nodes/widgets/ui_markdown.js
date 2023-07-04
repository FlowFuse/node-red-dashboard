module.exports = function(RED) {
    function MarkdownNode(config) {
        var node = this;

        RED.nodes.createNode(this, config);

        // which page are we rendering this widget
        var page = RED.nodes.getNode(config.page);

        // inform the dashboard UI that we are adding this node
        page.register(node, config)
    }
    RED.nodes.registerType("ui-markdown", MarkdownNode);
};