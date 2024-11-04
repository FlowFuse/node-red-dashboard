const statestore = require('../store/state.js')

const { addConnectionCredentials } = require('../utils/index.js')

module.exports = function (RED) {
    function UiControlNode (config) {
        const node = this
        RED.nodes.createNode(this, config)

        // which ui does this widget belong to
        const ui = RED.nodes.getNode(config.ui)

        function updateStore (all, items, msg, prop, value) {
            items.forEach(function (item) {
                const i = all[item]
                if (i) {
                    // update the state store for each page
                    statestore.set(ui, i, msg, prop, value)
                } else {
                    node.error("No item with the name '" + item + "' found", msg)
                }
            })
        }

        function emit (msg) {
            ui.emit('ui-control:' + node.id, msg, node)
        }

        const evts = {
            onInput: function (msg, send, done) {
                const wNode = RED.nodes.getNode(node.id)
                // handle the logic here of what to do when input is received

                if (typeof msg.payload !== 'object') {
                    msg.payload = { page: msg.payload }
                }

                // switch to tab name (or number)
                if ('tab' in msg.payload || 'page' in msg.payload) {
                    let page = msg.payload.page || msg.payload.tab

                    page = (page === undefined) ? '' : page

                    if (page === '-1' || page === '+1' || typeof (page) === 'number' || page === '') {
                    // special case for -1 and +1 to switch to previous/next tab
                    // number to pick specific index
                    // "" to refresh the page
                    // ensure consistency in payload format
                        msg.payload.page = page
                        emit(msg)
                    } else {
                        let pageFound = false
                        // check we have a valid tab/page name
                        RED.nodes.eachNode(function (n) {
                            if (n.type === 'ui-page') {
                                if (n.name === page) {
                                    // ensure consistency in payload format
                                    msg.payload.page = page
                                    // send a message to the ui to switch to this tab
                                    emit(msg)
                                    pageFound = true
                                }
                            }
                        })
                        if (!pageFound) {
                            node.error("No page with the name '" + page + "' found")
                        }
                    }
                }

                // show/hide or enable/disable tabs
                if ('tabs' in msg.payload || 'pages' in msg.payload) {
                    const pages = msg.payload.pages || msg.payload.tabs
                    // get a map of page name to page object
                    const allPages = {}
                    RED.nodes.eachNode((n) => {
                        if (n.type === 'ui-page') {
                            allPages[n.name] = n
                        }
                    })

                    // const pMap = RED.nodes.forEach
                    if ('show' in pages) {
                        updateStore(allPages, pages.show, msg, 'visible', true)
                    }
                    if ('hide' in pages) {
                        updateStore(allPages, pages.hide, msg, 'visible', false)
                    }
                    if ('enable' in pages) {
                        updateStore(allPages, pages.enable, msg, 'disabled', false)
                    }
                    if ('disable' in pages) {
                        updateStore(allPages, pages.disable, msg, 'disabled', false)
                    }

                    // ensure consistency in payload format
                    msg.payload.pages = pages
                    // send to front end in order to action there too
                    emit(msg)
                }

                // show or hide ui groups
                if ('groups' in msg.payload || 'group' in msg.payload) {
                    const groups = msg.payload.groups || msg.payload.group
                    // get a map of group name to group object
                    const allGroups = {}
                    RED.nodes.eachNode((n) => {
                        if (n.type === 'ui-group') {
                            allGroups[n.name] = n
                        }
                    })
                    if ('show' in groups) {
                        const gs = groups.show.map((g) => {
                            const levels = g.split(':')
                            return levels.length > 1 ? levels[1] : g
                        })
                        updateStore(allGroups, gs, msg, 'visible', true)
                    }
                    if ('hide' in groups) {
                        const gh = groups.hide.map((g) => {
                            const levels = g.split(':')
                            return levels.length > 1 ? levels[1] : g
                        })
                        updateStore(allGroups, gh, msg, 'visible', false)
                    }
                    if ('enable' in groups) {
                        const ge = groups.enable.map((g) => {
                            const levels = g.split(':')
                            return levels.length > 1 ? levels[1] : g
                        })
                        updateStore(allGroups, ge, msg, 'disabled', false)
                    }
                    if ('disable' in groups) {
                        const gd = groups.disable.map((g) => {
                            const levels = g.split(':')
                            return levels.length > 1 ? levels[1] : g
                        })
                        updateStore(allGroups, gd, msg, 'disabled', true)
                    }
                    // ensure consistency in payload format
                    msg.payload.groups = groups
                    emit(msg)

                    // send specific visible/hidden commands via SocketIO here,
                    // so all logic stays server-side

                    wNode.send({ payload: 'input' })
                }

                if ('url' in msg.payload) {
                    emit(msg)
                }
            },
            onSocket: {
                connection: function (conn) {
                    if (config.events === 'all' || config.events === 'connect') {
                        const wNode = RED.nodes.getNode(node.id)
                        let msg = {
                            payload: 'connect'
                        }
                        msg = addConnectionCredentials(RED, msg, conn, ui)
                        wNode.send(msg)
                    }
                },
                disconnect: function (conn) {
                    if (config.events === 'all' || config.events === 'connect') {
                        const wNode = RED.nodes.getNode(node.id)
                        let msg = {
                            payload: 'lost'
                        }
                        msg = addConnectionCredentials(RED, msg, conn, ui)
                        wNode.send(msg)
                    }
                },
                'ui-control': function (conn, id, evt, payload) {
                    if (id === node.id && (config.events === 'all' || config.events === 'change')) {
                        // this message was sent by this particular node
                        if (evt === 'change') {
                            const wNode = RED.nodes.getNode(node.id)
                            if (wNode && payload && wNode.send) {
                                let msg = {
                                    payload: 'change',
                                    tab: payload.page, // index of tab
                                    name: payload.name // page name
                                }
                                msg = addConnectionCredentials(RED, msg, conn, ui)
                                wNode.send(msg)
                            }
                        }
                    }
                }
            }
        }

        // inform the dashboard UI that we are adding this node
        ui.register(null, null, node, config, evts)

        node.on('close', function (removed, done) {
            if (removed) {
                // handle node being removed
                ui?.deregister(null, null, node)
            }
            done()
        })
    }
    RED.nodes.registerType('ui-control', UiControlNode)
}
