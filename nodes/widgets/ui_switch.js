module.exports = function(RED) {
    function SwitchNode(config) {
        // create node in Node-RED
        RED.nodes.createNode(this, config);

        var node = this;
        node.status({});

        const states = ['off', 'on']

        // which group are we rendering this widget
        var group = RED.nodes.getNode(config.group);

        const evts = {
            // runs on UI interaction
            onChange: function (value) {
                // ensure we have latest instance of the widget's node
                const wNode = RED.nodes.getNode(node.id);
                const msg = wNode._msg || {}
                
                node.status({
                    fill: value ? "green" : "red",
                    shape: 'ring',
                    text: value ? states[1] : states[0]
                })

                // retrieve the assigned on/off value
                const on = RED.util.evaluateNodeProperty(config.onvalue, config.onvalueType, wNode)
                const off = RED.util.evaluateNodeProperty(config.offvalue, config.offvalueType, wNode)
                msg.payload = value ? on : off

                wNode._msg = msg

                // simulate Node-RED node receiving an input
                wNode.send(msg)
            },
            onInput: function (msg, send) {
                var error = null
                // ensure we have latest instance of the widget's node
                const wNode = RED.nodes.getNode(node.id);
                
                // retrieve the assigned on/off value
                const on = RED.util.evaluateNodeProperty(config.onvalue, config.onvalueType, wNode)
                const off = RED.util.evaluateNodeProperty(config.offvalue, config.offvalueType, wNode)
                if (msg.payload === true || msg.payload === on) {
                    msg.payload = on
                } else if (msg.payload === false || msg.payload === off) {
                    msg.payload = off
                } else {
                    // throw Node-RED error
                    error = 'Invalid payload value'
                }
                if (!error) {
                    node.status({
                        fill: msg.payload ? "green" : "red",
                        shape: 'ring',
                        text: msg.payload ? states[1] : states[0]
                    })

                    send(msg)
                } else {
                    node.error(error)
                }
            }
        }

        const on = RED.util.evaluateNodeProperty(config.onvalue, config.onvalueType, node)
        const off = RED.util.evaluateNodeProperty(config.offvalue, config.offvalueType, node)

        config.evaluated = {
            on: on,
            off: off
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }

    RED.nodes.registerType("ui-switch", SwitchNode);
};