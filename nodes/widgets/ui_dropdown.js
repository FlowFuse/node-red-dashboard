module.exports = function(RED) {
    function DropdownNode(config) {
        var node = this;

        // create node in Node-RED
        RED.nodes.createNode(this, config);

        // which group are we rendering this widget
        var group = RED.nodes.getNode(config.group);

        const evts = {
            onChange: true,
            onInput: function (msg, send) {
                send(msg)
            }
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }

    RED.nodes.registerType("ui-dropdown", DropdownNode);
};