const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars
const sinon = require('sinon')

// load test 1 standard test data (base, page, group, theme, chart)
const { testData1 } = require('../fixtures/index.js')
const { getGroupRegisterCallAndParams, registerHelperSpies, unRegisterHelperSpies } = require('../utils.js')
const { verifyFlowLoaded } = require('../utils.js')
const testFlow1 = testData1.flows
const nodeImports = testData1.getImports(null, ['ui_chart'])

helper.init(require.resolve('node-red'))

describe('ui-chart node', function () {
    beforeEach(function (done) {
        helper.startServer(done)
        registerHelperSpies(sinon, helper)
    })

    afterEach(function (done) {
        unRegisterHelperSpies(helper)
        sinon.restore()
        helper.unload()
        helper.stopServer(done)
    })

    const flow = [
        {
            id: 'node-ui-chart',
            type: 'ui-chart',
            z: 'tab-id',
            group: 'config-ui-group',
            name: '',
            label: 'Chart',
            order: 0,
            chartType: 'bar',
            category: '["Q1", "Q2"]',
            categoryType: 'json',
            xAxisProperty: 'year',
            xAxisPropertyType: 'property',
            xAxisType: 'category',
            yAxisProperty: '',
            yAxisPropertyType: 'property',
            action: 'append',
            width: 0,
            height: 0,
            className: '',
            x: 290,
            y: 180,
            wires: []
        },
        ...testFlow1
    ]

    /**
     * Load the chart with the given series and return a function that runs a msg through its beforeSend hook
     * @param {string} category - JSON string used for the chart's "Series" property
     */
    async function loadChart (category) {
        const flows = JSON.parse(JSON.stringify(flow))
        flows[0].category = category
        await helper.load(nodeImports, flows)
        verifyFlowLoaded(helper, flows)
        const group = helper.getNode('config-ui-group')
        const node = helper.getNode('node-ui-chart')
        const { registerEvents } = getGroupRegisterCallAndParams(group, 'node-ui-chart')
        return (msg) => registerEvents.beforeSend.call(node, msg)
    }

    it('should be loaded', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const chart = helper.getNode('node-ui-chart')
        should(chart).be.an.Object()
    })

    describe('JSON series', function () {
        it('should plot a point per key, named after the key, when given an array of keys', async function () {
            const beforeSend = await loadChart('["Q1", "Q2"]')
            const msg = beforeSend({ payload: { year: 2021, Q1: 115, Q2: 207 } })

            msg._datapoint.should.eql([
                { category: 'Q1', x: 2021, y: 115 },
                { category: 'Q2', x: 2021, y: 207 }
            ])
        })

        it('should name each series using the label provided for its key when given an object', async function () {
            const beforeSend = await loadChart('{ "Q1": "Quarter 1", "Q2": "Quarter 2" }')
            const msg = beforeSend({ payload: { year: 2021, Q1: 115, Q2: 207 } })

            msg._datapoint.should.eql([
                { category: 'Quarter 1', x: 2021, y: 115 },
                { category: 'Quarter 2', x: 2021, y: 207 }
            ])
        })

        it('should support nested keys when given an object', async function () {
            const beforeSend = await loadChart('{ "sensor.temp": "Temperature" }')
            const msg = beforeSend({ payload: { year: 2021, sensor: { temp: 21.5 } } })

            msg._datapoint.should.eql([
                { category: 'Temperature', x: 2021, y: 21.5 }
            ])
        })

        it('should skip keys missing from the payload when given an object', async function () {
            const beforeSend = await loadChart('{ "Q1": "Quarter 1", "Q2": "Quarter 2" }')
            const msg = beforeSend({ payload: { year: 2021, Q2: 207 } })

            msg._datapoint.should.eql([
                { category: 'Quarter 2', x: 2021, y: 207 }
            ])
        })

        it('should fall back to the key when no usable label is provided', async function () {
            const beforeSend = await loadChart('{ "Q1": "", "Q2": null, "Q3": 3 }')
            const msg = beforeSend({ payload: { year: 2021, Q1: 115, Q2: 207, Q3: 198 } })

            msg._datapoint.should.eql([
                { category: 'Q1', x: 2021, y: 115 },
                { category: 'Q2', x: 2021, y: 207 },
                { category: '3', x: 2021, y: 198 }
            ])
        })

        it('should use the labels for each point when given an array of data and an object', async function () {
            const beforeSend = await loadChart('{ "Q1": "Quarter 1", "Q2": "Quarter 2" }')
            const msg = beforeSend({
                payload: [
                    { year: 2021, Q1: 115, Q2: 207 },
                    { year: 2022, Q1: 170, Q2: 200 }
                ]
            })

            msg._datapoint.should.eql([
                { category: ['Quarter 1', 'Quarter 2'], x: 2021, y: [115, 207] },
                { category: ['Quarter 1', 'Quarter 2'], x: 2022, y: [170, 200] }
            ])
        })

        it('should keep using the keys for each point when given an array of data and an array of keys', async function () {
            const beforeSend = await loadChart('["Q1", "Q2"]')
            const msg = beforeSend({
                payload: [
                    { year: 2021, Q1: 115, Q2: 207 }
                ]
            })

            msg._datapoint.should.eql([
                { category: ['Q1', 'Q2'], x: 2021, y: [115, 207] }
            ])
        })
    })
})
