const datastore = require('../store/data.js')

module.exports = function (RED) {
    function TextInputNode (config) {
        const node = this

        // create node in Node-RED
        RED.nodes.createNode(this, config)

        // this ndoe need to store content/value from UI
        node.value = null

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const evts = {
            onChange: true,
            onInput: function (msg, send) {
                // store the latest msg passed to node
                datastore.save(group.getBase(), node, msg)
                // only send msg on if we have passthru enabled
                if (config.passthru) {
                    send(msg)
                }
            }
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)

        node.on('close', async function (done) {
            done()
        })
    }

    RED.nodes.registerType('ui-text-input', TextInputNode)
}
