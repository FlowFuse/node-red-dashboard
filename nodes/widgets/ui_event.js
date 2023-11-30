module.exports = function (RED) {
    function EventNode (config) {
        const node = this

        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const ui = RED.nodes.getNode(config.ui)

        const evts = {
            onSocket: {
                'ui-event': function (conn, id, evt, payload) {
                    const wNode = RED.nodes.getNode(node.id)
                    if (id === node.id) {
                        // this was sent by this particular node
                        wNode.send({
                            topic: evt,
                            payload,
                            socketid: conn.id,
                            socketip: conn.client.conn.remoteAddress
                        })
                    }
                }
            }
        }

        // inform the dashboard UI that we are adding this node
        ui.register(null, null, node, config, evts)
    }
    RED.nodes.registerType('ui-event', EventNode)
}
