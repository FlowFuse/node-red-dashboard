const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars

// load test 1 standard test data (base, page, group, theme, button)
const { testData1 } = require('../fixtures/index.js')
const { verifyFlowLoaded } = require('../utils.js')
const testFlow1 = testData1.flows
const nodeImports = testData1.getImports(null, ['ui_button'])

helper.init(require.resolve('node-red'))

describe('ui-group config node', function () {
    beforeEach(function (done) {
        helper.startServer(done)
    })

    afterEach(function (done) {
        helper.unload()
        helper.stopServer(done)
    })
    // add a basic button so that _something_ is registered with the ui-base
    const flow = [
        {
            id: 'node-ui-button',
            type: 'ui-button',
            z: 'tab-id',
            group: 'config-ui-group'
        },
        ...testFlow1
    ]
    it('should be loaded', async function () {
        await helper.load(nodeImports, flow)
        // debugPrintLoadedNodes(this, helper) // uncomment to check nodes loaded
        verifyFlowLoaded(helper, flow)
        const testItem = helper.getNode('config-ui-group')
        should(testItem).be.an.Object()
    })

    it('should be registered with the ui-base groups', async function () {
        await helper.load(nodeImports, flow)
        // debugPrintLoadedNodes(this, helper) // uncomment to check nodes loaded
        verifyFlowLoaded(helper, flow)
        const base = helper.getNode('config-ui-base')
        should(base).be.an.Object()
        base.should.have.property('ui')
        base.ui.should.have.property('groups')
        base.ui.groups.has('config-ui-group').should.be.true()
    })

    it('should be have correct properties', async function () {
        await helper.load(nodeImports, flow)
        // debugPrintLoadedNodes(this, helper) // uncomment to check nodes loaded
        verifyFlowLoaded(helper, flow)
        const base = helper.getNode('config-ui-base')
        should(base).be.an.Object()
        base.should.have.property('ui')
        base.ui.should.have.property('groups')
        const group = base.ui.groups.get('config-ui-group')
        should(group).be.an.Object()
        group.should.have.property('name', 'Group 1')
        group.should.have.property('ui', 'config-ui-base')
        group.should.have.property('path', '/group1')
        group.should.have.property('page', 'config-ui-page')
        group.should.have.property('layout', 'flex')
        group.should.have.property('_users')
        group._users.should.be.an.Array()
        group._users.should.have.length(1) // the basic button should be registered
    })

    it('should be registered with the ui-page', async function () {
        await helper.load(nodeImports, flow)
        // debugPrintLoadedNodes(this, helper) // uncomment to check nodes loaded
        verifyFlowLoaded(helper, flow)
        const base = helper.getNode('config-ui-base')
        const group = base.ui.groups.get('config-ui-group')
        const page = base.ui.pages.get('config-ui-page')
        group.id.should.equal('config-ui-group')
        group.should.have.property('page', page.id)
    })
})
