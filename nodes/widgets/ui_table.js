const datastore = require('../store/data.js')

module.exports = function (RED) {
    function TableNode (config) {
        const node = this

        // create node in Node-RED
        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)
        const base = group?.getBase() // Used for datastore
        config.maxrows = typeof config.maxrows === 'number' ? config.maxrows : parseInt(config.maxrows)
        if (isNaN(config.maxrows) || config.maxrows < 0) {
            config.maxrows = 0
        }

        if (config.columns && Array.isArray(config.columns)) {
            config.columns.forEach((col) => {
                // map older data where 'label' was used.
                if (typeof col.label !== 'undefined' && (typeof col.title === 'undefined' || col.title === '')) {
                    col.title = col.label
                }
            })
        } else {
            config.columns = undefined
        }

        if (['append', 'replace'].indexOf(config.action) === -1) {
            config.action = 'append'
        }

        // inform the dashboard UI that we are adding this node
        if (group) {
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
        } else {
            node.error('No group configured')
        }
    }

    RED.nodes.registerType('ui-table', TableNode)
}
