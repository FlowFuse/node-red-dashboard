// const Emitter = require('events').EventEmitter
const path = require('path')

const v = require('../../package.json').version
const datastore = require('../store/index.js')
const { appendTopic } = require('../utils/index.js')

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
    const uiShared = {
        app: null,
        httpServer: null,
        /** @type { Server } */
        ioServer: null,
        /** @type {Object.<string, Socket>} */
        connections: {},
        settings: {}
    }

    /**
     * Initialise the Express Server and SocketIO Server in Singleton Pattern
     * @param {Object} node - Node-RED Node
     * @param {Object} config - Node-RED Node Config
     */
    function init (node, config) {
        node.uiShared = uiShared // ensure we have a uiShared object on the node (for testing mainly)
        // eventually check if we have routes used, so we can support multiple base UIs
        if (!uiShared.app) {
            uiShared.app = RED.httpNode || RED.httpAdmin
            uiShared.httpServer = RED.server

            // Use the 'dashboard' settings if present, otherwise fallback
            // to node-red-dashboard 'ui' settings object.
            uiShared.settings = RED.settings.dashboard || RED.settings.ui || {}

            // Default no-op middleware
            uiShared.httpMiddleware = function (req, res, next) { next() }
            if (uiShared.settings.middleware) {
                if (typeof uiShared.settings.middleware === 'function' || Array.isArray(uiShared.settings.middleware)) {
                    uiShared.httpMiddleware = uiShared.settings.middleware
                }
            }
            /**
             * Configure Web Server to handle UI traffic
             */

            uiShared.app.use(config.path, uiShared.httpMiddleware, express.static(path.join(__dirname, '../../dist')))

            uiShared.app.get(config.path, uiShared.httpMiddleware, (req, res) => {
                res.sendFile(path.join(__dirname, '../../dist/index.html'))
            })

            uiShared.app.get(config.path + '/*', uiShared.httpMiddleware, (req, res) => {
                res.sendFile(path.join(__dirname, '../../dist/index.html'))
            })

            node.log(`Node-RED Dashboard 2.0 (v${v}) started at ${config.path}`)

            /**
             * Create IO Server for comms between Node-RED and UI
             */
            if (RED.settings.httpNodeRoot !== false) {
                const root = RED.settings.httpNodeRoot || '/'
                const fullPath = join(root, config.path)
                const socketIoPath = join('/', fullPath, 'socket.io')
                /** @type {import('socket.io/dist').ServerOptions} */
                const serverOptions = {
                    path: socketIoPath
                }
                // console.log('Creating socket.io server at path', socketIoPath) // disable - noisy in tests
                // store reference to the SocketIO Server
                uiShared.ioServer = new Server(uiShared.httpServer, serverOptions)
                uiShared.ioServer.setMaxListeners(0) // prevent memory leak warning // TODO: be more smart about this!

                if (typeof uiShared.settings.ioMiddleware === 'function') {
                    uiShared.ioServer.use(uiShared.settings.ioMiddleware)
                } else if (Array.isArray(uiShared.settings.ioMiddleware)) {
                    uiShared.settings.ioMiddleware.forEach(function (ioMiddleware) {
                        uiShared.ioServer.use(ioMiddleware)
                    })
                } else {
                    uiShared.ioServer.use(function (socket, next) {
                        if (socket.client.conn.request.url.indexOf('transport=websocket') !== -1) {
                            // Reject direct websocket requests
                            socket.client.conn.close()
                            return
                        }
                        if (socket.handshake.xdomain === false) {
                            return next()
                        } else {
                            socket.disconnect(true)
                        }
                    })
                }
                const bindOn = RED.server ? 'bound to Node-RED port' : 'on port ' + node.port
                node.log('Created socket.io server ' + bindOn + ' at path ' + socketIoPath)
            } else {
                node.warn('Cannot create UI Base node when httpNodeRoot set to false')
            }
        }
    }

    /**
     * Close the SocketIO Server
     */
    function close (node, done) {
        if (!uiShared.ioServer) {
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
        uiShared.ioServer.removeAllListeners()
        uiShared.ioServer.disconnectSockets(true)
        // tidy up
        if (themes.length === 0) {
            node.ui.themes.clear()
        }
        node.ui.dashboards.clear() // ensure we clear out any dashboards that may have been left over
        node.uiShared = null // remove reference to ui object
        done && done()
    }

    /**
     * Emit an event to all connected UIs
     * @param {String} event
     * @param {Object} data
     */
    function emit (event, data) {
        Object.values(uiShared.connections).forEach(conn => {
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
        RED.nodes.createNode(this, n)
        const node = this

        node._created = Date.now()

        /** @type {Object.<string, Socket>} */
        // node.connections = {} // store socket.io connections for this node
        // // re-map existing connections for this base node
        for (const id in uiShared.connections) {
            const socket = uiShared.connections[id]
            if (uiShared.connections[id]._baseId === node.id) {
                // re establish event handlers
                socket.on('widget-action', onAction.bind(null, socket))
                socket.on('widget-change', onChange.bind(null, socket))
                socket.on('widget-load', onLoad.bind(null, socket))
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
                heads: Object.fromEntries(node.ui.heads),
                pages: Object.fromEntries(node.ui.pages),
                themes: Object.fromEntries(node.ui.themes),
                groups: Object.fromEntries(node.ui.groups),
                widgets: Object.fromEntries(node.ui.widgets)
            })
        }

        // remove event handler socket listeners for a given socket connection
        function cleanupEventHandlers (socket) {
            try {
                socket.removeAllListeners('widget-action')
            } catch (_error) { /* do nothing */ }
            try {
                socket.removeAllListeners('widget-change')
            } catch (_error) { /* do nothing */ }
            try {
                socket.removeAllListeners('widget-load')
            } catch (_error) { /* do nothing */ }
            try {
                socket.removeAllListeners('disconnect')
            } catch (_error) { /* do nothing */ }

            // check if any widgets have defined custom socket events
            // remove their listeners to make sure we clean up properly
            node.ui?.widgets?.forEach((widget) => {
                if (widget.hooks?.onSocket) {
                    for (const [eventName] of Object.entries(widget.hooks.onSocket)) {
                        try {
                            socket.removeAllListeners(eventName)
                        } catch (_error) { /* do nothing */ }
                    }
                }
            })
        }

        function setupEventHandlers (socket) {
            socket.on('widget-action', onAction.bind(null, socket))
            socket.on('widget-change', onChange.bind(null, socket))
            socket.on('widget-load', onLoad.bind(null, socket))

            // check if any widgets have defined custom socket events
            // most common with third-party widgets that are not part of core Dashboard 2.0
            node.ui?.widgets?.forEach((widget) => {
                if (widget.hooks?.onSocket) {
                    for (const [eventName, handler] of Object.entries(widget.hooks.onSocket)) {
                        socket.on(eventName, handler)
                    }
                }
            })

            // handle disconnection
            socket.on('disconnect', reason => {
                cleanupEventHandlers(socket)
                delete uiShared.connections[socket.id]
                node.log(`Disconnected ${socket.id} due to ${reason}`)
            })
        }

        /**
         * on connection handler for SocketIO
         * @param {Socket} socket socket.io socket connecting to the server
         */
        function onConnection (socket) {
            // record mapping from connection to he ui-base node
            socket._baseId = node.id

            // node.connections[socket.id] = socket // store the connection for later use
            uiShared.connections[socket.id] = socket // store the connection for later use
            emitConfig(socket)

            // clean up then re-register listeners
            cleanupEventHandlers(socket)
            setupEventHandlers(socket)
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

            // ensure we can get the requested widget from the runtime & that this widget has an onAction handler
            if (!wNode || !widgetEvents.onAction) {
                return // widget does not exist (e.g. deleted from NR and deployed BUT the ui page was not refreshed)
            }

            // Wrap execution in a try/catch to ensure we don't crash Node-RED
            try {
                msg = await appendTopic(RED, widgetConfig, wNode, msg)

                // pre-process the msg before send on the msg (if beforeSend is defined)
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
            let msg = datastore.get(id) || {}
            async function defaultHandler (value) {
                if (typeof (value) === 'object' && value !== null && Object.hasOwn(value, 'payload')) {
                    msg.payload = value.payload
                } else {
                    msg.payload = value
                }

                msg = await appendTopic(RED, widgetConfig, wNode, msg)

                if (widgetEvents?.beforeSend) {
                    msg = await widgetEvents.beforeSend(msg)
                }
                datastore.save(id, msg)
                wNode.send(msg) // send the msg onwards
            }

            // wrap execution in a try/catch to ensure we don't crash Node-RED
            try {
                // Most of the time, we can just use this default handler,
                // but sometimes a node needs to do something specific (e.g. ui-switch)
                const handler = typeof (widgetEvents.onChange) === 'function' ? widgetEvents.onChange : defaultHandler
                await handler(value)
            } catch (error) {
                console.log(error)
                let errorHandler = typeof (widgetEvents.onError) === 'function' ? widgetEvents.onError : null
                errorHandler = errorHandler || (typeof wNode.error === 'function' ? wNode.error : node.error)
                errorHandler && errorHandler(error)
            }
        }

        async function onLoad (conn, id, msg) {
            console.log('conn:' + conn.id, 'on:widget-load:' + id, msg)

            const { wNode, widgetEvents } = getWidgetAndConfig(id)
            if (!wNode) {
                console.log('widget does not exist any more')
                return // widget does not exist any more (e.g. deleted from NR and deployed BUT the ui page was not refreshed)
            }
            async function handler () {
                const msg = datastore.get(id)
                conn.emit('widget-load:' + id, msg)
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
            // node.ui?.widgets is empty?
            // themes, groups, etc. are not empty?
            const wNode = RED.nodes.getNode(id)
            const widget = node.ui?.widgets?.get(id)
            const widgetConfig = widget?.props || {}
            const widgetEvents = widget?.hooks || {}
            return { wNode, widgetConfig, widgetEvents, widget }
        }

        // When a UI connects - send the UI Config from Node-RED to the UI
        uiShared.ioServer.on('connection', onConnection)

        // Make sure we clean up after ourselves
        node.on('close', (removed, done) => {
            uiShared.ioServer?.off('connection', onConnection)
            for (const conn of Object.values(uiShared.connections)) {
                cleanupEventHandlers(conn)
            }
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
            heads: new Map(),
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
                try {
                    // emit config to all connected UI for this ui-base
                    Object.values(uiShared.connections).forEach(socket => {
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
                    height: widgetConfig.height || 1,
                    order: widgetConfig.order || 0
                },
                state: {
                    enabled: datastore.get(widgetConfig.id)?.enabled || true,
                    visible: datastore.get(widgetConfig.id)?.visible || true
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

            // loop over props and check if we have any function definitions (e.g. onMounted, onInput)
            // and stringify them for transport over SocketIO
            for (const [key, value] of Object.entries(widget.props)) {
                // supported functions
                const supported = ['onMounted', 'onInput']
                if (supported.includes(key) && typeof value === 'function') {
                    widget.props[key] = value.toString()
                } else if (key === 'methods') {
                    for (const [method, fcn] of Object.entries(widget.props.methods)) {
                        if (typeof fcn === 'function') {
                            widget.props.methods[method] = fcn.toString()
                        }
                    }
                }
            }

            // map dashboards by their ID
            if (!node.ui.dashboards.has(n.id)) {
                node.ui.dashboards.set(n.id, n)
            }

            // map themes by their ID
            if (page && !node.ui.themes.has(page.theme)) {
                const theme = RED.nodes.getNode(page.theme)
                if (theme) {
                    // eslint-disable-next-line no-unused-vars
                    const { _wireCount, _inputCallback, _inputCallbacks, _closeCallbacks, wires, type, ...t } = theme
                    node.ui.themes.set(page.theme, t)
                } else {
                    node.warn(`Theme '${page.theme}' specified  in page '${page.id}' does not exist`)
                }
            }

            // map pages by their ID
            if (page && !node.ui.pages.has(page?.id)) {
                // eslint-disable-next-line no-unused-vars
                const { _user, type, ...p } = page
                node.ui.pages.set(page.id, p)
            }

            // map groups on a page-by-page basis
            if (group && !node.ui.groups.has(group?.id)) {
                // eslint-disable-next-line no-unused-vars
                const { _user, type, ...g } = group
                node.ui.groups.set(group.id, g)
            }

            // map widgets on a group-by-group basis
            if (!node.ui.widgets.has(widget.id)) {
                node.ui.widgets.set(widget.id, widget)
            }

            /**
             * Helper Function for testing
             */

            widgetNode.getState = function () {
                return datastore.get(widgetNode.id)
            }

            /**
             * Event Handlers
             */

            // add Node-RED listener to the widget for when it's corresponding node receives a msg in Node-RED
            widgetNode.on('input', async function (msg, send, done) {
                // ensure we have latest instance of the widget's node
                const wNode = RED.nodes.getNode(widgetNode.id)
                if (!wNode) {
                    return // widget does not exist any more (e.g. deleted from NR and deployed BUT the ui page was not refreshed)
                }

                try {
                    // pre-process the msg before running our onInput function
                    if (widgetEvents?.beforeSend) {
                        msg = await widgetEvents.beforeSend(msg)
                    }

                    // run any node-specific handler defined in the Widget's component
                    if (widgetEvents?.onInput) {
                        await widgetEvents?.onInput(msg, send)
                    } else {
                        // msg could be null if the beforeSend errors and returns null
                        if (msg) {
                            // store the latest msg passed to node
                            datastore.save(widgetNode.id, msg)

                            if (widgetConfig.topic || widgetConfig.topicType) {
                                msg = await appendTopic(RED, widgetConfig, wNode, msg)
                            }
                            if (Object.hasOwn(widgetConfig, 'passthru')) {
                                if (widgetConfig.passthru) {
                                    send(msg)
                                }
                            } else {
                                send(msg)
                            }
                        }
                    }

                    // emit to all connected UIs
                    emit('msg-input:' + widget.id, msg)

                    done()
                } catch (err) {
                    if (err.type === 'warn') {
                        wNode.warn(err.message)
                        done()
                    } else {
                        done(err)
                    }
                }
            })

            // when a widget is "closed" remove it from this Base Node's knowledge
            widgetNode.on('close', function (removed, done) {
                if (removed) {
                    // widget has been removed from the Editor
                    // clear any data from datastore
                    datastore.clear(widgetNode.id)
                }
                node.deregister(null, null, widgetNode)
                done()
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

    RED.nodes.registerType('ui-base', UIBaseNode)
}
