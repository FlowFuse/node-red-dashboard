module.exports = function (RED) {
    function TemplateNode (config) {
        const node = this

        // create node in Node-RED
        RED.nodes.createNode(this, config)

        const evts = {
            onAction: true // TODO: think we need an onSend event for template nodes that matches up with a `widget-send` message
        }

        if (config.templateScope === 'local') {
            config.page = ''
            config.ui = ''
        } else if (config.templateScope === 'widget:page') {
            config.ui = ''
            config.group = ''
        } else if (config.templateScope === 'widget:ui') {
            config.page = ''
            config.group = ''
        } else if (config.templateScope === 'page:style') {
            config.ui = ''
            config.group = ''
        } else if (config.templateScope === 'site:style') {
            config.page = ''
            config.group = ''
        }

        // ensure we have a value for passthru (default to true)
        if (typeof config.passthru === 'undefined') {
            config.passthru = true
        }

        // which group are we rendering this widget
        if (config.group) {
            const group = RED.nodes.getNode(config.group)
            // inform the dashboard UI that we are adding this node
            group.register(node, config, evts)
        } else if (config.page) {
            const page = RED.nodes.getNode(config.page)
            // inform the dashboard UI that we are adding this node
            page.register(null, node, config, evts)
        } else if (config.ui) {
            const ui = RED.nodes.getNode(config.ui)
            // inform the dashboard UI that we are adding this node
            ui.register(null, null, node, config, evts)
        }
    }

    RED.nodes.registerType('ui-template', TemplateNode)
}
