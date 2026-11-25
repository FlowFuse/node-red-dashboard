const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { runInNewContext } = require('node:vm')

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

    const titleCases = [
        { config: { disp: false }, expected: false, description: 'preserve a hidden legacy title' },
        { config: { disp: true }, expected: true, description: 'preserve a visible legacy title' },
        { config: {}, expected: true, description: 'show the title by default' },
        { config: { disp: false, showTitle: true }, expected: true, description: 'prefer an explicit showTitle value' }
    ]
    for (const { config, expected, description } of titleCases) {
        it('should ' + description, async function () {
            const groupFlow = flow.map(node => node.id === 'config-ui-group' ? { ...node, ...config } : node)
            await helper.load(nodeImports, groupFlow)
            const group = helper.getNode('config-ui-base').ui.groups.get('config-ui-group')
            group.should.have.property('showTitle', expected)
        })
    }

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

describe('ui-group editor', function () {
    const html = readFileSync(resolve(__dirname, '../../../nodes/config/ui_group.html'), 'utf8')
    const script = html.match(/<script type="text\/javascript">([\s\S]*?)<\/script>/)[1]

    function openTitleCheckbox (config) {
        let definition
        let checked = /<input\b[^>]*\bchecked\s+id="node-config-input-showTitle"/.test(html)
        const otherField = {
            ffElementSizer () {},
            on () {},
            val () { return this },
            trigger () {},
            empty () { return this },
            text () { return this },
            appendTo () {},
            hide () {}
        }
        const titleField = {
            prop (name, value) {
                if (name === 'checked' && value !== undefined) {
                    checked = Boolean(value)
                }
            }
        }
        runInNewContext(script, {
            RED: {
                _: key => key,
                nodes: {
                    registerType: (type, nodeDefinition) => { definition = nodeDefinition },
                    node: () => undefined
                }
            },
            $: selector => selector === '#node-config-input-showTitle' ? titleField : otherField
        })

        // Node-RED imports declared properties and populates inputs before oneditprepare.
        const node = {}
        for (const [name, { value }] of Object.entries(definition.defaults)) {
            node[name] = config[name] === undefined ? value : config[name]
        }
        titleField.prop('checked', node.showTitle)
        definition.oneditprepare.call(node)
        return checked
    }

    it('keeps the title checkbox unchecked for a hidden legacy title', function () {
        should(openTitleCheckbox({ disp: false })).be.false()
    })

    it('checks the title checkbox for a visible legacy title or by default', function () {
        should(openTitleCheckbox({ disp: true })).be.true()
        should(openTitleCheckbox({})).be.true()
    })

    it('keeps the explicit title setting when the legacy setting differs', function () {
        should(openTitleCheckbox({ disp: true, showTitle: false })).be.false()
        should(openTitleCheckbox({ disp: false, showTitle: true })).be.true()
    })
})
