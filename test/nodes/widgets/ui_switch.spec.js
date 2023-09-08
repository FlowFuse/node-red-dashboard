const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars

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
            msg.should.have.property('topic', 'topic')
        })

        sNode.receive({ payload: true })
    })
})
