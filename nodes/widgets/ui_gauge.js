module.exports = function (RED) {
    function GaugeNode (config) {
        RED.nodes.createNode(this, config)
        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const evts = {
            onChange: true
        }

        // ensure values are numerical, not strings
        config.min = Number(config.min)
        config.max = Number(config.max)
        config.sizeThickness = Number(config.sizeThickness)
        config.sizeGap = Number(config.sizeGap)
        config.sizeKeyThickness = Number(config.sizeKeyThickness)

        config.segments.forEach(segment => {
            segment.from = Number(segment.from)
        })

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }
    RED.nodes.registerType('ui-gauge', GaugeNode)
}
