const statestore = require('../store/state.js')

module.exports = function (RED) {
    function TemplateNode (config) {
        const node = this

        // create node in Node-RED
        RED.nodes.createNode(this, config)

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

        // determine which group/page/ui are we rendering this widget
        let group, page, ui
        if (config.group) {
            group = RED.nodes.getNode(config.group)
        } else if (config.page) {
            page = RED.nodes.getNode(config.page)
        } else if (config.ui) {
            ui = RED.nodes.getNode(config.ui)
        }

        const evts = {
            onAction: true, // TODO: think we need an onSend event for template nodes that matches up with a `widget-send` message
            beforeSend: function (msg) {
                if (msg.ui_update) {
                    const update = msg.ui_update
                    if (typeof update.format !== 'undefined') {
                        // dynamically set "format" property
                        const parent = group || page || ui
                        statestore.set(parent.getBase(), node, msg, 'format', update.format)
                    }
                }
                return msg
            }
        }

        // inform the dashboard group/page/ui that we are adding this node
        if (group) {
            group.register(node, config, evts)
        } else if (page) {
            page.register(null, node, config, evts)
        } else if (ui) {
            ui.register(null, null, node, config, evts)
        }
    }

    RED.nodes.registerType('ui-template', TemplateNode)
}
