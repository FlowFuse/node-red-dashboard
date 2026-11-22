const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars

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
})
