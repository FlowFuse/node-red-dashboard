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
        connections: {}
    }

    /**
     * Initialise the Express Server and SocketIO Server in Singleton Pattern
     * @param {Object} node - Node-RED Node
     * @param {Object} config - Node-RED Node Config
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
     * UI Base Node Constructor. Called each time Node-RED deploy creates / recreates a u-base node.
     * * _whether this constructor is called depends on if there are any changes to THIS node_
     * * _A full Deploy will always call this function as every node is destroyed and re-created_
     * @param {Object} n - Node-RED node configuration as entered in the nodes editor
     */
    function UIBaseNode (n) {
        const node = this
        RED.nodes.createNode(node, n)

        /** @type {Object.<string, Socket>} */
        node.connections = {} // store socket.io connections for this node
        // re-map existing connections for this base node
        for (const id in ui.connections) {
            if (ui.connections[id]._baseId === node.id) {
                node.connections[id] = ui.connections[id]
            }
        }
        /** @type {NodeJS.Timeout} */
        node.emitConfigRequested = null // used to debounce requests to emitConfig

        // Configure & Run Express Server
        init(node, n)

        /**
         * Emit UI Config to all connected UIs
         * @param {Socket} socket - socket.io socket connecting to the server
         */
        function emitConfig (socket) {
            // pass the connected UI the UI config
            socket.emit('ui-config', node.id, {
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
            // record mapping from connection to he ui-base node
            socket._baseId = node.id

            node.connections[socket.id] = socket // store the connection for later use
            ui.connections[socket.id] = socket // store the connection for later use
            emitConfig(socket)

            const cleanup = () => {
                try {
                    socket.removeListener('widget-action', onAction.bind(null, socket))
                } catch (_error) { /* do nothing */ }
                try {
                    socket.removeListener('widget-change', onChange.bind(null, socket))
                } catch (_error) { /* do nothing */ }
                try {
                    socket.removeListener('widget-load', onLoad.bind(null, socket))
                } catch (_error) { /* do nothing */ }
            }
            // clean up then re-register listeners
            cleanup()
            socket.on('widget-action', onAction.bind(null, socket))
            socket.on('widget-change', onChange.bind(null, socket))
            socket.on('widget-load', onLoad.bind(null, socket))

            // handle disconnection
            socket.on('disconnect', reason => {
                cleanup()
                delete ui.connections[socket.id]
                delete node.connections[socket.id]
                node.log(`Disconnected ${socket.id} due to ${reason}`)
            })
        }
        /**
         * Handles a widget-action event from the UI
         * @param {Socket} conn - socket.io socket connecting to the server
         * @param {String} id - widget id sending the action
         * @param {*} msg - The node-red msg object to forward
         * @returns void
         */
        async function onAction (conn, id, msg) {
            console.log('conn:' + conn.id, 'on:widget-action:' + id, msg)

            // ensure msg is an object. Assume the incoming data is the payload if not
            if (!msg || typeof msg !== 'object') {
                msg = { payload: msg }
            }

            // get widget node and configuration
            const { wNode, widgetConfig, widgetEvents } = getWidgetAndConfig(id)

            // ensure we can get the requested widget from the runtime
            if (!wNode) {
                return // widget does not exist (e.g. deleted from NR and deployed BUT the ui page was not refreshed)
            }

            // Wrap execution in a try/catch to ensure we don't crash Node-RED
            try {
                // populate topic if the node specifies one
                if (widgetConfig.topic || widgetConfig.topicType) {
                    try {
                        msg.topic = await evaluateNodeProperty(widgetConfig.topic, widgetConfig.topicType || 'str', wNode, msg) || ''
                    } catch (_err) { /* do nothing */ }
                }

                // ensure we have a topic property in the msg, even if it's an empty string
                if (!('topic' in msg)) {
                    msg.topic = ''
                }

                // pre-process the msg before running our onInput function (if beforeSend is defined)
                if (widgetEvents?.beforeSend && typeof widgetEvents.beforeSend === 'function') {
                    msg = await widgetEvents.beforeSend(msg)
                }

                // send the msg onwards
                wNode.send(msg)
            } catch (error) {
                let errorHandler = typeof (widgetEvents.onError) === 'function' ? widgetEvents.onError : null
                errorHandler = errorHandler || (typeof wNode.error === 'function' ? wNode.error : node.error)
                errorHandler && errorHandler(error)
            }
        }

        /**
         * Handles a widget-change event from the UI
         * @param {Socket} conn - socket.io socket connecting to the server
         * @param {String} id - widget id sending the action
         * @param {*} value - The value to send to node-red. Typically this is the payload
         * @returns void
         */
        async function onChange (conn, id, value) {
            console.log('conn:' + conn.id, 'on:widget-change:' + id, value)

            // get widget node and configuration
            const { wNode, widgetConfig, widgetEvents } = getWidgetAndConfig(id)

            if (!wNode) {
                return // widget does not exist any more (e.g. deleted from NR and deployed BUT the ui page was not refreshed)
            }
            let msg = wNode._msg || {}
            async function defaultHandler (value) {
                msg.payload = value

                // populate topic if the node specifies one
                if (widgetConfig.topic || widgetConfig.topicType) {
                    try {
                        msg.topic = await evaluateNodeProperty(widgetConfig.topic, widgetConfig.topicType || 'str', wNode, msg) || ''
                    } catch (_err) {
                        // do nothing
                    }
                }

                // ensure we have a topic property in the msg, even if it's an empty string
                if (!('topic' in msg)) {
                    msg.topic = ''
                }

                if (widgetEvents?.beforeSend) {
                    msg = widgetEvents.beforeSend(msg)
                }
                wNode._msg = msg
                wNode.send(msg) // send the msg onwards
            }

            // wrap execution in a try/catch to ensure we don't crash Node-RED
            try {
                // Most of the time, we can just use this default handler,
                // but sometimes a node needs to do something specific (e.g. ui-switch)
                const handler = typeof (widgetEvents.onChange) === 'function' ? widgetEvents.onChange : defaultHandler
                await handler(value)
            } catch (error) {
                let errorHandler = typeof (widgetEvents.onError) === 'function' ? widgetEvents.onError : null
                errorHandler = errorHandler || (typeof wNode.error === 'function' ? wNode.error : node.error)
                errorHandler && errorHandler(error)
            }
        }

        async function onLoad (conn, id, msg) {
            console.log('conn:' + conn.id, 'on:widget-load:' + id, msg)

            const { wNode, widgetEvents } = getWidgetAndConfig(id)
            if (!wNode) {
                return // widget does not exist any more (e.g. deleted from NR and deployed BUT the ui page was not refreshed)
            }
            async function handler () {
                // replicate receiving an input, so the widget can handle accordingly
                const msg = wNode._msg
                if (msg) {
                    // only emit something if we have something to send
                    // and only to this connection, not all connected clients
                    conn.emit('msg-input:' + id, msg)
                }

                // store the latest msg passed to node
                wNode._msg = msg
            }
            // wrap execution in a try/catch to ensure we don't crash Node-RED
            try {
                handler()
            } catch (error) {
                let errorHandler = typeof (widgetEvents.onError) === 'function' ? widgetEvents.onError : null
                errorHandler = errorHandler || (typeof wNode.error === 'function' ? wNode.error : node.error)
                errorHandler && errorHandler(error)
            }
        }

        /**
         * Get the widget node and associated configuration/event hooks
         * @param {String} id - ID of the widget
         * @returns {Object} - { wNode, widgetConfig, widgetEvents, widget }
         */
        function getWidgetAndConfig (id) {
            const wNode = RED.nodes.getNode(id)
            const widget = node.ui?.widgets?.get(id)
            const widgetConfig = widget?.props || {}
            const widgetEvents = widget?.hooks || {}
            return { wNode, widgetConfig, widgetEvents, widget }
        }

        // When a UI connects - send the UI Config from Node-RED to the UI
        ui.ioServer.on('connection', onConnection)

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
         * Queue up a config emit to the UI. This is a debounced function
         * NOTES:
         * * only sockets connected to this node will receive the config
         * * each ui-node will have it's own connections and will emit it's own config
         * @returns {void}
         */
        node.requestEmitConfig = function () {
            if (node.emitConfigRequested) {
                return
            }
            node.emitConfigRequested = setTimeout(() => {
                console.log(`emitting config to ${Object.keys(node.connections).length} connections`)
                try {
                    // emit config to all connected UI for this ui-base
                    Object.values(node.connections).forEach(socket => {
                        console.log('emitting config to', socket.id)
                        emitConfig(socket)
                    })
                } finally {
                    node.emitConfigRequested = null
                }
            }, 300)
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
                },
                hooks: widgetEvents
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
                    msg = await widgetEvents.beforeSend(msg)
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
            node.requestEmitConfig() // queue up a config emit to the UI
        }

        node.deregister = function (page, group, widgetNode) {
            let changes = false
            // remove widget from our UI config
            if (widgetNode) {
                node.ui.widgets.delete(widgetNode.id)
                changes = true
            }

            // if there are no more widgets on this group, remove the group from our UI config
            if (group && [...node.ui.widgets].filter(w => w.props?.group === group.id).length === 0) {
                node.ui.groups.delete(group.id)
                changes = true
            }

            // if there are no more groups on this page, remove the page from our UI config
            if (page && [...node.ui.groups].filter(g => g.page === page.id).length === 0) {
                node.ui.pages.delete(page.id)
                changes = true
            }
            if (changes) {
                node.requestEmitConfig()
            }
        }

        // Finally, queue up a config emit to the UI.
        // NOTE: this is a cautionary measure only - typically the registration of nodes will queue up a config emit
        // but in cases where the dashboard has no widgets registered, we still need to emit a config
        node.requestEmitConfig()
    }

    function evaluateNodeProperty (value, type, node, msg) {
        return new Promise(function (resolve, reject) {
            RED.util.evaluateNodeProperty(value, type, node, msg, function (e, r) {
                if (e) {
                    reject(e)
                } else {
                    resolve(r)
                }
            })
        })
    }

    RED.nodes.registerType('ui-base', UIBaseNode)
}
