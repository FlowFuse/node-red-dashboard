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
    const http = require('http')
    const { Server } = require("socket.io")
    // const ui = require('../../ui/src/main')

    // const emitter = new Emitter()
    
    /**
     * 
     * @param {*} n 
     */
    function UIBaseNode(n) {
        const express = require('express')

        const node = this

        RED.nodes.createNode(node, n);

        /**
         * Configure & Run Express Server
         */
        node.port = 1881


        /** @type { import('express').Application } */
        node.app = express()
        node.app.use(express.json())
        node.app.use(express.urlencoded({ extended: true }))

        /**
         * Create Web Server
         */
        node.app.use(n.path, express.static(path.join(__dirname, '../../dist')))

        node.app.get(n.path, (req,res) => {
            res.sendFile(path.join(__dirname, '../../dist/index.html'));
        });

        node.app.get(n.path + '/*', (req,res) => {
            res.sendFile(path.join(__dirname, '../../dist/index.html'));
        });

          
        
        const server = http.createServer(node.app)
        server.listen(node.port, () => {
            node.log(`Dashboard UI listening at ${n.path} on port ${node.port}`)
        })


        // Make sure we clean up after ourselves
        node.on('close', async (done) => {
            if (server) {
                node.io.close()
                server.close(() => {
                    node.log('server shut down')
                })
            }
            done()
        })

        /**
         * Create IO Server for comms between Node-RED and UI
         */
        /** @type { import('socket.io').ServerOptions } */
        const fullPath = join(RED.settings.httpNodeRoot, n.path)
        const socketIoPath = join(fullPath, 'socket.io')
        node.io = new Server(server, {
            path: socketIoPath
        })

        var bindOn = RED.server ? "bound to Node-RED port" : "on port " + node.port
        node.log("Created socket.io server " + bindOn + " at path " + socketIoPath)

        node.io.on('connection', function(socket) {
            node.socketio = socket

            node.log('connected established via io')

            // socket.emit('msg', 'ui-config', {
            //     pages: Object.fromEntries(node.ui.pages),
            //     widgets: Object.fromEntries(node.ui.widgets)
            // })

            socket.emit('ui-config', 'randomid', {
                dashboards: Object.fromEntries(node.ui.dashboards),
                pages: Object.fromEntries(node.ui.pages),
                widgets: Object.fromEntries(node.ui.widgets)
            })

            socket.on("msg", (topic, payload) => {
                node.log('msg received')
                node.log(topic, payload)
            })

            socket.on("widget-action", (nodeid, payload) => {
                node.log('widget actioned')
                node.log(nodeid, payload)
            })
            
            // handle disconnection
            socket.on("disconnect", reason => {
                node.log(`Disconnected ${socket.id} due to ${reason}`)
            })
        })


        /**
         * External Functions for managing UI Components
         */

        node.ui = {
            dashboards: new Map(),
            pages: new Map(),
            widgets: new Map()
        }

        /**
         * 
         * @param {*} page 
         * @param {*} widget 
         */
        node.register = function (page, widgetNode, widgetConfig, widgetEvents) {
            console.log('dashboard id: ' + n.id)
            console.log('page id: ' + page.id)
            console.log('widget id: ' + widgetConfig.id)

            // strip widgetConfig of stuff we don't really care about (e.g. Node-RED x/y coordinates)
            // and leave us just with the properties set inside the Node-RED Editor, store as "props"
            const widget = {
                id: widgetConfig.id,
                type: widgetConfig.type,
                props: widgetConfig
            }
            delete widget.props.id
            delete widget.props.type
            delete widget.props.x
            delete widget.props.y
            delete widget.props.z
            delete widget.props.wires

            // map dashboards by their ID
            if (!node.ui.dashboards.has(n.id)) {
                node.ui.dashboards.set(n.id, n)
            }
            
            // map pages by their ID
            if (!node.ui.pages.has(page.id)) {
                node.ui.pages.set(page.id, page)
            }

            // map widgets on a page-by-page basis
            if (!node.ui.widgets.has(page.id)) {
                node.ui.widgets.set(page.id, {})
            }
            
            // add Node-RED listener to the widget for when it's corresponding node receives a msg in Node-RED
            widgetNode.on('input', async function (msg, send, done) {
                console.log('node-red:input', msg)
                // send a message to the UI to let it know we've received a msg
                node.socketio.emit('msg-input:' + widget.id, msg)
                // store the latest msg passed to node
                widgetNode._msg = msg
                // node-specific handlers
                if (widgetEvents?.onInput) {
                    widgetEvents?.onInput(msg, send, done)
                } else {
                    done()
                }
            })

            node.io.on('connection', function(socket) {
                // add listener for when the UI loads, so that we can send any
                // stored values associated to a widget that we have in Node-RED
                socket.on('widget-load:' + widget.id, async function () {
                    console.log('on:widget-load', widgetNode._msg)
                    // rreplicate receiving an input, so the widget can handle accordingly
                    const msg = widgetNode._msg
                    if (msg) {
                        // only emit something if we have something to send
                        node.socketio.emit('msg-input:' + widget.id, msg)
                    }
                })
            })


            // Handle Socket IO Event Handlers
            if (widgetEvents?.onChange) {
                node.io.on('connection', function(socket) {

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

            // add the widget to the page-mapping
            node.ui.widgets.get(page.id)[widget.id] = widget
        }

    }
    RED.nodes.registerType("ui-base", UIBaseNode);
}