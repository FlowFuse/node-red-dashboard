const statestore = require('../store/state.js')

module.exports = function (RED) {
    function UiControlNode (config) {
        const node = this
        RED.nodes.createNode(this, config)

        // which ui does this widget belong to
        const ui = RED.nodes.getNode(config.ui)

        const evts = {
            onInput: function (msg, send, done) {
                console.log(msg)
                // handle the logic here of what to do when input is received

                if (typeof msg.payload !== 'object') { msg.payload = { tab: msg.payload } }
                // show/hide or enable/disable tabs
                if ('tabs' in msg.payload) {
                    ui.emit('ui-control', { tabs: msg.payload.tabs, socketid: msg.socketid })
                }
                // switch to tab name (or number)
                if ('tab' in msg.payload || 'page' in msg.payload) {
                    const page = msg.payload.page || msg.payload.tab
                    let pageFound = false
                    // check we have a valid tab/page name
                    RED.nodes.eachNode(function (n) {
                        if (n.type === 'ui-page') {
                            if (n.name === page) {
                                // send a message to the ui to switch to this tab
                                ui.emit('ui-control', { tab: page, socketid: msg.socketid })
                                pageFound = true
                            }
                        }
                    })
                    if (!pageFound) {
                        node.error("No page with the name '" + page + "' found")
                    }
                }
                // show or hide ui groups
                if ('group' in msg.payload) {
                    if ('hide' in msg.payload.group) {
                        // loop over the groups in this array

                        const groups = RED.nodes.filterNodes({ type: 'ui-group' })
                        console.log(groups)
                        // statestore.set(node.id, 'group', msg.payload.group.hide)
                    }
                    ui.emit('ui-control', { group: msg.payload.group, socketid: msg.socketid })
                }

                // send specific visible/hidden commands via SocketIO here,
                // so all logic stays server-side

                node.send({ payload: 'input' })
            }
        }

        // inform the dashboard UI that we are adding this node
        ui.register(null, null, node, config, evts)

        // this.events = config.events || 'all'

        // this.on('input', function (msg) {
        // })

        // const sendconnect = function (id, ip) {
        //     node.send({ payload: 'connect', socketid: id, socketip: ip })
        // }

        // const sendlost = function (id, ip) {
        //     node.send({ payload: 'lost', socketid: id, socketip: ip })
        // }

        // const sendchange = function (index, name, id, ip, p) {
        //     node.send({ payload: 'change', tab: index, name, socketid: id, socketip: ip, params: p })
        // }

        // const sendcollapse = function (group, state, id, ip) {
        //     node.send({ payload: 'group', group, open: state, socketid: id, socketip: ip })
        // }

        // if (node.events === 'connect') {
        //     ui.ev.on('newsocket', sendconnect)
        // } else if (node.events === 'change') {
        //     ui.ev.on('changetab', sendchange)
        //     ui.ev.on('collapse', sendcollapse)
        // } else {
        //     ui.ev.on('newsocket', sendconnect)
        //     ui.ev.on('changetab', sendchange)
        //     ui.ev.on('collapse', sendcollapse)
        //     ui.ev.on('endsocket', sendlost)
        // }

        // this.on('close', function () {
        //     if (node.events === 'connect') {
        //         ui.ev.removeListener('newsocket', sendconnect)
        //     } else if (node.events === 'change') {
        //         ui.ev.removeListener('changetab', sendchange)
        //         ui.ev.removeListener('collapse', sendcollapse)
        //     } else {
        //         ui.ev.removeListener('newsocket', sendconnect)
        //         ui.ev.removeListener('changetab', sendchange)
        //         ui.ev.removeListener('collapse', sendcollapse)
        //         ui.ev.removeListener('endsocket', sendlost)
        //     }
        // })
    }
    RED.nodes.registerType('ui-control', UiControlNode)
}
