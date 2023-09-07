const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars

// load test 1 standard test data (base, page, group, theme, switch)
// eslint-disable-next-line no-unused-vars
const { getLoadedNodes, testData1 } = require('../fixtures/index.js')
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
            id: 'ui-switch',
            type: 'ui-switch',
            z: 'tab-id',
            name: '',
            label: 'UI Switch',
            group: 'config-ui-grup',
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
            id: 'helper-node',
            type: 'helper'
        },
        ...testFlow1
    ]

    it('should be loaded', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const base = helper.getNode('config-ui-base')
        const h = helper.getNode('helper-node')
        console.log(h)
        const n = helper.getNode('ui-switch')
        console.log(n)
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

    function verifyFlowLoaded (helper, flow) {
        const loadedNodes = getLoadedNodes(helper)
        loadedNodes.should.have.length(flow.length)
        loadedNodes.forEach(node => {
            const loadedNode = flow.find(item => item.id === node.id)
            should(loadedNode).be.an.Object()
            loadedNode.should.have.property('type', node.type)
        })
    }

    // eslint-disable-next-line no-unused-vars
    function debugPrintLoadedNodes (testInstance, helper) {
        // get a the full path to the test from .parent.parent.etc
        const pathItems = testInstance.test.titlePath()
        const padding = ' '.repeat(pathItems.length * 2)
        const testPath = testInstance.test.titlePath().join(' > ')
        console.log(`${padding}TEST: ${testPath}`)
        console.log(`${padding}  Loaded nodes:`)
        const loadedNodes = getLoadedNodes(helper)
        loadedNodes.forEach(node => {
            console.log(`${padding}  * ${JSON.stringify(node, null, 0)}`)
        })
    }
})
