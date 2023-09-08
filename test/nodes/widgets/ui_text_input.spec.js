const helper = require('node-red-node-test-helper')
const should = require('should')

// load test 1 standard test data (base, page, group, theme, slider)
// eslint-disable-next-line no-unused-vars
const { testData1 } = require('../fixtures/index.js')
const { verifyFlowLoaded } = require('../utils.js')
const testFlow1 = testData1.flows
const nodeImports = testData1.getImports(null, ['ui_text_input'])

helper.init(require.resolve('node-red'))

describe('ui-text-input node', function () {
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
            id: 'node-ui-text-input',
            type: 'ui-text-input',
            z: 'tab-id',
            group: 'config-ui-group',
            name: '',
            label: 'type: text',
            order: 0,
            width: 0,
            height: 0,
            mode: 'text',
            passthru: true,
            x: 920,
            y: 220,
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
                'node-ui-text-input'
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
        const n = helper.getNode('node-ui-text-input')
        should(n).be.an.Object()
    })

    it('should be registered with the ui-base', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)

        const base = helper.getNode('config-ui-base')
        should(base).be.an.Object()
        base.should.have.property('ui')
        base.ui.should.have.property('widgets')
        base.ui.widgets.has('node-ui-text-input').should.be.true()
    })

    it('should set topic on any messages emitted from this node', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)

        const sNode = helper.getNode('node-ui-text-input')
        const hNode = helper.getNode('helper-node')
        hNode.on('input', (msg) => {
            // check the message passed to the next node contains the correct topic
            msg.should.have.property('topic', 'topic')
        })

        sNode.receive({ payload: true })
    })

    it('should not send on msg if passthru is set to false', async function () {
        const flow2 = flow.map((node) => {
            return { ...node }
        })

        flow2[1].passthru = false

        await helper.load(nodeImports, flow2)
        verifyFlowLoaded(helper, flow2)

        await new Promise((resolve, reject) => {
            const tNode = helper.getNode('node-ui-text-input')

            const helperAfterSlider = helper.getNode('helper-node')
            const helperAfterComplete = helper.getNode('helper-node-complete')
            helperAfterComplete.on('input', (msg) => {
                try {
                    tNode._msg.payload.should.equal(msg.payload)
                    msgSent.should.be.false()
                    resolve()
                } catch (err) {
                    reject(err)
                }
            })

            let msgSent = false
            helperAfterSlider.on('input', (msg) => {
                msgSent = true
            })

            tNode.receive({
                payload: 'a'
            })
        })
    })
})
