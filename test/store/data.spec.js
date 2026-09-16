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

    it('mirrors array (chart-style) saves as a series', function () {
        const global = fakeGlobal()
        const node = fakeNode('w4', global)
        datastore.save(base, node, [{ payload: 1 }, { payload: 2 }])
        global.get('dashboardStore').w4.should.eql([1, 2])
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

    it('re-injects with the registered options when a flow overwrites the namespace', function () {
        const global = fakeGlobal()
        const node = fakeNode('w9', global)
        let overwrites = 0
        datastore.initStore(global, { onOverwrite: () => { overwrites++ } })

        datastore.save(base, node, { payload: 1 })
        global.set('dashboardStore', { rogue: true })
        datastore.save(base, node, { payload: 2 })

        overwrites.should.equal(1)
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

describe('store: data.js chart array mirror', function () {
    const pt = (x, y, category = 'a') => ({ category, x, y })

    it('mirrors chart points (_datapoint) into the store on append', function () {
        const global = fakeGlobal()
        const node = fakeNode('c1', global)
        datastore.append(base, node, { payload: 2, _datapoint: pt(1, 2) })
        datastore.append(base, node, { payload: 3, _datapoint: pt(2, 3) })
        global.get('dashboardStore').c1.should.eql([pt(1, 2), pt(2, 3)])
    })

    it('pushes each point when _datapoint is an array (multi-series)', function () {
        const global = fakeGlobal()
        const node = fakeNode('c2', global)
        datastore.append(base, node, { _datapoint: [pt(1, 2, 'a'), pt(1, 5, 'b')] })
        global.get('dashboardStore').c2.should.eql([pt(1, 2, 'a'), pt(1, 5, 'b')])
    })

    it('replaces the store series on an array save (categorical/replace)', function () {
        const global = fakeGlobal()
        const node = fakeNode('c3', global)
        datastore.append(base, node, { _datapoint: pt(1, 2) })
        datastore.save(base, node, [{ _datapoint: pt(9, 9) }])
        global.get('dashboardStore').c3.should.eql([pt(9, 9)])
    })

    it('clears the store series on save([])', function () {
        const global = fakeGlobal()
        const node = fakeNode('c4', global)
        datastore.append(base, node, { _datapoint: pt(1, 2) })
        datastore.save(base, node, [])
        global.get('dashboardStore').c4.should.eql([])
    })

    it('mirrors a trim (filter) into the store', function () {
        const global = fakeGlobal()
        const node = fakeNode('c5', global)
        datastore.append(base, node, { _datapoint: pt(1, 1) })
        datastore.append(base, node, { _datapoint: pt(2, 2) })
        datastore.append(base, node, { _datapoint: pt(3, 3) })
        datastore.filter(base, node, (m, i) => i > 0) // drop the oldest
        global.get('dashboardStore').c5.should.eql([pt(2, 2), pt(3, 3)])
    })

    it('keeps no history as the series grows', function () {
        const global = fakeGlobal()
        const node = fakeNode('c6', global)
        datastore.append(base, node, { _datapoint: pt(1, 1) })
        datastore.save(base, node, []) // reassigns the array
        datastore.append(base, node, { _datapoint: pt(2, 2) })
        global.get('dashboardStore').$c6.history.should.eql([])
    })

    it('falls back to payload when _datapoint is null (multi-series without _datapoint)', function () {
        const global = fakeGlobal()
        const node = fakeNode('c7', global)
        datastore.append(base, node, { payload: 42, _datapoint: null })
        global.get('dashboardStore').c7.should.eql([42])
    })

    it('adds no point for an empty _datapoint array', function () {
        const global = fakeGlobal()
        const node = fakeNode('c8', global)
        datastore.append(base, node, { _datapoint: [] })
        global.get('dashboardStore').c8.should.eql([])
    })

    it('preserves falsy payloads (0/false) and skips a msg with neither field', function () {
        const global = fakeGlobal()
        const node = fakeNode('c9', global)
        datastore.append(base, node, { payload: 0 })
        datastore.append(base, node, { payload: false })
        datastore.append(base, node, { topic: 'no value here' })
        global.get('dashboardStore').c9.should.eql([0, false])
    })

    it('does not mirror a client-scoped chart append', function () {
        const global = fakeGlobal()
        const node = fakeNode('c10', global)
        const scopedBase = { acceptsClientConfig: ['ui-text'] }
        datastore.append(scopedBase, node, { _datapoint: pt(1, 2), _client: { socketId: 's1' } })
        should(global.get('dashboardStore')).be.undefined()
    })

    it('stays in sync with a capped streaming chart (append + trim interleaved)', function () {
        const global = fakeGlobal()
        const node = fakeNode('c-stream', global)
        const CAP = 3
        const keepLast = (message, index, arr) => index >= arr.length - CAP
        for (let i = 1; i <= 6; i++) {
            datastore.append(base, node, { _datapoint: pt(i, i) })
            datastore.filter(base, node, keepLast)
        }
        // in-place appends interleaved with rebuild-trims must leave the store == the trimmed series
        global.get('dashboardStore')['c-stream'].should.eql([pt(4, 4), pt(5, 5), pt(6, 6)])
        datastore.get('c-stream').map((m) => m._datapoint).should.eql([pt(4, 4), pt(5, 5), pt(6, 6)])
    })
})
