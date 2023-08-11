module.exports = function (RED) {
    function FormNode (config) {
        RED.nodes.createNode(this, config)

        const node = this

        const group = RED.nodes.getNode(config.group)
        if (!group) { return }

        const evts = {
            onAction: true,
            beforeSend: async function (msg) {
                // create form object here?
                console.log(msg)
                console.log(config.options)
                return msg
            }
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }
    RED.nodes.registerType('ui-form', FormNode)
}
