const EventEmitter = require('events')

const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars

const { testData1 } = require('../fixtures/index.js')
const { verifyFlowLoaded } = require('../utils.js')
const testFlow1 = testData1.flows
const nodeImports = testData1.getImports(null, ['ui_event'])

helper.init(require.resolve('node-red'))

function connectFakeClient (base, id) {
    const socket = new EventEmitter()
    socket.id = id
    socket._baseId = base.id
    socket.handshake = { query: {} }
    base.uiShared.connections[id] = socket
    return socket
}

function nextInput (node, timeout = 500) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('no message received')), timeout)
        node.once('input', (msg) => {
            clearTimeout(timer)
            resolve(msg)
        })
    })
}

describe('ui-event node', function () {
    let base = null
    const socketIds = []

    beforeEach(function (done) {
        helper.startServer(done)
    })

    afterEach(function (done) {
        if (base) {
            socketIds.forEach(id => delete base.uiShared.connections[id])
        }
        socketIds.length = 0
        base = null
        helper.unload()
        helper.stopServer(done)
    })

    const flow = [
        {
            id: 'node-ui-event',
            type: 'ui-event',
            z: 'tab-id',
            ui: 'config-ui-base',
            name: '',
            wires: [['helper-node']]
        },
        {
            id: 'helper-node',
            type: 'helper'
        },
        ...testFlow1
    ]

    function renamedFlow (name) {
        const copy = JSON.parse(JSON.stringify(flow))
        copy.find(n => n.id === 'node-ui-event').name = name
        return copy
    }

    it('should be loaded', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        should(helper.getNode('node-ui-event')).be.an.Object()
    })

    it('should send events from an already-connected client after the ui-event node is redeployed', async function () {
        await helper.load(nodeImports, flow)
        base = helper.getNode('config-ui-base')
        const socket = connectFakeClient(base, 'fake-conn-1')
        socketIds.push(socket.id)

        await helper.setFlows(renamedFlow('changed'), 'nodes')

        const received = nextInput(helper.getNode('helper-node'))
        socket.emit('ui-event', 'node-ui-event', { payload: '$pageview' })
        const msg = await received
        msg.should.have.property('payload', '$pageview')
    })

    it('should send events from an already-connected client after a full deploy', async function () {
        await helper.load(nodeImports, flow)
        base = helper.getNode('config-ui-base')
        const socket = connectFakeClient(base, 'fake-conn-1')
        socketIds.push(socket.id)

        await helper.setFlows(renamedFlow('changed'), 'full')
        base = helper.getNode('config-ui-base')
        socket.listenerCount('ui-event').should.equal(1)

        const received = nextInput(helper.getNode('helper-node'))
        socket.emit('ui-event', 'node-ui-event', { payload: '$pageview' })
        const msg = await received
        msg.should.have.property('payload', '$pageview')
    })

    it('should keep exactly one ui-event listener per connected client across repeated deploys', async function () {
        await helper.load(nodeImports, flow)
        base = helper.getNode('config-ui-base')
        const first = connectFakeClient(base, 'fake-conn-1')
        const second = connectFakeClient(base, 'fake-conn-2')
        socketIds.push(first.id, second.id)

        await helper.setFlows(renamedFlow('one'), 'nodes')
        await helper.setFlows(renamedFlow('two'), 'nodes')

        first.listenerCount('ui-event').should.equal(1)
        second.listenerCount('ui-event').should.equal(1)
    })
})
