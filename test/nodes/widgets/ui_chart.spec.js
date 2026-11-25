const { EventEmitter, once } = require('node:events')

const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars

const datastore = require('../../../nodes/store/data.js')
const { testData1 } = require('../fixtures/index.js')
const testFlow1 = testData1.flows
const nodeImports = testData1.getImports(null, ['ui_chart'])

helper.init(require.resolve('node-red'))

describe('ui-chart node', function () {
    beforeEach(function (done) {
        helper.startServer(done)
    })

    afterEach(function (done) {
        helper.unload()
        helper.stopServer(done)
    })

    function chartFlow (overrides) {
        return [
            {
                id: 'node-ui-chart',
                type: 'ui-chart',
                z: 'tab-id',
                group: 'config-ui-group',
                name: '',
                label: 'chart',
                order: 0,
                chartType: 'line',
                category: 'topic',
                categoryType: 'msg',
                xAxisProperty: '',
                xAxisPropertyType: 'timestamp',
                xAxisType: 'time',
                yAxisProperty: 'payload',
                yAxisPropertyType: 'msg',
                action: 'append',
                width: 4,
                height: 4,
                wires: [],
                ...overrides
            },
            ...testFlow1
        ]
    }

    async function datapointFor (overrides, msg) {
        const flow = chartFlow(overrides)
        await helper.load(nodeImports, flow)
        const chart = helper.getNode('node-ui-chart')
        const base = helper.getNode('config-ui-base')
        const widget = base.ui.widgets.get('node-ui-chart')
        const out = widget.hooks.beforeSend({ ...msg })
        should(chart).be.an.Object()
        return out._datapoint
    }

    it('uses msg.payload for a numeric payload by default', async function () {
        const dp = await datapointFor({}, { topic: 'a', payload: 7, value: 3 })
        dp.y.should.equal(7)
    })

    it('uses the configured msg property for the y value when payload is a number', async function () {
        const dp = await datapointFor({ yAxisProperty: 'value', yAxisPropertyType: 'msg' }, { topic: 'a', payload: 7, value: 3 })
        dp.y.should.equal(3)
    })

    it('uses the configured msg property for the y value when payload is a string', async function () {
        const dp = await datapointFor({ yAxisProperty: 'value', yAxisPropertyType: 'msg' }, { topic: 'a', payload: '7', value: 3 })
        dp.y.should.equal(3)
    })

    it('uses the configured msg property for the y value when msg.payload is not set', async function () {
        const dp = await datapointFor({ yAxisProperty: 'value', yAxisPropertyType: 'msg' }, { topic: 'a', value: 3 })
        dp.y.should.equal(3)
    })

    it('uses the configured msg property for the y value when payload is an object', async function () {
        const dp = await datapointFor({ yAxisProperty: 'value', yAxisPropertyType: 'msg', xAxisProperty: 'ts', xAxisPropertyType: 'property' }, { topic: 'a', payload: { y: 7, ts: 123 }, value: 3 })
        dp.y.should.equal(3)
        dp.x.should.equal(123)
    })

    it('stores a point in the datastore when y is a msg property and msg.payload is not set', async function () {
        const flow = chartFlow({ yAxisProperty: 'value', yAxisPropertyType: 'msg' })
        await helper.load(nodeImports, flow)
        const base = helper.getNode('config-ui-base')
        const widget = base.ui.widgets.get('node-ui-chart')
        datastore.save(base, helper.getNode('node-ui-chart'), [])
        const msg = widget.hooks.beforeSend({ topic: 'a', value: 3 })
        await new Promise((resolve) => widget.hooks.onInput(msg, resolve, () => {}))
        const stored = datastore.get('node-ui-chart')
        stored.should.have.length(1)
        stored[0]._datapoint.y.should.equal(3)
    })

    it('does not store a point for a ui_update msg without payload', async function () {
        const flow = chartFlow({ yAxisProperty: 'value', yAxisPropertyType: 'msg' })
        await helper.load(nodeImports, flow)
        const base = helper.getNode('config-ui-base')
        const widget = base.ui.widgets.get('node-ui-chart')
        datastore.save(base, helper.getNode('node-ui-chart'), [])
        const msg = widget.hooks.beforeSend({ topic: 'a', ui_update: { chartOptions: {} } })
        await new Promise((resolve) => widget.hooks.onInput(msg, resolve, () => {}))
        datastore.get('node-ui-chart').should.have.length(0)
    })

    it('stores a point for a msg carrying both a ui_update and a value in the y property', async function () {
        const flow = chartFlow({ yAxisProperty: 'value', yAxisPropertyType: 'msg' })
        await helper.load(nodeImports, flow)
        const base = helper.getNode('config-ui-base')
        const widget = base.ui.widgets.get('node-ui-chart')
        datastore.save(base, helper.getNode('node-ui-chart'), [])
        const msg = widget.hooks.beforeSend({ topic: 'a', value: 3, ui_update: { chartOptions: {} } })
        await new Promise((resolve) => widget.hooks.onInput(msg, resolve, () => {}))
        const stored = datastore.get('node-ui-chart')
        stored.should.have.length(1)
        stored[0]._datapoint.y.should.equal(3)
    })

    it('emits a chart options update when the parent of the configured y property is missing', async function () {
        const flow = chartFlow({ yAxisProperty: 'value.y', yAxisPropertyType: 'msg' })
        await helper.load(nodeImports, flow)
        const chart = helper.getNode('node-ui-chart')
        const base = helper.getNode('config-ui-base')
        const emitter = new EventEmitter()
        base.uiShared.connections['chart-test'] = { id: 'chart-test', emit: emitter.emit.bind(emitter) }
        const history = [{ _datapoint: { x: 1, y: 3, category: 'a' } }]
        datastore.save(base, chart, history)

        const update = { chartOptions: { title: { text: 'Updated' } } }
        const received = once(emitter, 'msg-input:' + chart.id)
        chart.receive({ ui_update: update })
        const [msg] = await received
        msg.ui_update.should.deepEqual(update)
        should(msg._datapoint).equal(null)
        datastore.get(chart.id).should.deepEqual(history)
    })

    it('does not store a point when y is a msg property that is missing and msg.payload is not a clear request', async function () {
        const flow = chartFlow({ yAxisProperty: 'value', yAxisPropertyType: 'msg' })
        await helper.load(nodeImports, flow)
        const base = helper.getNode('config-ui-base')
        const widget = base.ui.widgets.get('node-ui-chart')
        datastore.save(base, helper.getNode('node-ui-chart'), [])
        for (const payload of [[{ y: 7 }], 7]) {
            const msg = widget.hooks.beforeSend({ topic: 'a', payload })
            await new Promise((resolve) => widget.hooks.onInput(msg, resolve, () => {}))
            datastore.get('node-ui-chart').should.have.length(0)
            should(msg._datapoint).equal(null)
        }
    })

    it('plots one point per JSON series regardless of the configured y msg property', async function () {
        const flow = chartFlow({ category: '["sin","cos"]', categoryType: 'json', yAxisProperty: 'payload.value', yAxisPropertyType: 'msg' })
        await helper.load(nodeImports, flow)
        const base = helper.getNode('config-ui-base')
        const widget = base.ui.widgets.get('node-ui-chart')
        datastore.save(base, helper.getNode('node-ui-chart'), [])
        const msg = widget.hooks.beforeSend({ payload: { sin: 5, cos: 8 } })
        await new Promise((resolve) => widget.hooks.onInput(msg, resolve, () => {}))
        msg._datapoint.map((d) => [d.category, d.y]).should.deepEqual([['sin', 5], ['cos', 8]])
        datastore.get('node-ui-chart').should.have.length(1)
    })

    it('plots a histogram value regardless of the configured y msg property', async function () {
        const dp = await datapointFor({ chartType: 'histogram', xAxisType: 'bins', yAxisProperty: 'value', yAxisPropertyType: 'msg' }, { topic: 'a', payload: 7 })
        dp.y.should.equal(7)
    })

    it('clears chart history with an empty payload array when y is a different msg property', async function () {
        const flow = chartFlow({ yAxisProperty: 'value', yAxisPropertyType: 'msg' })
        await helper.load(nodeImports, flow)
        const chart = helper.getNode('node-ui-chart')
        const base = helper.getNode('config-ui-base')
        const emitter = new EventEmitter()
        base.uiShared.connections['chart-test'] = { id: 'chart-test', emit: emitter.emit.bind(emitter) }
        const history = [{ _datapoint: { x: 1, y: 3, category: 'a' } }]
        datastore.save(base, chart, history)

        const received = once(emitter, 'msg-input:' + chart.id)
        chart.receive({ payload: [] })
        const [msg] = await received
        datastore.get(chart.id).should.have.length(0)
        should(msg._datapoint).deepEqual([])
    })
})
