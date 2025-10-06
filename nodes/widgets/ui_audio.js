const datastore = require('../store/data.js')
const statestore = require('../store/state.js')

module.exports = function (RED) {
    function AudioNode (config) {
        const node = this
        let group
        let ui

        if (config.mode !== 'src' && config.mode !== 'tts') {
            config.mode = 'src'
        }
        const mode = config.mode

        RED.nodes.createNode(node, config)

        if (mode === 'src') {
            if (!config.group || config.group === '') {
                node.error('No group configured')
                return
            }
            // Need the group to render this widget
            group = RED.nodes.getNode(config.group)
        } else {
            if (!config.ui || config.ui === '') {
                node.error('No UI configured')
                return
            }
            ui = RED.nodes.getNode(config.ui)
        }

        const evts = {
            onAction: true,
            onInput: function (msg, send) {
                // store the latest msg passed to node, only if a source is supplied in the payload and this is a audio player mode node
                if (mode === 'src' && group && typeof msg.payload === 'string') {
                    datastore.save(group.getBase(), node, msg)
                }
                // only send msg on if we have passthru enabled
                if (config.passthru) {
                    send(msg)
                }
            },
            beforeSend: function (msg) {
                if (mode === 'src') {
                    if (msg.playback === 'play') {
                        const lastMsg = datastore.get(node.id)
                        // TODO zou eigenlijk de last message met een payload moeten zijn.
                        const src = lastMsg?.payload || config.src
                        if (typeof src !== 'string' || src.trim() === '') {
                            node.warn('Cannot play audio when no source has been specified')
                        }
                    }

                    if (msg.ui_update) {
                        const updates = msg.ui_update

                        if (updates) {
                            if (typeof updates.src !== 'undefined') {
                                // dynamically set "src" property
                                statestore.set(group.getBase(), node, msg, 'src', updates.src)
                            }
                            if (typeof updates.autoplay !== 'undefined') {
                                if (['on', 'off'].includes(updates.autoplay)) {
                                    // dynamically set "autoplay" property
                                    statestore.set(group.getBase(), node, msg, 'autoplay', updates.autoplay)
                                } else {
                                    node.error('Property msg.ui_update.autoplay should be "on" or "off"')
                                }
                            }
                            if (typeof updates.loop !== 'undefined') {
                                if (['on', 'off'].includes(updates.loop)) {
                                    // dynamically set "loop" property
                                    statestore.set(group.getBase(), node, msg, 'loop', updates.loop)
                                } else {
                                    node.error('Property msg.ui_update.loop should be "on" or "off"')
                                }
                            }
                            if (typeof updates.muted !== 'undefined') {
                                if (['on', 'off'].includes(updates.muted)) {
                                    // dynamically set "muted" property
                                    statestore.set(group.getBase(), node, msg, 'muted', updates.muted)
                                } else {
                                    node.error('Property msg.ui_update.muted should be "on" or "off"')
                                }
                            }
                        }
                    } else if (mode === 'tts') {
                        // lets clean up the datastore since there is no audio player involved
                        datastore.remove(node.id)
                    }
                }
                return msg
            }
        }

        // inform the dashboard UI that we are adding this node
        if (mode === 'src' && group) {
            group.register(node, config, evts)
        } else if (mode === 'tts' && ui) {
            ui.register(null, null, node, config, evts)
        } else {
            if (mode === 'src') {
                node.error(`Group '${config.group}' not found for ui_audio node`)
            } else if (mode === 'tts') {
                node.error(`UI '${config.ui}' not found for ui_audio node`)
            }
        }
    }
    RED.nodes.registerType('ui-audio', AudioNode)
}
