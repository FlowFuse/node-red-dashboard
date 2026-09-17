const { util } = require('@node-red/util')
const should = require('should') // eslint-disable-line no-unused-vars

const datastore = require('../../nodes/store/data.js')

const RED = { util, plugins: { getByType: () => [] } }
datastore.setConfig(RED)

function fakeGlobal () {
    const m = {}
    return { get: (k) => m[k], set: (k, v) => { m[k] = v } }
}

function fakeNode (id, global) {
    return { id, type: 'ui-text', context: () => ({ global }) }
}

const base = { acceptsClientConfig: [] }

describe('store: data.js reactive-store mirror', function () {
    it('mirrors the clean payload into global.dashboardStore[id], not the whole message', function () {
        const global = fakeGlobal()
        const node = fakeNode('w1', global)
        datastore.save(base, node, { payload: 42, topic: 't', _msgid: 'm', extra: 'x' })

        const store = global.get('dashboardStore')
        store.w1.should.equal(42)
        // the reactive store holds only the value; the whole message stays in the legacy datastore
        datastore.get('w1').payload.should.equal(42)
        datastore.get('w1').topic.should.equal('t')
    })

    it('keeps the mirrored value in sync on the latest write', function () {
        const global = fakeGlobal()
        const node = fakeNode('w2', global)
        datastore.save(base, node, { payload: 1 })
        datastore.save(base, node, { payload: 2 })
        global.get('dashboardStore').w2.should.equal(2)
    })

    it('does not mirror a client-scoped message (not stored centrally)', function () {
        const global = fakeGlobal()
        const node = fakeNode('w3', global)
        const scopedBase = { acceptsClientConfig: ['ui-text'] }
        datastore.save(scopedBase, node, { payload: 9, _client: { socketId: 's1' } })
        should(global.get('dashboardStore')).be.undefined()
    })

    it('deep-copies a table rows array, so a flow reusing it cannot mutate stored state', function () {
        const global = fakeGlobal()
        const node = fakeNode('tbl-1', global)
        const rows = [{ id: 1, name: 'a', meta: { site: { rack: 'r1' } } }]

        datastore.save(base, node, { payload: rows })
        rows[0].name = 'mutated'
        rows[0].meta.site.rack = 'mutated-deep'

        global.get('dashboardStore')['tbl-1'].should.eql([
            { id: 1, name: 'a', meta: { site: { rack: 'r1' } } }
        ])
    })

    it('keeps the mirrored rows independent of the legacy datastore', function () {
        const global = fakeGlobal()
        const node = fakeNode('tbl-2', global)

        datastore.save(base, node, { payload: [{ id: 1, name: 'original' }] })
        global.get('dashboardStore')['tbl-2'][0].name = 'changed via store'

        datastore.get('tbl-2').payload.should.eql([{ id: 1, name: 'original' }])
    })

    it('does not throw or mirror when the context store cannot hold the proxy', function () {
        const throwingGlobal = {
            get: () => { throw new Error('File Store cache disabled - only asynchronous access supported') },
            set: () => {}
        }
        const node = fakeNode('w5', throwingGlobal)
        should(() => datastore.save(base, node, { payload: 7 })).not.throw()
        datastore.get('w5').payload.should.equal(7) // legacy datastore still works
    })

    it('clearFromStore removes the widget key so a removed widget leaves no orphan', function () {
        const global = fakeGlobal()
        const node = fakeNode('w6', global)
        datastore.save(base, node, { payload: 5 })
        global.get('dashboardStore').w6.should.equal(5)

        datastore.clearFromStore(node)
        should(global.get('dashboardStore').w6).be.undefined()
    })

    it('keeps the mirrored value when a later message carries no payload', function () {
        const global = fakeGlobal()
        const node = fakeNode('w8', global)
        datastore.save(base, node, { payload: 'keep me' })
        datastore.save(base, node, { topic: 'no payload' })

        global.get('dashboardStore').w8.should.equal('keep me')
        datastore.get('w8').payload.should.equal('keep me')
        global.get('dashboardStore').$w8.history.should.eql([])
    })

    it('blanks the mirrored value when a message explicitly carries payload: undefined', function () {
        const global = fakeGlobal()
        const node = fakeNode('w11', global)
        datastore.save(base, node, { payload: 'keep me' })
        datastore.save(base, node, { payload: undefined, topic: 'explicit' })

        should(global.get('dashboardStore').w11).be.undefined()
        should(datastore.get('w11').payload).be.undefined()
    })

    it('clearFromStore does not throw when the store is unavailable', function () {
        const throwingGlobal = {
            get: () => { throw new Error('File Store cache disabled - only asynchronous access supported') },
            set: () => {}
        }
        const node = fakeNode('w7', throwingGlobal)
        should(() => datastore.clearFromStore(node)).not.throw()
    })
})

