// const Emitter = require('events').EventEmitter
const path = require('path')

//from: https://stackoverflow.com/a/28592528/3016654
function join() {
    var trimRegex = new RegExp('^\\/|\\/$','g');
    var paths = Array.prototype.slice.call(arguments);
    return '/'+paths.map(function(e) {
        if (e) { return e.replace(trimRegex,""); }
    }).filter(function(e) {return e;}).join('/');
}

module.exports = function(RED) {
    const express = require('express')
    const { Server } = require("socket.io")

    const ui = {
        app: null,
        httpServer: null,
        ioServer: null,
        connections: []
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

            ui.app.get(config.path, (req,res) => {
                res.sendFile(path.join(__dirname, '../../dist/index.html'));
            });

            ui.app.get(config.path + '/*', (req,res) => {
                res.sendFile(path.join(__dirname, '../../dist/index.html'));
            });

            /**
             * Create IO Server for comms between Node-RED and UI
             */

            /** @type { import('socket.io').ServerOptions } */
            const fullPath = join(RED.settings.httpNodeRoot, config.path)
            const socketIoPath = join(fullPath, 'socket.io')
            // store reference to the SocketIO Server
            ui.ioServer = new Server(ui.httpServer, {
                path: socketIoPath
            })

            var bindOn = RED.server ? "bound to Node-RED port" : "on port " + node.port
            node.log("Created socket.io server " + bindOn + " at path " + socketIoPath)

            ui.ioServer.on('connection', function(conn) {
                console.log('socket connected')
                // TODO: Change socketio to "connections" and store in a Map or Array
                ui.connections.push(conn) // store the connection for later use

                node.log('connected established via io')

                // pass the connected UI the UI config
                conn.emit('ui-config', node.id, {
                    dashboards: Object.fromEntries(node.ui.dashboards),
                    pages: Object.fromEntries(node.ui.pages),
                    themes: Object.fromEntries(node.ui.themes),
                    groups: Object.fromEntries(node.ui.groups),
                    widgets: Object.fromEntries(node.ui.widgets)
                })
                
                // handle disconnection
                conn.on("disconnect", reason => {
                    node.log(`Disconnected ${conn.id} due to ${reason}`)
                })
            })
        }
    }

    /**
     * Close the Express Server and SocketIO Server
     */
    function close (node) {
        ui.ioServer.close()
        ui.server.close(() => {
            node.log('server shut down')
        })
    }

    /**
     * Emit an event to all connected UIs
     * @param {String} event
     * @param {Object} data
     */
    function emit (event, data) {
        ui.connections.forEach(conn => {
            conn.emit(event, data)
        })
    }

    /**
     * UI Base Node Constructor. Called each time Node-RED nodes are deployed.
     * @param {*} n 
     */
    function UIBaseNode(n) {

        const node = this

        RED.nodes.createNode(node, n);

        /**
         * Configure & Run Express Server
         */
        init(node, n)

        // Make sure we clean up after ourselves
        node.on('close', async (done) => {
            if (ui.server) {
                close(node)
            }
            done()
        })

        /**
         * External Functions for managing UI Components
         */

        // store ui config
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

            // strip widgetConfig of stuff we don't really care about (e.g. Node-RED x/y coordinates)
            // and leave us just with the properties set inside the Node-RED Editor, store as "props"
            // store our UI state properties under the .state key too
            const widget = {
                id: widgetConfig.id,
                type: widgetConfig.type,
                props: widgetConfig,
                layout: {
                    width: widgetNode._msg?.width || 3,
                    height: widgetNode._msg?.width || 1,
                    order: widgetNode._msg?.order || 0
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

            if (widget.props.width === "0") {
                widget.props.width = null
            }
            if (widget.props.height === "0") {
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

            // add Node-RED listener to the widget for when it's corresponding node receives a msg in Node-RED
            widgetNode.on('input', async function (msg, send, done) {
                // send a message to the UI to let it know we've received a msg
                try {
                    // emit to all connected UIs
                    emit('msg-input:' + widget.id, msg)
                } catch (err) {
                    console.error(err)
                }

                // store the latest msg passed to node
                widgetNode._msg = msg

                // run any node-specific handler defined in the Widget's component
                if (widgetEvents?.onInput) {
                    widgetEvents?.onInput(msg, send, done)
                } else {
                    done()
                }
            })
            
            // on first connection with the UI, send the widget it's stored state
            ui.ioServer.on('connection', function(conn) {
                // add listener for when the UI loads, so that we can send any
                // stored values associated to a widget that we have in Node-RED
                conn.on('widget-load:' + widget.id, async function () {
                    console.log('on:widget-load', widgetNode._msg)
                    // replicate receiving an input, so the widget can handle accordingly
                    const msg = widgetNode._msg
                    if (msg) {
                        // only emit something if we have something to send
                        // and only to this connection, not all connected clients
                        conn.emit('msg-input:' + widget.id, msg)
                    }
                })
            })


            // Handle Socket IO Event Handlers
            if (widgetEvents?.onChange) {
                ui.ioServer.on('connection', function(socket) {
                    // listen to in-UI events that Node-RED may need to action
                    socket.on('widget-change:' + widget.id, (value) => {
                        console.log('on:widget-change', value)
                        // TODO: bind this property to whichever chosen, for now use payload
                        const msg = widgetNode._msg || {}
                        msg.payload = value

                        widgetNode._msg = msg

                        // simulate Node-RED node receiving an input
                        widgetNode.receive(msg)
                    })
                })
            }
            if (widgetEvents?.onAction) {
                ui.ioServer.on('connection', function(socket) {
                    socket.on('widget-action:' + widget.id, (evt) => {
                        console.log('on:widget-action')
                        // simulate Node-RED node receiving an input as to trigger on('input)
                        widgetNode.receive(evt)
                    })
                })
            }
        }

    }
    RED.nodes.registerType("ui-base", UIBaseNode);
}