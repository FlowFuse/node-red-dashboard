const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars

// load test 1 standard test data (base, page, group, theme, button)
const { testData1 } = require('../fixtures/index.js')
const { verifyFlowLoaded } = require('../utils.js')
const testFlow1 = testData1.flows
const nodeImports = testData1.getImports(null, ['ui_spacer', 'ui_button'])

helper.init(require.resolve('node-red'))

describe('ui-spacer node', function () {
    beforeEach(function (done) {
        helper.startServer(done)
    })

    afterEach(function (done) {
        helper.unload()
        helper.stopServer(done)
    })
    // add a basic button and a spacer
    const flow = [
        {
            id: 'config-ui-spacer',
            type: 'ui-spacer',
            group: 'config-ui-group',
            name: 'Spacer 1',
            order: 1,
            width: '3',
            height: '3'
        },
        {
            id: 'node-ui-button',
            type: 'ui-button',
            order: 2,
            z: 'tab-id',
            group: 'config-ui-group'
        },
        ...testFlow1
    ]
    it('should be loaded', async function () {
        await helper.load(nodeImports, flow)
        // debugPrintLoadedNodes(this, helper) // uncomment to check nodes loaded
        verifyFlowLoaded(helper, flow)
        const testItem = helper.getNode('config-ui-spacer')
        should(testItem).be.an.Object()
    })

    it('should be registered with the ui-base widgets', async function () {
        // although the ui-spacer is a config node (in Node-RED terms), it is a widget in the dashboard
        await helper.load(nodeImports, flow)
        // debugPrintLoadedNodes(this, helper) // uncomment to check nodes loaded
        verifyFlowLoaded(helper, flow)
        const base = helper.getNode('config-ui-base')
        should(base).be.an.Object()
        base.should.have.property('ui')
        base.ui.should.have.property('widgets')
        base.ui.widgets.has('config-ui-spacer').should.be.true()
    })

    it('should be have correct properties', async function () {
        await helper.load(nodeImports, flow)
        // debugPrintLoadedNodes(this, helper) // uncomment to check nodes loaded
        verifyFlowLoaded(helper, flow)
        const base = helper.getNode('config-ui-base')
        should(base).be.an.Object()
        base.should.have.property('ui')
        base.ui.should.have.property('widgets')
        const group = base.ui.groups.get('config-ui-group')
        const spacer = base.ui.widgets.get('config-ui-spacer')
        should(spacer).be.an.Object()
        spacer.should.have.property('props').and.be.an.Object()
        spacer.props.should.have.property('group', group.id)
        spacer.props.should.have.property('name', 'Spacer 1')
        spacer.props.should.have.property('order', 1)
        spacer.props.should.have.property('width', '3')
        spacer.props.should.have.property('height', '3')
        spacer.should.have.property('layout').and.be.an.Object()
        spacer.layout.should.have.property('order', 1)
        spacer.layout.should.have.property('width', '3')
        spacer.layout.should.have.property('height', '3')
    })
})
