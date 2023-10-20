module.exports = function (RED) {
    function EventNode (config) {
        const node = this

        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const ui = RED.nodes.getNode(config.ui)

        const evts = {
            onSocket: {
                'ui-event:$pageview': function (id, msg) {
                    console.log('ui-event:$pageview')
                    console.log(id, msg)
                },
                'ui-event:$pageleave': function (msg) {

                }
            }
        }

        // inform the dashboard UI that we are adding this node
        ui.register(null, null, node, config, evts)
    }
    RED.nodes.registerType('ui-event', EventNode)
}
