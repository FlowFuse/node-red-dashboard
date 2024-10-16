const datastore = require('../store/data.js')

module.exports = function (RED) {
    function TableNode (config) {
        const node = this

        // create node in Node-RED
        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)
        const base = group.getBase() // Used for datastore

        config.maxrows = parseInt(config.maxrows) || 0

        if (config.columns) {
            config.columns.map((col) => {
                // map older data where 'label' was used.
                return {
                    title: col.title || col.label,
                    key: col.key,
                    keyType: col.keyType || 'key',
                    type: col.type,
                    width: col.width,
                    align: col.align
                }
            })
        }

        if (!config.action || typeof config.action === 'undefined') {
            config.action = 'append'
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, {
            onAction: true,
            onInput: function (msg) {
                const existingData = datastore.get(node.id) || []
                const formatPayload = (value) => {
                    if (value !== null && typeof value !== 'undefined') {
                        // push object into array if user sends object instead of array
                        if (typeof value === 'object' && !Array.isArray(value)) {
                            return [value]
                        }
                    }
                    return value
                }
                let payload = formatPayload(msg?.payload)
                // check if the action is to append records
                if (config.action === 'append') {
                    payload = payload && payload.length > 0 ? [...existingData.payload || [], ...payload || []] : payload
                }

                datastore.save(base, node, {
                    ...msg,
                    payload
                })
            }
        })
    }

    RED.nodes.registerType('ui-table', TableNode)
}
