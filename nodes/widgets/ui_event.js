const { addConnectionCredentials } = require('../utils/index.js')

module.exports = function (RED) {
    function EventNode (config) {
        const node = this

        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const ui = RED.nodes.getNode(config.ui)

        const evts = {
            onSocket: {
                'ui-event': function (conn, id, msg) {
                    const wNode = RED.nodes.getNode(node.id)
                    if (!wNode) {
                        console.log('ui-event node not found', id)
                    }
                    // possible to send to all ui-event nodes,
                    // or just a specific one specified by id
                    if ((wNode && id === node.id) || id === 'all') {
                        // this was sent by this particular node
                        msg = addConnectionCredentials(RED, msg, conn, ui)
                        wNode.send(msg)
                    }
                }
            }
        }

        // inform the dashboard UI that we are adding this node
        ui?.register(null, null, node, config, evts)

        node.on('close', function (removed, done) {
            if (removed) {
                // handle node being removed
                ui?.deregister(null, null, node)
            }
            done()
        })
    }
    RED.nodes.registerType('ui-event', EventNode)
}
