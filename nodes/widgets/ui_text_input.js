const datastore = require('../store/data.js')
const { applyUpdates } = require('../utils/index.js')

module.exports = function (RED) {
    function TextInputNode (config) {
        // In-place upgrades - ensure properties are set
        if (typeof config.label === 'undefined') { config.label = 'text' }
        if (typeof config.labelType === 'undefined') { config.labelType = 'str' }

        const node = this

        const typedInputs = {
            label: { nodeProperty: 'label', nodePropertyType: 'labelType' }
        }
        // as part of registration instead
        const dynamicProperties = {
            label: true,
            mode: true,
            clearable: true,
            icon: true,
            iconPosition: true,
            iconInnerPosition: true
        }

        RED.nodes.createNode(node, config)

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const evts = {
            beforeSend: async function (msg) {
                msg = await applyUpdates(RED, node, msg)
                return msg
            },
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
        group.register(node, config, evts, { dynamicProperties, typedInputs })

        node.on('close', async function (done) {
            done()
        })
    }

    RED.nodes.registerType('ui-text-input', TextInputNode)
}
