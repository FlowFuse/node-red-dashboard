// const Emitter = require('events').EventEmitter
const path = require('path')

//from: https://stackoverflow.com/a/28592528/3016654
// function join() {
//     var trimRegex = new RegExp('^\\/|\\/$','g');
//     var paths = Array.prototype.slice.call(arguments);
//     return '/'+paths.map(function(e) {
//         if (e) { return e.replace(trimRegex,""); }
//     }).filter(function(e) {return e;}).join('/');
// }

module.exports = function(RED) {
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

        /** @type { import('socket.io').ServerOptions } */
        // const fullPath = join(RED.settings.httpNodeRoot, n.path)
        // const socketIoPath = join(fullPath, 'socket.io')

        /** @type { import('express').Application } */
        node.app = express()
        node.app.use(express.json())
        node.app.use(express.urlencoded({ extended: true }))

        /**
         * Create IO Server for comms between Node-RED and UI
         */
        // node.io = new Server(RED.server, {
        //     path: socketIoPath
        // })
        // this.io.listen(this.port)

        // node.io.on('connection', function() {
        //     console.log('connected established via io')
        //     // console.log(socket)
        // })


        /**
         * Expose UI Endpoints
         */
        node.app.use(n.path, express.static(path.join(__dirname, '../../ui/public')))
          
        const server = node.app.listen(node.port, () => {
            console.log(`Example app listening on port ${node.port}`)
        })


        // Make sure we clean up after ourselves
        node.on('close', async (done) => {
            // this.io.close()
            if (server) {
                server.close(() => {
                    console.log('server shut down')
                })
            }
            done()
        })

        /**
         * External Functions for managing UI Components
         */

    }
    console.log('register base')
    RED.nodes.registerType("ui_base", UIBaseNode);
}