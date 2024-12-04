const statestore = require('../store/state.js')

module.exports = function (RED) {
    function SliderNode (config) {
        RED.nodes.createNode(this, config)
        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        this.pt = config.passthru
        this.state = [' ', ' ']

        const thumbLabel = config.thumbLabel
        if (thumbLabel === 'false') {
            config.thumbLabel = false
        } else if (thumbLabel === 'true') {
            config.thumbLabel = true
        }

        const showTicks = config.showTicks
        if (showTicks === 'false') {
            config.showTicks = false
        } else if (showTicks === 'true') {
            config.showTicks = true
        }

        node.status({})

        const evts = {
            onChange: true,
            beforeSend: function (msg) {
                // backward compatibility for older selection type

                if (typeof msg.payload !== 'undefined') {
                    if (!node.pt) {
                        node.state[0] = msg.payload
                        node.status({ shape: 'dot', fill: 'grey', text: node.state[0] + ' | ' + node.state[1] })
                    } else if (node._wireCount === 0) {
                        node.status({ shape: 'dot', fill: 'grey', text: msg.payload })
                    }
                }
                /**
                 * Dynamic Properties
                 * */
                const updates = msg.ui_update
                if (updates) {
                    if (typeof (updates.label) !== 'undefined') {
                        // dynamically set "label" property
                        statestore.set(group.getBase(), node, msg, 'label', updates.label)
                    }
                    if (typeof (updates.thumbLabel) !== 'undefined') {
                        statestore.set(group.getBase(), node, msg, 'thumbLabel', updates.thumbLabel)
                    }
                    if (typeof (updates.showTicks) !== 'undefined') {
                        statestore.set(group.getBase(), node, msg, 'showTicks', updates.showTicks)
                    }
                    if (typeof (updates.min) !== 'undefined') {
                        statestore.set(group.getBase(), node, msg, 'min', updates.min)
                    }
                    if (typeof (updates.step) !== 'undefined') {
                        statestore.set(group.getBase(), node, msg, 'step', updates.step)
                    }
                    if (typeof (updates.max) !== 'undefined') {
                        statestore.set(group.getBase(), node, msg, 'max', updates.max)
                    }
                    if (typeof (updates.iconPrepend) !== 'undefined') {
                        statestore.set(group.getBase(), node, msg, 'iconPrepend', updates.iconPrepend)
                    }
                    if (typeof (updates.iconAppend) !== 'undefined') {
                        statestore.set(group.getBase(), node, msg, 'iconAppend', updates.iconAppend)
                    }
                    if (typeof (updates.color) !== 'undefined') {
                        statestore.set(group.getBase(), node, msg, 'color', updates.color)
                    }
                    if (typeof (updates.colorTrack) !== 'undefined') {
                        statestore.set(group.getBase(), node, msg, 'colorTrack', updates.colorTrack)
                    }
                    if (typeof (updates.colorThumb) !== 'undefined') {
                        statestore.set(group.getBase(), node, msg, 'colorThumb', updates.colorThumb)
                    }
                    if (typeof (updates.showTextField) !== 'undefined') {
                        statestore.set(group.getBase(), node, msg, 'showTextField', updates.showTextField)
                    }
                }
                return msg
            }
        }

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }
    RED.nodes.registerType('ui-slider', SliderNode)
}
