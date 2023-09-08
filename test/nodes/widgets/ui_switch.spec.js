const helper = require('node-red-node-test-helper')
const should = require('should')

// load test 1 standard test data (base, page, group, theme, switch)
// eslint-disable-next-line no-unused-vars
const { testData1 } = require('../fixtures/index.js')
const { verifyFlowLoaded } = require('../utils.js')
const testFlow1 = testData1.flows
const nodeImports = testData1.getImports(null, ['ui_switch'])

helper.init(require.resolve('node-red'))

describe('ui-switch node', function () {
    beforeEach(function (done) {
        helper.startServer(done)
    })

    afterEach(function (done) {
        helper.unload()
        helper.stopServer(done)
    })

    const flow = [
        {
            id: 'helper-node',
            type: 'helper'
        },
        {
            id: 'node-ui-switch',
            type: 'ui-switch',
            z: 'tab-id',
            name: '',
            label: 'UI Switch',
            group: 'config-ui-group',
            order: 0,
            width: '3',
            height: '1',
            passthru: true,
            topic: 'topic',
            topicType: 'str',
            style: '',
            className: '',
            onvalue: 'true',
            onvalueType: 'bool',
            onicon: '',
            oncolor: '',
            offvalue: 'false',
            offvalueType: 'bool',
            officon: '',
            offcolor: '',
            x: 410,
            y: 340,
            wires: [
                ['helper-node']
            ]
        },
        {
            id: 'helper-node-complete',
            type: 'helper'
        },
        {
            id: 'node-on-complete',
            type: 'complete',
            z: 'tab-id',
            name: '',
            scope: [
                'node-ui-switch'
            ],
            uncaught: false,
            x: 0,
            y: 0,
            wires: [
                ['helper-node-complete']
            ]
        },
        ...testFlow1
    ]

    it('should be loaded', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const n = helper.getNode('node-ui-switch')
        should(n).be.an.Object()
    })

    it('should be registered with the ui-base', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)

        const base = helper.getNode('config-ui-base')
        should(base).be.an.Object()
        base.should.have.property('ui')
        base.ui.should.have.property('widgets')
        base.ui.widgets.has('node-ui-switch').should.be.true()
    })

    it('should set topic on any messages emitted from this node', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)

        const sNode = helper.getNode('node-ui-switch')
        const hNode = helper.getNode('helper-node')
        hNode.on('input', (msg) => {
            // check the message passed to the next node contains the correct topic
            msg.should.have.property('topic', 'topic')
        })

        sNode.receive({ payload: true })
    })

    it('should set the value of the switch, if an input msg.payload matches the defined on value', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)

        await new Promise((resolve, reject) => {
            const sNode = helper.getNode('node-ui-switch')
            const hNode = helper.getNode('helper-node')
            hNode.on('input', (msg) => {
                try {
                    sNode._msg.payload.should.equal(msg.payload)
                    resolve()
                } catch (err) {
                    reject(err)
                }
            })

            sNode.receive({
                payload: true
            })
        })
    })

    it('should set the value of the switch, if an input msg.payload matches the defined off value', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        await new Promise((resolve, reject) => {
            const sNode = helper.getNode('node-ui-switch')
            const hNode = helper.getNode('helper-node')
            const helperAfterSwitch = helper.getNode('helper-node')
            hNode.on('input', (msg) => {
                // we need to be sure that the helperAfterSwitch node has run first
                setTimeout(() => {
                    try {
                        sNode._msg.payload.should.equal(msg.payload)
                        msgSent.should.be.true()
                        resolve()
                    } catch (err) {
                        reject(err)
                    }
                }, 20)
            })

            let msgSent = false
            helperAfterSwitch.on('input', (msg) => {
                msgSent = true
            })

            sNode.receive({
                payload: false
            })
        })
    })

    it('should not set the value of the switch, if an input msg.payload does not match the defined off value', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)

        await new Promise((resolve, reject) => {
            const sNode = helper.getNode('node-ui-switch')
            const helperAfterSwitch = helper.getNode('helper-node')
            const helperAfterComplete = helper.getNode('helper-node-complete')
            helperAfterComplete.on('input', (msg) => {
                // we need to be sure that the helperAfterSwitch node has run first
                setTimeout(() => {
                    try {
                        (sNode._msg === undefined).should.be.true()
                        sNode.warn.should.be.called()
                        msgSent.should.be.false()
                        resolve()
                    } catch (err) {
                        reject(err)
                    }
                }, 20)
            })

            let msgSent = false
            helperAfterSwitch.on('input', () => {
                msgSent = true
            })

            sNode.receive({
                payload: 'random'
            })
        })
    })

    it('should not send on msg if passthru is set to false', async function () {
        const flow2 = flow.map((node) => {
            return { ...node }
        })

        flow2[1].passthru = false

        await helper.load(nodeImports, flow2)
        verifyFlowLoaded(helper, flow2)

        await new Promise((resolve, reject) => {
            const sNode = helper.getNode('node-ui-switch')

            const helperAfterSwitch = helper.getNode('helper-node')
            const helperAfterComplete = helper.getNode('helper-node-complete')
            helperAfterComplete.on('input', (msg) => {
                try {
                    sNode._msg.payload.should.equal(msg.payload)
                    msgSent.should.be.false()
                    resolve()
                } catch (err) {
                    reject(err)
                }
            })

            let msgSent = false
            helperAfterSwitch.on('input', () => {
                msgSent = true
            })

            sNode.receive({
                payload: true
            })
        })
    })
})
