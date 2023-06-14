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
            node.log('connected established via io')

            // socket.emit('msg', 'ui-config', {
            //     pages: Object.fromEntries(node.ui.pages),
            //     widgets: Object.fromEntries(node.ui.widgets)
            // })

            socket.emit('ui-config', 'randomid', {
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
            pages: new Map(),
            widgets: new Map()
        }

        /**
         * 
         * @param {*} page 
         * @param {*} widget 
         */
        node.register = function (page, widget) {
            console.log('page id: ' + page.id)
            console.log('widget id: ' + widget.id)
            if (!node.ui.pages.has(page.id)) {
                node.ui.pages.set(page.id, page)
            }
            // map widgets on a page-by-page basis
            if (!node.ui.widgets.has(page.id)) {
                node.ui.widgets.set(page.id, {})
            }
            console.log('widget: ' + node.ui.widgets.get(page.id))
            // add the widget to the page-mapping
            node.ui.widgets.get(page.id)[widget.id] = widget
        }

    }
    RED.nodes.registerType("ui-base", UIBaseNode);
}