const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars

// load test 1 standard test data (base, page, group, theme) plus a link
const { testData1 } = require('../fixtures/index.js')
const { verifyFlowLoaded } = require('../utils.js')
const testFlow1 = testData1.flows
const nodeImports = testData1.getImports(['ui_link'], ['ui_button'])

helper.init(require.resolve('node-red'))

describe('ui-link config node', function () {
    beforeEach(function (done) {
        helper.startServer(done)
    })

    afterEach(function (done) {
        helper.unload()
        helper.stopServer(done)
    })

    const link = {
        id: 'config-ui-link',
        type: 'ui-link',
        name: 'Link 1',
        ui: 'config-ui-base',
        path: 'https://flowfuse.com',
        icon: 'link',
        order: 2,
        target: '_blank',
        visible: true,
        disabled: false
    }
    // add a basic button so that _something_ is registered with the ui-base
    const flow = [
        link,
        {
            id: 'node-ui-button',
            type: 'ui-button',
            z: 'tab-id',
            group: 'config-ui-group'
        },
        ...testFlow1
    ]

    async function loadLink (overrides) {
        const updatedFlow = JSON.parse(JSON.stringify(flow))
        updatedFlow[0] = { ...updatedFlow[0], ...overrides }
        await helper.load(nodeImports, updatedFlow)
        verifyFlowLoaded(helper, updatedFlow)
        const base = helper.getNode('config-ui-base')
        return base.ui.pages.get('config-ui-link')
    }

    it('should be registered with the ui-base pages', async function () {
        const page = await loadLink()
        should(page).be.an.Object()
        page.should.have.property('type', 'ui-link')
        page.should.have.property('path', 'https://flowfuse.com')
        page.should.have.property('visible', true)
        page.should.have.property('disabled', false)
    })

    describe('target property', function () {
        it('should keep a new tab target', async function () {
            const page = await loadLink({ target: '_blank' })
            page.should.have.property('target', '_blank')
        })
        it('should keep a same tab target', async function () {
            const page = await loadLink({ target: '_self' })
            page.should.have.property('target', '_self')
        })
        it('should default to the same tab for older links without a target', async function () {
            const page = await loadLink({ target: undefined })
            page.should.have.property('target', '_self')
        })
        it('should default to the same tab for an invalid target', async function () {
            const page = await loadLink({ target: 'somewhere' })
            page.should.have.property('target', '_self')
        })
    })
})
