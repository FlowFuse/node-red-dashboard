// const Emitter = require('events').EventEmitter
const path = require('path')

// from: https://stackoverflow.com/a/28592528/3016654
function join (...paths) {
    return paths.map(function (element) {
        return element.replace(/^\/|\/$/g, '')
    }).join('/')
}

module.exports = function (RED) {
    const express = require('express')
    const { Server } = require('socket.io')

    /**
     * @typedef {import('socket.io/dist').Socket} Socket
     * @typedef {import('socket.io/dist').Server} Server
     */

    // store state that can maintain cross re-deployments
    const ui = {
        app: null,
        httpServer: null,
        /** @type { Server } */
        ioServer: null,
        /** @type {Object.<string, Socket>} */
        connections: {},
        events: {
            load: {},
            change: {},
            action: {}
        }
    }

    /*
     * Initialise the Express Server and SocketIO Server in Singleton Pattern
     */
    function init (node, config) {
        // eventually check if we have routes used, so we can support multiple base UIs
        if (!ui.app) {
            ui.app = RED.httpNode || RED.httpAdmin
            ui.httpServer = RED.server

            /**
             * Configure Web Server to handle UI traffic
             */

            ui.app.use(config.path, express.static(path.join(__dirname, '../../dist')))

            ui.app.get(config.path, (req, res) => {
                res.sendFile(path.join(__dirname, '../../dist/index.html'))
            })

            ui.app.get(config.path + '/*', (req, res) => {
                res.sendFile(path.join(__dirname, '../../dist/index.html'))
            })

            /**
             * Create IO Server for comms between Node-RED and UI
             */

            const fullPath = join(RED.settings.httpNodeRoot, config.path)
            const socketIoPath = join('/', fullPath, 'socket.io')
            /** @type {import('socket.io/dist').ServerOptions} */
            const serverOptions = {
                path: socketIoPath
            }
            console.log('Creating socket.io server at path', socketIoPath)
            // store reference to the SocketIO Server
            ui.ioServer = new Server(ui.httpServer, serverOptions)
            ui.ioServer.setMaxListeners(0) // prevent memory leak warning // TODO: be more smart about this!

            const bindOn = RED.server ? 'bound to Node-RED port' : 'on port ' + node.port
            node.log('Created socket.io server ' + bindOn + ' at path ' + socketIoPath)
        }
    }

    /**
     * Close the SocketIO Server
     */
    function close (node, done) {
        if (!ui.ioServer) {
            done()
            return
        }

        // determine if any ui-pages are left, if so, don't close the server
        const baseNodes = []
        const pageNodes = []
        const themes = []
        RED.nodes.eachNode(n => {
            if (n.type === 'ui-page') {
                pageNodes.push(n)
            } else if (n.type === 'ui-base' && n.id !== node.id) {
                baseNodes.push(n)
            } else if (n.type === 'ui-theme') {
                themes.push(n)
            }
        })

        if (pageNodes.length > 0) {
            // there are still ui-pages, so don't close the server
            done()
            return
        }
        node.ui.pages.clear()// ensure we clear out any pages that may have been left over
        // since there are no pages, we can assume widgets and groups are also gone
        node.ui.widgets.clear()
        node.ui.groups.clear()

        if (baseNodes.length > 0) {
            // there are still other ui-base nodes, don't close the server
            done()
            return
        }

        // as there are no more instances of ui-page and this is the last ui-base, close the server
        ui.ioServer.removeAllListeners()
        ui.ioServer.disconnectSockets(true)
        // tidy up
        if (themes.length === 0) {
            node.ui.themes.clear()
        }
        node.ui.dashboards.clear() // ensure we clear out any dashboards that may have been left over

        done && done()
    }

    /**
     * Emit an event to all connected UIs
     * @param {String} event
     * @param {Object} data
     */
    function emit (event, data) {
        Object.values(ui.connections).forEach(conn => {
            conn.emit(event, data)
        })
    }

    /**
     * UI Base Node Constructor. Called each time Node-RED nodes are deployed.
     * @param {*} n
     */
    function UIBaseNode (n) {
        const node = this
        RED.nodes.createNode(node, n)

        /**
         * Configure & Run Express Server
         */
        init(node, n)

        function emitConfig (conn) {
            // pass the connected UI the UI config
            conn.emit('ui-config', node.id, {
                dashboards: Object.fromEntries(node.ui.dashboards),
                pages: Object.fromEntries(node.ui.pages),
                themes: Object.fromEntries(node.ui.themes),
                groups: Object.fromEntries(node.ui.groups),
                widgets: Object.fromEntries(node.ui.widgets)
            })
        }

        /**
         * on connection handler for SocketIO
         * @param {Socket} socket socket.io socket connecting to the server
         */
        function onConnection (socket) {
            ui.connections[socket.id] = socket // store the connection for later use
            emitConfig(socket)

            // handle disconnection
            socket.on('disconnect', reason => {
                delete ui.connections[socket.id]
                node.log(`Disconnected ${socket.id} due to ${reason}`)
            })
        }

        // When a UI connects - send the UI Config from Node-RED to the UI
        ui.ioServer.on('connection', onConnection)

        // account time for all widgets to register themselves, before sending the full config to the UI
        // this is most important running running a "Deploy" from within Node-RED, and our onConnection doesn't run
        setTimeout(() => {
            Object.values(ui.connections).forEach(conn => {
                // pass the connected UI the UI config
                emitConfig(conn)
            })
        }, 300)

        // Make sure we clean up after ourselves
        node.on('close', (removed, done) => {
            ui.ioServer?.off('connection', onConnection)
            close(node, function (err) {
                if (err) {
                    node.error(`Error closing socket.io server for ${node.id}`, err)
                }
                done()
            })
        })

        /**
         * External Functions for managing UI Components
         */

        // store ui config to be sent to UI
        node.ui = {
            dashboards: new Map(),
            pages: new Map(),
            themes: new Map(),
            groups: new Map(),
            widgets: new Map()
        }

        /**
         * Register allows for pages, widgets, groups, etc. to register themselves with the Base UI Node
         * @param {*} page
         * @param {*} widget
         */
        node.register = function (page, group, widgetNode, widgetConfig, widgetEvents) {
            /**
             * Build UI Config
             */

            // strip widgetConfig of stuff we don't really care about (e.g. Node-RED x/y coordinates)
            // and leave us just with the properties set inside the Node-RED Editor, store as "props"
            // store our UI state properties under the .state key too
            const widget = {
                id: widgetConfig.id,
                type: widgetConfig.type,
                props: widgetConfig,
                layout: {
                    width: widgetConfig.width || 3,
                    height: widgetConfig.width || 1,
                    order: widgetConfig.order || 0
                },
                state: {
                    enabled: widgetNode._msg?.enabled || true,
                    visible: widgetNode._msg?.visible || true
                }
            }
            delete widget.props.id
            delete widget.props.type
            delete widget.props.x
            delete widget.props.y
            delete widget.props.z
            delete widget.props.wires

            if (widget.props.width === '0') {
                widget.props.width = null
            }
            if (widget.props.height === '0') {
                widget.props.height = null
            }

            // map dashboards by their ID
            if (!node.ui.dashboards.has(n.id)) {
                node.ui.dashboards.set(n.id, n)
            }

            // map themes by their ID
            if (!node.ui.themes.has(page.theme)) {
                const theme = RED.nodes.getNode(page.theme)
                // eslint-disable-next-line no-unused-vars
                const { _wireCount, _inputCallback, _inputCallbacks, _closeCallbacks, wires, type, ...t } = theme
                node.ui.themes.set(page.theme, t)
            }

            // map pages by their ID
            if (!node.ui.pages.has(page.id)) {
                // eslint-disable-next-line no-unused-vars
                const { _user, type, ...p } = page
                node.ui.pages.set(page.id, p)
            }

            // map groups on a page-by-page basis
            if (!node.ui.groups.has(group.id)) {
                // eslint-disable-next-line no-unused-vars
                const { _user, type, ...g } = group
                node.ui.groups.set(group.id, g)
            }

            // map widgets on a group-by-group basis
            if (!node.ui.widgets.has(widget.id)) {
                node.ui.widgets.set(widget.id, widget)
            }

            /**
             * Event Handlers
             */

            widgetNode.on('close', function (removed, done) {
                node.deregister(null, null, widgetNode)
                done()
            })

            // add Node-RED listener to the widget for when it's corresponding node receives a msg in Node-RED
            widgetNode.on('input', async function (msg, send, done) {
                // ensure we have latest instance of the widget's node
                const wNode = RED.nodes.getNode(widgetNode.id)
                if (!wNode) {
                    return // widget does not exist any more (e.g. deleted from NR and deployed BUT the ui page was not refreshed)
                }
                // send a message to the UI to let it know we've received a msg
                try {
                    // emit to all connected UIs
                    emit('msg-input:' + widget.id, msg)
                } catch (err) {
                    console.error(err)
                }

                // store the latest msg passed to node
                wNode._msg = msg

                // pre-process the msg before running our onInput function
                if (widgetEvents?.beforeSend) {
                    msg = widgetEvents.beforeSend(msg)
                }

                // run any node-specific handler defined in the Widget's component
                if (widgetEvents?.onInput) {
                    widgetEvents?.onInput(msg, send, done)
                } else {
                    // msg could be null if the beforeSend errors and returns null
                    if (msg) {
                        send(msg)
                    }
                }
            })

            if (!ui.events.load[widget.id]) {
                // on first connection with the UI, send the widget it's stored state
                ui.ioServer.on('connection', function (conn) {
                    async function handler () {
                        // ensure we have latest instance of the widget's node
                        const wNode = RED.nodes.getNode(widgetNode.id)
                        if (!wNode) {
                            return // widget does not exist any more (e.g. deleted from NR and deployed BUT the ui page was not refreshed)
                        }
                        console.log('conn:' + conn.id, 'on:widget-load:' + widget.id, wNode._msg)
                        // replicate receiving an input, so the widget can handle accordingly
                        const msg = wNode._msg
                        if (msg) {
                            // only emit something if we have something to send
                            // and only to this connection, not all connected clients
                            conn.emit('msg-input:' + widget.id, msg)
                        }
                    }
                    // add listener for when the UI loads, so that we can send any
                    // stored values associated to a widget that we have in Node-RED
                    conn.on('widget-load:' + widget.id, handler)

                    conn.on('disconnect', function () {
                        ui.ioServer.removeListener('widget-load:' + widget.id, handler)
                    })
                })
                ui.events.load[widget.id] = true
            }

            // Handle Socket IO Event Handlers
            if (widgetEvents?.onChange) {
                // have we configured a listener for this widget's change event?
                if (!ui.events.change[widget.id]) {
                    ui.ioServer.on('connection', function (conn) {
                        function defaultHandler (value) {
                            // ensure we have latest instance of the widget's node
                            const wNode = RED.nodes.getNode(widgetNode.id)
                            if (!wNode) {
                                return // widget does not exist any more (e.g. deleted from NR and deployed BUT the ui page was not refreshed)
                            }
                            console.log('conn:' + conn.id, 'on:widget-change', value)
                            // TODO: bind this property to whichever chosen, for now use payload
                            let msg = wNode._msg || {}
                            msg.payload = value

                            wNode._msg = msg

                            if (widgetEvents?.beforeSend) {
                                msg = widgetEvents.beforeSend(msg)
                            }

                            // simulate Node-RED node receiving an input
                            wNode.send(msg)
                        }

                        // Most of the time, we can just use this default handler,
                        // but sometimes a node needs to do something specific (e.g. ui-switch)
                        const handler = typeof (widgetEvents.onChange) === 'function' ? widgetEvents.onChange : defaultHandler

                        // listen to in-UI events that Node-RED may need to action
                        conn.on('widget-change:' + widget.id, handler)

                        conn.on('disconnect', function () {
                            ui.ioServer.removeListener('widget-change:' + widget.id, handler)
                        })
                    })
                    ui.events.change[widget.id] = true
                }
            }
            if (widgetEvents?.onAction) {
                if (!ui.events.change[widget.id]) {
                    ui.ioServer.on('connection', function (conn) {
                        conn.on('widget-action:' + widget.id, (msg) => {
                            // ensure we have latest instance of the widget's node
                            const wNode = RED.nodes.getNode(widgetNode.id)
                            if (!wNode) {
                                return // widget does not exist any more (e.g. deleted from NR and deployed BUT the ui page was not refreshed)
                            }
                            console.log('conn:' + conn.id, 'on:widget-action:' + widget.id)

                            if (widgetEvents?.beforeSend) {
                                msg = widgetEvents.beforeSend(msg)
                            }

                            // simulate Node-RED node receiving an input as to trigger on('input)
                            wNode.send(msg)
                        })
                    })
                    ui.events.action[widget.id] = true
                }
            }
        }

        node.deregister = function (page, group, widgetNode) {
            // remove widget from our UI config
            if (widgetNode) {
                node.ui.widgets.delete(widgetNode.id)
            }

            // if there are no more widgets on this group, remove the group from our UI config
            if (group && [...node.ui.widgets].filter(w => w.props?.group === group.id).length === 0) {
                node.ui.groups.delete(group.id)
            }

            // if there are no more groups on this page, remove the page from our UI config
            if (page && [...node.ui.groups].filter(g => g.page === page.id).length === 0) {
                node.ui.pages.delete(page.id)
            }
        }
    }
    RED.nodes.registerType('ui-base', UIBaseNode)
}
