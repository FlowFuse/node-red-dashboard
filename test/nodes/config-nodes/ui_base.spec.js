const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars

const { attachToContext, STORE, NAMESPACE } = require('../../../nodes/store/reactive.js')
const { testData1 } = require('../fixtures/index.js')
const { verifyFlowLoaded } = require('../utils.js')

const testFlow1 = testData1.flows
const nodeImports = testData1.getImports(null, ['ui_button'])

helper.init(require.resolve('node-red'))

describe('ui-base config node: data store injection', function () {
    beforeEach(function (done) {
        helper.startServer(done)
    })

    afterEach(function (done) {
        helper.unload()
        helper.stopServer(done)
    })

    const secondBase = {
        id: 'config-ui-base-2',
        type: 'ui-base',
        name: 'UI Name 2',
        path: '/ui2',
        port: '',
        includeClientData: true,
        acceptsClientConfig: ['ui-notification', 'ui-control']
    }

    const flow = [
        { id: 'node-ui-button', type: 'ui-button', z: 'tab-id', group: 'config-ui-group' },
        ...testFlow1
    ]

    it('injects the reactive store into global context under the dashboard namespace', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const base = helper.getNode('config-ui-base')
        const store = base.context().global.get(NAMESPACE)
        should(store).be.an.Object()
        store[STORE].should.equal(true)
    })

    it('keeps the store reactive through the real context manager, not just the raw memory store', async function () {
        await helper.load(nodeImports, flow)
        const global = helper.getNode('config-ui-base').context().global

        global.set(`${NAMESPACE}.tag1`, 123)
        global.get(`${NAMESPACE}.tag1`).should.equal(123)
        global.get(`${NAMESPACE}.$tag1`).value.should.equal(123)

        const store = global.get(NAMESPACE)
        store.robot = { temp: 20 }
        global.get(`${NAMESPACE}.robot`).temp.should.equal(20)
        global.get(`${NAMESPACE}.$robot`).value.temp.should.equal(20)
    })

    it('gives multiple base nodes one shared store, not one each', async function () {
        await helper.load(nodeImports, [...flow, secondBase])
        const first = helper.getNode('config-ui-base').context().global.get(NAMESPACE)
        const second = helper.getNode('config-ui-base-2').context().global.get(NAMESPACE)
        should(first).equal(second)
    })

    it('re-injection reuses the existing store and preserves its values', async function () {
        await helper.load(nodeImports, flow)
        const global = helper.getNode('config-ui-base').context().global

        const original = global.get(NAMESPACE)
        original.reused = 42
        const again = attachToContext(global)
        should(again).equal(original)
        global.get(`${NAMESPACE}.reused`).should.equal(42)
    })
})
