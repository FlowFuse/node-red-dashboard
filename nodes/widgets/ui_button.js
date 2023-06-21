module.exports = function(RED) {
    function ButtonNode(config) {
        var node = this;

        // create node in Node-RED
        RED.nodes.createNode(this, config);

        // which page are we rendering this widget
        var page = RED.nodes.getNode(config.page);

        const evts = {
            onAction: true,
            onInput: function (msg, send) {
                send(msg)
            }
        }

        // inform the dashboard UI that we are adding this node
        page.register(node, config, evts)
    }

    RED.nodes.registerType("ui-button", ButtonNode);
};