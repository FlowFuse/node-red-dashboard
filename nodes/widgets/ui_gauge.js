const statestore = require('../store/state.js')
const { appendTopic } = require('../utils/index.js')

module.exports = function (RED) {
    function GaugeNode (config) {
        RED.nodes.createNode(this, config)
        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const evts = {
            beforeSend: async function (msg) {
                const updates = msg.ui_update
                if (updates) {
                    const hasLabelKey = Object.keys(updates).includes('label')
                    const hasTitleKey = Object.keys(updates).includes('title')

                    if (!hasLabelKey && hasTitleKey) {
                        updates.label = updates.title
                    }

                    if (typeof updates.label !== 'undefined') {
                        // dynamically set "label" property
                        statestore.set(group.getBase(), node, msg, 'label', updates.label)
                    }
                    if (typeof updates.gtype !== 'undefined') {
                        // dynamically set "gauge type" property
                        statestore.set(group.getBase(), node, msg, 'gtype', updates.gtype)
                    }
                    if (typeof updates.gstyle !== 'undefined') {
                        // dynamically set "gauge style" property
                        statestore.set(group.getBase(), node, msg, 'gstyle', updates.gstyle)
                    }
                    if (typeof updates.prefix !== 'undefined') {
                        // dynamically set "prefix" property
                        statestore.set(group.getBase(), node, msg, 'prefix', updates.prefix)
                    }
                    if (typeof updates.suffix !== 'undefined') {
                        // dynamically set "suffix" property
                        statestore.set(group.getBase(), node, msg, 'suffix', updates.suffix)
                    }
                    if (typeof updates.units !== 'undefined') {
                        // dynamically set "units" property
                        statestore.set(group.getBase(), node, msg, 'units', updates.units)
                    }
                    if (typeof updates.icon !== 'undefined') {
                        // dynamically set "icon" property
                        statestore.set(group.getBase(), node, msg, 'icon', updates.icon)
                    }
                    if (typeof updates.segments !== 'undefined') {
                        // dynamically set "segments" property
                        statestore.set(group.getBase(), node, msg, 'segments', updates.segments)
                    }
                    if (typeof updates.min !== 'undefined') {
                        // dynamically set "min" property
                        statestore.set(group.getBase(), node, msg, 'min', updates.min)
                    }
                    if (typeof updates.max !== 'undefined') {
                        // dynamically set "max" property
                        statestore.set(group.getBase(), node, msg, 'max', updates.max)
                    }
                }
                msg = await appendTopic(RED, config, node, msg)
                return msg
            }
        }

        // ensure values are numerical, not strings
        config.min = Number(config.min)
        config.max = Number(config.max)
        config.sizeThickness = Number(config.sizeThickness)
        config.sizeGap = Number(config.sizeGap)
        config.sizeKeyThickness = Number(config.sizeKeyThickness)

        config.segments.forEach(segment => {
            segment.from = Number(segment.from)
        })

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }
    RED.nodes.registerType('ui-gauge', GaugeNode)
}
