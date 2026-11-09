/* eslint-disable no-template-curly-in-string */
const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars

// load test 1 standard test data (base, page, group, theme) plus a text widget
const { testData1 } = require('../fixtures/index.js')
const testFlow1 = testData1.flows
const nodeImports = testData1.getImports(null, ['ui_text'])

helper.init(require.resolve('node-red'))

describe('ui-base config node', function () {
    beforeEach(function (done) {
        helper.startServer(done)
    })

    afterEach(function (done) {
        helper.unload()
        helper.stopServer(done)
    })

    describe('widgets in subflow instances', function () {
        // a subflow with a text widget whose group is set by the subflow instance
        const flow = [
            { id: 'tab-id', type: 'tab', label: 'Flow 1' },
            {
                id: 'subflow-def',
                type: 'subflow',
                name: 'Text Subflow',
                in: [],
                out: [],
                env: [{ name: 'group', type: 'ui-group', value: '', ui: { type: 'conf-types' } }]
            },
            { id: 'subflow-text', type: 'ui-text', z: 'subflow-def', group: '${group}', name: '', label: 'Text', format: '{{msg.payload}}', layout: 'row-spread', x: 200, y: 60, wires: [] },
            {
                id: 'instance-named-order',
                type: 'subflow:subflow-def',
                z: 'tab-id',
                name: 'named order',
                x: 120,
                y: 60,
                wires: [],
                env: [
                    { name: 'group', value: 'config-ui-group', type: 'conf-type' },
                    { name: 'DB2_SF_ORDER', value: '2', type: 'str' }
                ]
            },
            {
                id: 'instance-legacy-order',
                type: 'subflow:subflow-def',
                z: 'tab-id',
                name: 'legacy order',
                x: 120,
                y: 120,
                wires: [],
                env: [
                    { name: 'group', value: 'config-ui-group', type: 'conf-type' },
                    { key: 'DB2_SF_ORDER', value: 1, type: 'str' } // format written by versions <= 1.35.0
                ]
            },
            {
                id: 'instance-no-order',
                type: 'subflow:subflow-def',
                z: 'tab-id',
                name: 'no order',
                x: 120,
                y: 180,
                wires: [],
                env: [
                    { name: 'group', value: 'config-ui-group', type: 'conf-type' }
                ]
            },
            ...testFlow1
        ]

        it('should get the layout order of their subflow instance', async function () {
            await helper.load(nodeImports, flow)
            const base = helper.getNode('config-ui-base')
            const orders = {}
            for (const widget of base.ui.widgets.values()) {
                if (widget.props.subflow) {
                    orders[widget.props.subflow.name] = widget.props.subflow.order
                }
            }
            orders.should.deepEqual({ 'named order': 2, 'legacy order': 1, 'no order': 0 })
        })
    })

    describe('deprecated sizer endpoint', function () {
        const endpoint = '/dashboard/api/v1/deprecated-sizer'

        function deprecationWarnings () {
            return helper.log().args
                .map(args => args[0])
                .filter(event => event.level === helper.log().WARN && String(event.msg).includes('is deprecated'))
                .map(event => event.msg)
        }

        beforeEach(async function () {
            await helper.load(nodeImports, testFlow1)
        })

        it('should reject an unknown sizer name', async function () {
            await helper.request().post(endpoint).send({ name: 'notASizer', type: 'unknown-name-node' }).expect(400)
            deprecationWarnings().should.have.length(0)
        })

        it('should log once per sizer name and node type', async function () {
            await helper.request().post(endpoint).send({ name: 'elementSizer', type: 'once-node-a' }).expect(204)
            await helper.request().post(endpoint).send({ name: 'elementSizer', type: 'once-node-a' }).expect(204)
            await helper.request().post(endpoint).send({ name: 'elementSizerByNum', type: 'once-node-a' }).expect(204)
            await helper.request().post(endpoint).send({ name: 'elementSizer', type: 'once-node-b' }).expect(204)
            deprecationWarnings().should.deepEqual([
                '[@flowfuse/node-red-dashboard] $.fn.elementSizer is deprecated and will be removed, use $.fn.ffElementSizer instead (used by "once-node-a")',
                '[@flowfuse/node-red-dashboard] $.fn.elementSizerByNum is deprecated and will be removed, use $.fn.ffElementSizerByNum instead (used by "once-node-a")',
                '[@flowfuse/node-red-dashboard] $.fn.elementSizer is deprecated and will be removed, use $.fn.ffElementSizer instead (used by "once-node-b")'
            ])
        })

        it('should log without a node type when none is sent', async function () {
            await helper.request().post(endpoint).send({ name: 'elementSizer' }).expect(204)
            deprecationWarnings().should.deepEqual([
                '[@flowfuse/node-red-dashboard] $.fn.elementSizer is deprecated and will be removed, use $.fn.ffElementSizer instead'
            ])
        })
    })
})
