module.exports = function (RED) {
    function TableNode (config) {
        const node = this

        // create node in Node-RED
        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        config.maxrows = parseInt(config.maxrows) || 0

        if (config.columns) {
            config.columns.map((col) => {
                // map older data where 'label' was used.
                return {
                    title: col.title || col.label,
                    key: col.key
                }
            })
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config)
    }

    RED.nodes.registerType('ui-table', TableNode)
}
