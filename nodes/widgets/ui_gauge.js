module.exports = function (RED) {
    function GaugeNode (config) {
        RED.nodes.createNode(this, config)
        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const evts = {
            onChange: true
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }
    RED.nodes.registerType('ui-gauge', GaugeNode)
}
