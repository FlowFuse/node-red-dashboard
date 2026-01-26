const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars
const sinon = require('sinon/lib/sinon.js')

// load test 1 standard test data (base, page, group, theme, button)
const { testData1 } = require('../fixtures/index.js')
const { verifyFlowLoaded } = require('../utils.js')
const testFlow1 = testData1.flows
const nodeImports = testData1.getImports(null, ['ui_button'])

helper.init(require.resolve('node-red'))

/** utility to wait for an event and return a promise */
function on (emitter, event) {
    return new Promise((resolve) => {
        emitter.on(event, resolve)
    })
}

describe('ui-button node', function () {
    beforeEach(function (done) {
        helper.startServer(done)
    })

    afterEach(function (done) {
        helper.unload()
        helper.stopServer(done)
    })

    const flow = [
        {
            id: 'node-ui-button',
            type: 'ui-button',
            z: 'tab-id',
            group: 'config-ui-group',
            name: '',
            label: 'button',
            order: 0,
            width: 0,
            height: 0,
            emulateClick: true,
            tooltip: '',
            color: '',
            bgcolor: '',
            className: '',
            icon: '',
            payload: 'I was clicked',
            payloadType: 'str',
            topic: 'topic',
            topicType: 'msg',
            x: 290,
            y: 180,
            wires: [
                ['helper-node']
            ]
        },
        {
            id: 'helper-node',
            type: 'helper'
        },
        ...testFlow1
    ]

    it('should be loaded', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const button = helper.getNode('node-ui-button')
        should(button).be.an.Object()
    })

    it('should be registered with the ui-base', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const base = helper.getNode('config-ui-base')
        should(base).be.an.Object()
        base.should.have.property('ui')
        base.ui.should.have.property('widgets')
        base.ui.widgets.has('node-ui-button').should.be.true()
    })

    it('should be registered with the ui-base with the correct defaults', async function () {
        // "runtime-event",{id:"runtime-state",payload:{state: 'stop', error:"missing-types", type:"warning",text:"notification.warnings.missing-types",types:activeFlowConfig.missingTypes},retain:true});
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const base = helper.getNode('config-ui-base')
        const widget = base.ui.widgets.get('node-ui-button')

        // base config should be correct
        widget.id.should.equal('node-ui-button')
        widget.type.should.equal('ui-button')

        // default UI component state
        widget.should.have.property('state')
        widget.state.should.have.property('enabled', true)
        widget.state.should.have.property('visible', true)

        // check we have our properties set correctly
        widget.should.have.property('props')
        widget.props.should.have.property('label', flow[0].label)
    })

    it('should emit a msg-input event via socketio when the node receives an input in Node-RED', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const base = helper.getNode('config-ui-base')

        // mock a socket.io socket connection and add it to the connections lookup
        const socket = {
            id: 'fake-conn-id',
            emit: sinon.spy()
        }

        // add a fake connection so that button has somewhere to emit to and we can spy on it
        base.uiShared.connections['fake-conn-id'] = socket

        // now send a message to the node
        const button = helper.getNode('node-ui-button')
        const hNode = helper.getNode('helper-node')
        await new Promise((resolve, reject) => {
            hNode.on('input', (msg) => {
                try {
                    socket.emit.calledOnce.should.be.true()
                    const args = socket.emit.args[0] // [0][0] is the event name, [0][1] is the payload
                    args[0].should.equal('msg-input:' + button.id)
                    args[1].should.be.an.Object()
                    args[1].should.have.property('payload', 'I was clicked')
                    resolve()
                } catch (err) {
                    console.error(err)
                    reject(err)
                }
            })
            button.receive({})
        })
    })

    it('should receive an iso date in payload', async function () {
        const copyOfFlow = JSON.parse(JSON.stringify(flow))
        const buttonDefinition = copyOfFlow.find(n => n.id === 'node-ui-button')
        buttonDefinition.payload = 'iso'
        buttonDefinition.payloadType = 'date'
        await helper.load(nodeImports, copyOfFlow)
        verifyFlowLoaded(helper, copyOfFlow)
        const base = helper.getNode('config-ui-base')

        // setup a fake connection so that button has somewhere to emit to and we can spy on it
        const socket = {
            id: 'fake-conn-id',
            emit: sinon.spy()
        }
        base.uiShared.connections['fake-conn-id'] = socket // fake connection so that button has somewhere to emit

        // send a message to the button node
        const button = helper.getNode('node-ui-button')
        const hNode = helper.getNode('helper-node')
        const inputPromise = on(hNode, 'input')
        button.receive({})
        const msg = await inputPromise

        // tests
        socket.emit.calledOnce.should.be.true()
        const [eventName, message] = socket.emit.args[0] // [0][0] is the event name, [0][1] is the payload
        eventName.should.equal('msg-input:' + button.id)
        message.should.equal(msg)
        msg.should.have.property('payload').and.be.a.String()
        new Date(msg.payload).getTime().should.be.approximately(Date.now(), 500) // within 0.5 second
    })

    it('should receive a date object in payload', async function () {
        const copyOfFlow = JSON.parse(JSON.stringify(flow))
        const buttonDefinition = copyOfFlow.find(n => n.id === 'node-ui-button')
        buttonDefinition.payload = 'object'
        buttonDefinition.payloadType = 'date'
        await helper.load(nodeImports, copyOfFlow)
        verifyFlowLoaded(helper, copyOfFlow)
        const base = helper.getNode('config-ui-base')

        // setup a fake connection so that button has somewhere to emit to and we can spy on it
        const socket = {
            id: 'fake-conn-id',
            emit: sinon.spy()
        }
        base.uiShared.connections['fake-conn-id'] = socket // fake connection so that button has somewhere to emit

        // send a message to the button node
        const button = helper.getNode('node-ui-button')
        const hNode = helper.getNode('helper-node')
        const inputPromise = on(hNode, 'input')
        button.receive({})
        const msg = await inputPromise

        // tests
        socket.emit.calledOnce.should.be.true()
        const [eventName, message] = socket.emit.args[0] // [0][0] is the event name, [0][1] is the payload
        eventName.should.equal('msg-input:' + button.id)
        message.should.equal(msg)
        msg.should.have.property('payload').and.be.an.instanceOf(Date)
        msg.payload.getTime().should.be.approximately(Date.now(), 500) // within 0.5 second
    })

    it('should receive an epoch time value in payload', async function () {
        const copyOfFlow = JSON.parse(JSON.stringify(flow))
        const buttonDefinition = copyOfFlow.find(n => n.id === 'node-ui-button')
        buttonDefinition.payload = '' // should be blank for epoch time
        buttonDefinition.payloadType = 'date'
        await helper.load(nodeImports, copyOfFlow)
        verifyFlowLoaded(helper, copyOfFlow)
        const base = helper.getNode('config-ui-base')

        // setup a fake connection so that button has somewhere to emit to and we can spy on it
        const socket = {
            id: 'fake-conn-id',
            emit: sinon.spy()
        }
        base.uiShared.connections['fake-conn-id'] = socket // fake connection so that button has somewhere to emit

        // send a message to the button node
        const button = helper.getNode('node-ui-button')
        const hNode = helper.getNode('helper-node')
        const inputPromise = on(hNode, 'input')
        button.receive({})
        const msg = await inputPromise

        // tests
        socket.emit.calledOnce.should.be.true()
        const [eventName, message] = socket.emit.args[0] // [0][0] is the event name, [0][1] is the payload
        eventName.should.equal('msg-input:' + button.id)
        message.should.equal(msg)
        msg.should.have.property('payload').and.be.a.Number()
        msg.payload.should.be.approximately(Date.now(), 500) // within 0.5 second
    })
})