describe('store: data.js store options', function () {
    afterEach(function () {
        datastore.initStore(fakeGlobal(), {})
    })

    it('re-injects with the registered options when a flow replaces the namespace', function () {
        const global = fakeGlobal()
        const node = fakeNode('w9', global)
        let replaced = 0
        datastore.initStore(global, { onReplaced: () => { replaced++ } })

        datastore.save(base, node, { payload: 1 })
        global.set('dashboardStore', { rogue: true })
        datastore.save(base, node, { payload: 2 })

        replaced.should.equal(1)
        global.get('dashboardStore').w9.should.equal(2)
    })

    it('keeps onChange wired through a widget-triggered re-injection', function () {
        const global = fakeGlobal()
        const node = fakeNode('w10', global)
        const changes = []
        datastore.initStore(global, { onChange: (key) => changes.push(key) })

        global.set('dashboardStore', { rogue: true })
        datastore.save(base, node, { payload: 'after' })

        changes.should.containEql('w10')
    })
})

describe('store: data.js disabled store', function () {
    const cacheOffGlobal = () => ({
        gets: 0,
        get () { this.gets++; throw new Error('File Store cache disabled - only asynchronous access supported') },
        set () {}
    })

    afterEach(function () {
        datastore.initStore(fakeGlobal(), {})
    })

    it('stops touching global context once the store is disabled', function () {
        const global = cacheOffGlobal()
        const scalar = fakeNode('w12', global)
        const chart = fakeNode('w12-chart', global)
        datastore.disableStore()

        datastore.save(base, scalar, { payload: 1 })
        datastore.append(base, chart, { _datapoint: { category: 'a', x: 1, y: 1 } })
        datastore.filter(base, chart, () => false)
        datastore.clearFromStore(scalar)

        global.gets.should.equal(0)
    })

    it('leaves the legacy datastore working while disabled', function () {
        const global = cacheOffGlobal()
        const node = fakeNode('w13', global)
        datastore.disableStore()

        datastore.save(base, node, { payload: 'legacy still works' })

        datastore.get('w13').payload.should.equal('legacy still works')
    })

    it('re-enables on a later initStore', function () {
        datastore.disableStore()

        const global = fakeGlobal()
        const node = fakeNode('w14', global)
        datastore.initStore(global, {})
        datastore.save(base, node, { payload: 'back on' })

        global.get('dashboardStore').w14.should.equal('back on')
    })
})

describe('store: data.js chart writes (deferred to Story 3)', function () {
    const pt = (x, y, category = 'a') => ({ category, x, y })

    // an absent chart key only proves anything if the store is actually working
    function liveStore (global, id) {
        datastore.save(base, fakeNode(id, global), { payload: 'live' })
        return global.get('dashboardStore')?.[id]
    }

    it('does not mirror a chart append into the store', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-1', global)

        datastore.append(base, node, { _datapoint: pt(1, 1) })
        datastore.append(base, node, { _datapoint: pt(2, 2) })

        liveStore(global, 'canary-1').should.equal('live')
        should(global.get('dashboardStore')['chart-1']).be.undefined()
    })

    it('does not mirror an array save into the store', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-2', global)

        datastore.save(base, node, [{ _datapoint: pt(1, 1) }, { _datapoint: pt(2, 2) }])

        liveStore(global, 'canary-2').should.equal('live')
        should(global.get('dashboardStore')['chart-2']).be.undefined()
    })

    it('does not mirror a trim into the store', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-3', global)

        datastore.append(base, node, { _datapoint: pt(1, 1) })
        datastore.append(base, node, { _datapoint: pt(2, 2) })
        datastore.filter(base, node, (m, i) => i > 0)

        liveStore(global, 'canary-3').should.equal('live')
        should(global.get('dashboardStore')['chart-3']).be.undefined()
    })

    it('still keeps the legacy chart series intact', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-4', global)

        datastore.append(base, node, { _datapoint: pt(1, 1) })
        datastore.append(base, node, { _datapoint: pt(2, 2) })
        datastore.filter(base, node, (m, i) => i > 0)

        datastore.get('chart-4').map((m) => m._datapoint).should.eql([pt(2, 2)])
    })

    it('clears a stale key if a node id was previously used for a value', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-5', global)

        datastore.save(base, node, { payload: 'scalar first' })
        global.get('dashboardStore')['chart-5'].should.equal('scalar first')

        datastore.clearFromStore(node)
        should(global.get('dashboardStore')['chart-5']).be.undefined()
    })
})
