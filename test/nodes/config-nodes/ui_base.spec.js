const context = require('@node-red/runtime/lib/nodes/context')
const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars

const datastore = require('../../../nodes/store/data.js')
const { STORE, NAMESPACE } = require('../../../nodes/store/reactive.js')
const { testData1 } = require('../fixtures/index.js')
const { verifyFlowLoaded } = require('../utils.js')

const testFlow1 = testData1.flows
const nodeImports = testData1.getImports(null, ['ui_button', 'ui_text'])

function waitFor (fn, timeout = 1000) {
    return new Promise((resolve, reject) => {
        const start = Date.now()
        const tick = () => {
            let v
            try { v = fn() } catch (e) {}
            if (v !== undefined) { return resolve(v) }
            if (Date.now() - start > timeout) { return reject(new Error('timeout waiting for store value')) }
            setTimeout(tick, 5)
        }
        tick()
    })
}

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
        { id: 'node-ui-text', type: 'ui-text', z: 'tab-id', group: 'config-ui-group', label: 'txt' },
        ...testFlow1
    ]

    it('injects the reactive store into global context under the dashboardStore namespace', async function () {
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

        // the path ui-base actually takes on a redeploy
        const again = datastore.initStore(global, {})

        should(again).equal(original)
        global.get(`${NAMESPACE}.reused`).should.equal(42)
    })

    it('populates the store with a widget\'s clean payload on input', async function () {
        await helper.load(nodeImports, flow)
        const text = helper.getNode('node-ui-text')
        const global = helper.getNode('config-ui-base').context().global

        text.receive({ payload: 'hello', topic: 't', _msgid: 'm' })

        const value = await waitFor(() => global.get(NAMESPACE)['node-ui-text'])
        value.should.equal('hello') // the clean payload, not the whole message
        global.get(`${NAMESPACE}.$node-ui-text`).value.should.equal('hello')
    })
})

describe('ui-base config node: cache-off context store', function () {
    const CACHE_OFF = 'File Store cache disabled - only asynchronous access supported'
    let realGet
    let touched

    beforeEach(function (done) {
        touched = { get: 0, set: 0 }
        realGet = context.get
        // a persistent context store with cache:false serves only async access, so a sync get throws
        context.get = function (id, z) {
            const real = realGet.call(context, id, z)
            return Object.create(real, {
                global: {
                    value: {
                        get () { touched.get++; throw new Error(CACHE_OFF) },
                        set (...args) { touched.set++; return real.global.set(...args) }
                    }
                }
            })
        }
        helper.startServer(done)
    })

    afterEach(function (done) {
        context.get = realGet
        datastore.initStore(fakeGlobal(), {})
        helper.unload()
        helper.stopServer(done)
    })

    function fakeGlobal () {
        const m = {}
        return { get: (k) => m[k], set: (k, v) => { m[k] = v } }
    }

    const flow = [
        { id: 'node-ui-text', type: 'ui-text', z: 'tab-id', group: 'config-ui-group', label: 'txt' },
        ...testFlow1
    ]

    it('warns and does not inject the store', async function () {
        await helper.load(nodeImports, flow)

        const warned = helper.log().args.filter((args) =>
            args[0].level === helper.log().WARN && /in-memory-backed/.test(args[0].msg)
        )
        warned.should.have.length(1)
        touched.set.should.equal(0)
    })

    it('stops the write path instead of throwing on every message', async function () {
        await helper.load(nodeImports, flow)
        const text = helper.getNode('node-ui-text')

        touched.get = 0
        touched.set = 0
        should(() => text.receive({ payload: 'hello' })).not.throw()
        await new Promise((resolve) => setTimeout(resolve, 50))

        touched.get.should.equal(0)
        touched.set.should.equal(0)
        datastore.get('node-ui-text').payload.should.equal('hello')
    })
})
