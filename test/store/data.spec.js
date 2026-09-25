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
    before(function () {
        datastore.initStore(fakeGlobal(), {})
    })

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

    it('stores the whole message alongside the value', function () {
        const global = fakeGlobal()
        const node = fakeNode('m1', global)
        datastore.save(base, node, { payload: 42, topic: 't', extra: 'x' })

        const store = global.get('dashboardStore')
        store.m1.should.equal(42)
        store.$m1.msg.payload.should.equal(42)
        store.$m1.msg.topic.should.equal('t')
        store.$m1.msg.extra.should.equal('x')
    })

    it('keeps the stored message in step with the legacy merge', function () {
        const global = fakeGlobal()
        const node = fakeNode('m3', global)
        datastore.save(base, node, { payload: 1, topic: 'a', unit: 'bar' })
        datastore.save(base, node, { payload: 2 })

        global.get('dashboardStore').$m3.msg.should.eql(datastore.get('m3'))
    })

    it('does not alias the legacy store into the mirror', function () {
        const global = fakeGlobal()
        const node = fakeNode('m4', global)
        datastore.save(base, node, { payload: 1, topic: 'a' })

        global.get('dashboardStore').$m4.msg.topic = 'mutated'

        datastore.get('m4').topic.should.equal('a')
    })

    it('does not alias the flow\'s message into the store', function () {
        const global = fakeGlobal()
        const node = fakeNode('m2', global)
        const sent = { payload: 1, nested: { a: 1 } }
        datastore.save(base, node, sent)

        sent.nested.a = 999

        global.get('dashboardStore').$m2.msg.nested.a.should.equal(1)
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

    it('does not throw when a msg is not an object (unchanged from main)', function () {
        const global = fakeGlobal()
        for (const msg of ['hello', 42, true]) {
            const node = fakeNode('prim-' + String(msg), global)
            should(() => datastore.save(base, node, msg)).not.throw()
        }
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

describe('store: data.js chart writes', function () {
    const pt = (x, y, category = 'a') => ({ category, x, y })

    // an absent chart key only proves anything if the store is actually working
    function liveStore (global, id) {
        datastore.save(base, fakeNode(id, global), { payload: 'live' })
        return global.get('dashboardStore')?.[id]
    }

    it('mirrors a chart append into the store', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-1', global)

        datastore.append(base, node, { payload: 1, _datapoint: pt(1, 1) })
        datastore.append(base, node, { payload: 2, _datapoint: pt(2, 2) })

        liveStore(global, 'canary-1').should.equal('live')
        const store = global.get('dashboardStore')
        store['chart-1'].should.eql([pt(1, 1), pt(2, 2)])
        store['$chart-1'].msg.should.have.length(2)
        store['$chart-1'].msg[1].payload.should.equal(2)
    })

    it('flattens a multi-series append into several points', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-multi', global)

        datastore.append(base, node, { payload: [1, 5], _datapoint: [pt(1, 1, 'a'), pt(1, 5, 'b')] })

        liveStore(global, 'canary-multi').should.equal('live')
        const store = global.get('dashboardStore')
        store['chart-multi'].should.eql([pt(1, 1, 'a'), pt(1, 5, 'b')])
        store['$chart-multi'].msg.should.have.length(1)
    })

    it('stores a message with no datapoint but adds no point', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-nodp', global)

        datastore.append(base, node, { payload: 'x' })

        const store = global.get('dashboardStore')
        store['chart-nodp'].should.eql([])
        store['$chart-nodp'].msg.should.have.length(1)
    })

    it('does not alias the flow\'s message into an appended series', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-alias', global)
        const sent = { payload: 1, _datapoint: pt(1, 1), nested: { a: 1 } }

        datastore.append(base, node, sent)
        sent.nested.a = 999

        global.get('dashboardStore')['$chart-alias'].msg[0].nested.a.should.equal(1)
    })

    it('mirrors an array save into the store as a whole series', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-2', global)

        datastore.save(base, node, [
            { payload: 1, _datapoint: pt(1, 1) },
            { payload: 2, _datapoint: pt(2, 2) }
        ])

        liveStore(global, 'canary-2').should.equal('live')
        const store = global.get('dashboardStore')
        store['chart-2'].should.eql([pt(1, 1), pt(2, 2)])
        store['$chart-2'].msg.should.have.length(2)
    })

    it('replaces rather than appends on a second array save', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-replace', global)

        datastore.save(base, node, [{ payload: 1, _datapoint: pt(1, 1) }])
        datastore.save(base, node, [{ payload: 9, _datapoint: pt(9, 9) }])

        const store = global.get('dashboardStore')
        store['chart-replace'].should.eql([pt(9, 9)])
        store['$chart-replace'].msg.should.have.length(1)
    })

    it('empties the series when saved an empty array', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-clear', global)

        datastore.append(base, node, { payload: 1, _datapoint: pt(1, 1) })
        datastore.save(base, node, [])

        const store = global.get('dashboardStore')
        store['chart-clear'].should.eql([])
        store['$chart-clear'].msg.should.eql([])
    })

    it('does not rebuild the stored series until the batch is reached', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-3', global)
        for (let i = 0; i < 100; i++) {
            datastore.append(base, node, { payload: i, _datapoint: pt(i, i) })
        }

        for (let i = 0; i < 59; i++) {
            datastore.filter(base, node, (m, idx) => idx > 0)
        }

        liveStore(global, 'canary-3').should.equal('live')
        datastore.get('chart-3').should.have.length(41)
        global.get('dashboardStore')['chart-3'].should.have.length(100)
    })

    it('rebuilds the stored series on the batch boundary', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-batch', global)
        for (let i = 0; i < 100; i++) {
            datastore.append(base, node, { payload: i, _datapoint: pt(i, i) })
        }

        for (let i = 0; i < 60; i++) {
            datastore.filter(base, node, (m, idx) => idx > 0)
        }

        const expected = []
        for (let i = 60; i < 100; i++) expected.push(pt(i, i))

        const store = global.get('dashboardStore')
        store['chart-batch'].should.eql(expected)
        store['$chart-batch'].msg.should.have.length(40)
    })

    it('does not create a key when the appended message is not an object', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-junk', global)
        datastore.append(base, fakeNode('chart-ok', global), { payload: 1, _datapoint: pt(1, 1) })

        datastore.append(base, node, 5)
        datastore.save(base, node, [5, { payload: 1, _datapoint: pt(1, 1) }])

        should(global.get('dashboardStore')['chart-junk']).be.undefined()
        global.get('dashboardStore')['chart-ok'].should.have.length(1)
    })

    it('clears the trim batch even when the store cannot be reached', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-cleared', global)
        for (let i = 0; i < 100; i++) {
            datastore.append(base, node, { payload: i, _datapoint: pt(i, i) })
        }
        for (let i = 0; i < 59; i++) {
            datastore.filter(base, node, (m, idx) => idx > 0)
        }

        const realGet = global.get
        global.get = () => { throw new Error('context store unavailable') }
        datastore.clear(node.id)
        datastore.clearFromStore(node)
        global.get = realGet

        for (let i = 0; i < 100; i++) {
            datastore.append(base, node, { payload: i, _datapoint: pt(i, i) })
        }
        const before = global.get('dashboardStore')['chart-cleared'].length
        datastore.filter(base, node, (m, idx) => idx > 0)

        global.get('dashboardStore')['chart-cleared'].should.have.length(before)
    })

    it('resets the trim batch even when the rebuild fails, so it does not retry on every trim', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-stuck', global)
        for (let i = 0; i < 100; i++) {
            datastore.append(base, node, { payload: i, _datapoint: pt(i, i) })
        }

        const realGet = global.get
        global.get = () => { throw new Error('context store unavailable') }
        for (let i = 0; i < 60; i++) {
            datastore.filter(base, node, (m, idx) => idx > 0)
        }
        global.get = realGet

        // the counter was cleared despite the failure, so one more trim must not trigger a rebuild
        const before = global.get('dashboardStore')['chart-stuck'].length
        datastore.filter(base, node, (m, idx) => idx > 0)

        global.get('dashboardStore')['chart-stuck'].should.have.length(before)
    })

    it('does not advance the batch when a trim removes nothing', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-noop', global)
        for (let i = 0; i < 100; i++) {
            datastore.append(base, node, { payload: i, _datapoint: pt(i, i) })
        }

        for (let i = 0; i < 200; i++) {
            datastore.filter(base, node, () => true)
        }
        for (let i = 0; i < 59; i++) {
            datastore.filter(base, node, (m, idx) => idx > 0)
        }

        global.get('dashboardStore')['chart-noop'].should.have.length(100)
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

    it('keeps history empty across many appends', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-hist', global)
        for (let i = 0; i < 20; i++) {
            datastore.append(base, node, { payload: i, _datapoint: pt(i, i) })
        }

        global.get('dashboardStore')['$chart-hist'].history.should.eql([])
    })

    it('serialises a chart key to its point array and nothing else', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-json', global)
        datastore.append(base, node, { payload: 1, topic: 'a', _datapoint: pt(1, 1) })

        JSON.parse(JSON.stringify(global.get('dashboardStore'))).should.eql({
            'chart-json': [pt(1, 1)]
        })
    })

    it('leaves the legacy series untouched when the store is disabled', function () {
        const global = fakeGlobal()
        const node = fakeNode('chart-off', global)
        datastore.disableStore()
        try {
            datastore.append(base, node, { payload: 1, _datapoint: pt(1, 1) })
            datastore.save(base, node, [{ payload: 2, _datapoint: pt(2, 2) }])
            datastore.filter(base, node, () => false)

            datastore.get('chart-off').should.eql([])
            should(global.get('dashboardStore')).be.undefined()
        } finally {
            datastore.initStore(fakeGlobal(), {})
        }
    })
})

