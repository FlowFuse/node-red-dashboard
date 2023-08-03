module.exports = function (RED) {
    function TemplateNode (config) {
        const node = this

        // create node in Node-RED
        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)
        const evts = {
            onAction: true // TODO: think we need an onSend event for template nodes that matches up with a `widget-send` message
        }
        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }

    RED.nodes.registerType('ui-template', TemplateNode)
}
