module.exports = function(RED) {
    // var ui = require('../ui')(RED);

    function TextInputNode(config) {

        RED.nodes.createNode(this, config);
        var node = this;

        // this ndoe need to store content/value from UI
        console.log('node constructor')
        node.value = null

        // which page are we rendering this widget
        var page = RED.nodes.getNode(config.page);

        const evts = {
            onInput: function (msg, send) {
                send(msg)
            }
        }

        // inform the dashboard UI that we are adding this node
        page.register(node, config, evts)

        node.on("close", async function (done) {
            console.log('goodbye world')
            done()
        });
    }
    RED.nodes.registerType("ui-text-input", TextInputNode);
};