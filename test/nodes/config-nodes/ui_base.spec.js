/* eslint-disable no-template-curly-in-string */
const http = require('http')

const helper = require('node-red-node-test-helper')
const should = require('should')

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

    describe('debug view endpoints', function () {
        const textWidget = { id: 'debug-view-text', type: 'ui-text', z: 'tab-id', group: 'config-ui-group', name: '', label: 'Text', format: '{{msg.payload}}', layout: 'row-spread', wires: [] }
        const datastoreEndpoint = `/ui/_debug/datastore/${textWidget.id}`
        const statestoreEndpoint = `/ui/_debug/statestore/${textWidget.id}`

        function flowWithDebugView (allowDebugView) {
            const flow = JSON.parse(JSON.stringify([{ id: 'tab-id', type: 'tab', label: 'Flow 1' }, textWidget, ...testFlow1]))
            if (allowDebugView !== undefined) {
                flow.find(n => n.id === 'config-ui-base').allowDebugView = allowDebugView
            }
            return flow
        }

        // the dashboard is served by Node-RED's httpNode app, not the httpAdmin app that helper.request() targets
        function get (path) {
            const app = helper.getNode('config-ui-base').uiShared.app
            return new Promise((resolve, reject) => {
                const server = http.createServer(app).listen(0, '127.0.0.1', () => {
                    http.get({ host: '127.0.0.1', port: server.address().port, path }, (res) => {
                        let data = ''
                        res.on('data', (chunk) => { data += chunk })
                        res.on('end', () => {
                            server.close()
                            resolve({ status: res.statusCode, body: res.statusCode === 200 && data ? JSON.parse(data) : undefined })
                        })
                    }).on('error', (err) => {
                        server.close()
                        reject(err)
                    })
                })
            })
        }

        it('should serve the debug endpoints for dashboards created before the option existed', async function () {
            await helper.load(nodeImports, flowWithDebugView())
            const base = helper.getNode('config-ui-base')
            base.ui.dashboards.get('config-ui-base').should.have.property('allowDebugView', true)
            base.stores.data.save(base, helper.getNode(textWidget.id), { payload: 'hello' })

            const datastore = await get(datastoreEndpoint)
            datastore.should.have.property('status', 200)
            datastore.body.should.have.property('payload', 'hello')
            should(await get(statestoreEndpoint)).have.property('status', 200)
        })

        it('should serve the debug endpoints when the Debug View is allowed', async function () {
            await helper.load(nodeImports, flowWithDebugView(true))
            should(await get(datastoreEndpoint)).have.property('status', 200)
            should(await get(statestoreEndpoint)).have.property('status', 200)
        })

        it('should not serve the debug endpoints when the Debug View is not allowed', async function () {
            await helper.load(nodeImports, flowWithDebugView(false))
            should(await get(datastoreEndpoint)).have.property('status', 404)
            should(await get(statestoreEndpoint)).have.property('status', 404)
        })

        it('should follow the option when the ui-base is redeployed', async function () {
            await helper.load(nodeImports, flowWithDebugView(true))
            should(await get(datastoreEndpoint)).have.property('status', 200)

            await helper.setFlows(flowWithDebugView(false), 'nodes')
            should(await get(datastoreEndpoint)).have.property('status', 404)

            await helper.setFlows(flowWithDebugView(true), 'nodes')
            should(await get(datastoreEndpoint)).have.property('status', 200)
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

        it('should stop logging new node types after 100 have been reported', async function () {
            for (let i = 0; i < 100; i++) {
                await helper.request().post(endpoint).send({ name: 'elementSizer', type: `cap-node-${i}` }).expect(204)
            }
            helper.log().resetHistory()
            await helper.request().post(endpoint).send({ name: 'elementSizer', type: 'cap-node-over' }).expect(204)
            deprecationWarnings().should.have.length(0)
        })
    })
})
