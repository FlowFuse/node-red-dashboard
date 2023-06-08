// const Emitter = require('events').EventEmitter
const fs = require('fs')
const path = require('path')

module.exports = function(RED) {
    // const { Server } = require("socket.io")
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

        // CREATE VUE APP
        // ui.create()

        console.log(n.path)
        /** @type { import('socket.io').ServerOptions } */
        this.options = {}
        this.options.path = n.path
        this.port = 1881

        /** @type { import('express').Application } */
        this.app = express()
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))

        // const index = fs.readFileSync(path.join(__dirname, '../../ui/public/index.html'))

        this.app.use('/ui', express.static(path.join(__dirname, '../../ui/public/')))
          
        const server = this.app.listen(this.port, () => {
            console.log(`Example app listening on port ${this.port}`)
        })

        // this.io = new Server(RED.server, this.options)
        // this.io.listen(this.port)

        // Make sure we clean up after ourselves
        node.on('close', async (done) => {
            // this.io.close()
            if (server) {
                server.close(() => {
                    console.log('server shut down')
                })
            }
            // TODO: clean everything up
            done()
        })
    }
    console.log('register base')
    RED.nodes.registerType("ui_base", UIBaseNode);
}