const datastore = require('../store/data.js')
const statestore = require('../store/state.js')
const { getTopic } = require('../utils/index.js')

module.exports = function (RED) {
    function FormNode (config) {
        config.passthru = false
        RED.nodes.createNode(this, config)

        const node = this

        const group = RED.nodes.getNode(config.group)
        if (!group) { return }

        const evts = {
            onAction: true,
            beforeSend: async function (msg) {
                if (msg?._event === 'submit') {
                    if (config.topic || config.topicType) {
                        const dsMsg = datastore.get(node.id)
                        const topic = await getTopic(RED, config, node, dsMsg)
                        msg.topic = topic ?? ''
                    }
                }
                if (msg.ui_update) {
                    const update = msg.ui_update
                    if (typeof update.label !== 'undefined') {
                        // dynamically set "label" property
                        statestore.set(group.getBase(), node, msg, 'label', update.label)
                    }
                    if (typeof update.options !== 'undefined') {
                        // todo: sanity check options is valid format?

                        // dynamically set "options" property
                        statestore.set(group.getBase(), node, msg, 'options', update.options)
                    }
                    if (typeof update.dropdownOptions !== 'undefined') {
                        // todo: sanity check dropdownOptions is valid format?

                        // dynamically set "dropdownOptions" property
                        statestore.set(group.getBase(), node, msg, 'dropdownOptions', update.dropdownOptions)
                    }
                }
                return msg
            }
        }

        // inform the dashboard UI that we are adding this node
        if (group) {
            group.register(node, config, evts)
        } else {
            node.error('No group configured')
        }
    }
    RED.nodes.registerType('ui-form', FormNode)
}
