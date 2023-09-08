module.exports = function (RED) {
    function SliderNode (config) {
        RED.nodes.createNode(this, config)
        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        this.pt = config.passthru
        this.state = [' ', ' ']

        node.status({})

        const evts = {
            onChange: true,
            beforeSend: function (msg) {
                if (!node.pt) {
                    node.state[0] = msg.payload
                    node.status({ shape: 'dot', fill: 'grey', text: node.state[0] + ' | ' + node.state[1] })
                } else if (node._wireCount === 0) {
                    node.status({ shape: 'dot', fill: 'grey', text: msg.payload })
                }
                return msg
            }
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }
    RED.nodes.registerType('ui-slider', SliderNode)
}