describe('store: data.js audit invariants', function () {
    it('does not store a message carrying only dynamic properties', function () {
        const global = fakeGlobal()
        const node = fakeNode('a1', global)
        datastore.save(base, node, { payload: 'real' })
        datastore.save(base, node, { ui_update: { class: 'red' } })

        global.get('dashboardStore').a1.should.equal('real')
    })

    it('keeps value and msg in step across writes', function () {
        const global = fakeGlobal()
        const node = fakeNode('a2', global)
        datastore.save(base, node, { payload: 1, topic: 'first' })
        datastore.save(base, node, { payload: 2, topic: 'second' })

        const store = global.get('dashboardStore')
        store.a2.should.equal(2)
        store.$a2.msg.topic.should.equal('second')
    })

    it('leaves no key at all when a widget never stores', function () {
        const global = fakeGlobal()
        datastore.save(base, fakeNode('a3', global), { payload: 1 })

        const store = global.get('dashboardStore')
        store.a3.should.equal(1)
        should(store.never).be.undefined()
    })

    it('clears value and msg together when a widget is removed', function () {
        const global = fakeGlobal()
        const node = fakeNode('a4', global)
        datastore.save(base, node, { payload: 5, topic: 't' })
        global.get('dashboardStore').$a4.msg.should.be.an.Object()

        datastore.clearFromStore(node)

        const store = global.get('dashboardStore')
        should(store.a4).be.undefined()
        should(store.$a4).be.undefined()
    })
})

describe('store: data.js client-scoped writes', function () {
    describe('save', function () {
        const base = { acceptsClientConfig: ['ui-text'] }
        const node = { id: 'w1', type: 'ui-text' }

        beforeEach(function () {
            datastore.clear(node.id)
        })

        it('stores a msg with no client constraint', function () {
            datastore.save(base, node, { payload: 'everyone' })
            datastore.get(node.id).payload.should.equal('everyone')
        })

        it('does not store a socketId-targeted msg', function () {
            datastore.save(base, node, { payload: 'for A', _client: { socketId: 's1' } })
            should(datastore.get(node.id)).be.undefined()
        })

        it('does not store a clientId-targeted msg', function () {
            datastore.save(base, node, { payload: 'for A', _client: { clientId: 'c1' } })
            should(datastore.get(node.id)).be.undefined()
        })

        it('stores a targeted msg for a node type that is not client-constrained', function () {
            datastore.save({ acceptsClientConfig: [] }, node, { payload: 'for A', _client: { clientId: 'c1' } })
            datastore.get(node.id).payload.should.equal('for A')
        })

        it('filters targeted msgs out of an array', function () {
            datastore.save(base, node, [
                { payload: 'everyone' },
                { payload: 'for A', _client: { clientId: 'c1' } }
            ])
            datastore.get(node.id).should.have.length(1)
            datastore.get(node.id)[0].payload.should.equal('everyone')
        })

        it('does not append a clientId-targeted msg', function () {
            datastore.append(base, node, { payload: 'everyone' })
            datastore.append(base, node, { payload: 'for A', _client: { clientId: 'c1' } })
            datastore.get(node.id).should.have.length(1)
        })
    })
})
