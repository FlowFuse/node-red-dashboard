const fs = require('fs')
const http = require('http')
const os = require('os')
const path = require('path')

const { types } = require('util')
const vm = require('vm')

const LocalFileSystem = require('@node-red/runtime/lib/nodes/context/localfilesystem.js')
const Memory = require('@node-red/runtime/lib/nodes/context/memory.js')

const { util } = require('@node-red/util')
const should = require('should') // eslint-disable-line no-unused-vars

const { createDataStore, attachToContext, STORE, APPEND_ENTRY, SET_SERIES, MERGE_ENTRY, TRIM_SERIES, ENTRY_MSG } = require('../../nodes/store/reactive.js')

function makeStore (opts = {}) {
    const log = []
    let tick = 0
    const store = createDataStore({
        now: () => tick++,
        onChange: (key, entry, path) => log.push(path),
        ...opts
    })
    return { store, log }
}

// Node-RED runs function nodes in a vm context, so their objects carry that realm's Object.prototype
const fnRealm = vm.createContext({})
const fnNodeObject = (src) => vm.runInContext(src, fnRealm)

describe('store: reactive data store', function () {
    describe('values and metadata', function () {
        it('stores a scalar, fires onChange, and reads it back as a value', function () {
            const { store, log } = makeStore()
            store.k1 = 123
            log.should.eql(['k1'])
            store.k1.should.equal(123)
        })

        it('exposes the full entry under the $ prefix', function () {
            const { store } = makeStore()
            store.k1 = 123
            store.$k1.value.should.equal(123)
            store.$k1.quality.should.equal('GOOD')
            store.$k1.timestamp.should.be.a.Number()
        })

        it('synthesises a msg from the value when a flow writes the key directly', function () {
            const { store } = makeStore()
            store.k1 = 123
            store.$k1.msg.should.eql({ payload: 123 })
            store.$k1.msg.payload.should.equal(store.$k1.value)
        })

        it('does not leave a msg describing the previous value after a flow write', function () {
            const { store } = makeStore()
            store[MERGE_ENTRY]('k1', { payload: 42, topic: 'boiler' })
            store.$k1.msg.topic.should.equal('boiler')

            store.k1 = 99

            store.$k1.value.should.equal(99)
            store.$k1.msg.should.eql({ payload: 99 })
        })

        it('returns the whole object by default', function () {
            const { store } = makeStore()
            store.robot = { temp: 20 }
            store.robot.should.eql({ temp: 20 })
        })
    })

    describe('entry setter', function () {
        it('sets value and msg together and fires one change', function () {
            const { store, log } = makeStore()
            const msg = { payload: 42, topic: 'sensor-A' }

            store[MERGE_ENTRY]('gauge', msg)

            store.gauge.should.equal(42)
            store.$gauge.msg.should.eql({ payload: 42, topic: 'sensor-A' })
            log.should.eql(['gauge'])
        })

        it('keeps history on the value, as a normal write does', function () {
            const { store } = makeStore()
            store[MERGE_ENTRY]('gauge', { payload: 1 })
            store[MERGE_ENTRY]('gauge', { payload: 2 })

            store.gauge.should.equal(2)
            store.$gauge.history.map((h) => h.value).should.eql([1])
        })

        it('clones the message it is given, so a caller reusing it cannot mutate stored state', function () {
            const { store } = makeStore()
            const msg = { payload: 1, nested: { a: 1 } }
            store[MERGE_ENTRY]('k', msg)

            should(store.$k.msg).not.equal(msg)
            store.$k.msg.nested.should.not.equal(msg.nested)
            Object.isFrozen(msg).should.be.false()
            Object.isFrozen(msg.nested).should.be.false()
            msg.nested.a = 'MUTATED'
            store.$k.msg.nested.a.should.equal(1)
        })

        it('serves the stored value as the payload of the stored msg', function () {
            const { store } = makeStore()
            store[MERGE_ENTRY]('k', { payload: { n: 1 }, topic: 't' })

            store.$k.msg.payload.should.equal(store.$k.value)
            store.k.n.should.equal(1)
        })
    })

    describe('series entries', function () {
        const pt = (x, y, category = 'a') => ({ category, x, y })

        it('clones every message it is given, so a caller reusing them cannot mutate stored state', function () {
            const { store } = makeStore()
            const msgs = [{ payload: 1, _datapoint: pt(1, 1), meta: { n: 1 } }]
            store[SET_SERIES]('c1', msgs)

            store.$c1.msg[0].should.not.equal(msgs[0])
            store.$c1.msg[0].meta.should.not.equal(msgs[0].meta)
            Object.isFrozen(msgs[0]).should.be.false()
            Object.isFrozen(msgs[0].meta).should.be.false()
            msgs[0].meta.n = 'MUTATED'
            store.$c1.msg[0].meta.n.should.equal(1)
        })

        it('clones the appended message too', function () {
            const { store } = makeStore()
            const msg = { payload: 1, _datapoint: pt(1, 1), meta: { n: 1 } }
            store[APPEND_ENTRY]('c1', msg)

            store.$c1.msg[0].should.not.equal(msg)
            store.$c1.msg[0].meta.should.not.equal(msg.meta)
            Object.isFrozen(msg).should.be.false()
            Object.isFrozen(msg.meta).should.be.false()
            msg.meta.n = 'MUTATED'
            store.$c1.msg[0].meta.n.should.equal(1)
        })

        it('does not let the stored series messages be replaced through $', function () {
            const { store } = makeStore()
            store[APPEND_ENTRY]('c1', { payload: 1, _datapoint: pt(1, 1) })

            const push = function () { 'use strict'; store.$c1.msg.push({ payload: 'INJECTED' }) }
            const truncate = function () { 'use strict'; store.$c1.msg.length = 0 }

            push.should.throw()
            truncate.should.throw()
            store.$c1.msg.should.have.length(1)
        })

        it('emits once for the whole series, however many points', function () {
            const { store, log } = makeStore()
            store[SET_SERIES]('c1', [
                { payload: 1, _datapoint: pt(1, 1) },
                { payload: 2, _datapoint: [pt(2, 2), pt(3, 3)] }
            ])

            store.c1.should.eql([pt(1, 1), pt(2, 2), pt(3, 3)])
            store.$c1.msg.should.have.length(2)
            log.should.eql(['c1'])
        })

        it('replaces the previous series rather than appending to it', function () {
            const { store } = makeStore()
            store[APPEND_ENTRY]('c1', { payload: 1, _datapoint: pt(9, 9) })
            store[SET_SERIES]('c1', [{ payload: 2, _datapoint: pt(2, 2) }])

            store.c1.should.eql([pt(2, 2)])
            store.$c1.msg.should.have.length(1)
        })

        it('empties the series when given no messages', function () {
            const { store, log } = makeStore()
            store[APPEND_ENTRY]('c1', { payload: 1, _datapoint: pt(1, 1) })
            log.length = 0
            store[SET_SERIES]('c1', [])

            store.c1.should.eql([])
            store.$c1.msg.should.eql([])
            log.should.eql(['c1'])
        })

        it('keeps a message that carries no datapoint, contributing no points', function () {
            const { store } = makeStore()
            store[SET_SERIES]('c1', [
                { payload: 'none' },
                { payload: 1, _datapoint: pt(1, 1) },
                { payload: 'null', _datapoint: null },
                { payload: 'empty', _datapoint: [] }
            ])

            store.c1.should.eql([pt(1, 1)])
            store.$c1.msg.should.have.length(4)
        })

        it('points each message at its own slice of the live series', function () {
            const { store, log } = makeStore()
            store[SET_SERIES]('c1', [
                { payload: 1, _datapoint: pt(1, 1) },
                { payload: 2, _datapoint: [pt(2, 2), pt(3, 3)] }
            ])
            log.length = 0

            store.c1[0].y = 11
            store.c1[2].y = 33

            store.$c1.msg[0]._datapoint.y.should.equal(11)
            store.$c1.msg[1]._datapoint[1].y.should.equal(33)
            log.should.eql(['c1.0.y', 'c1.2.y'])
        })

        it('reports a write made through a series message datapoint, since it is the live point', function () {
            const { store, log } = makeStore()
            store[SET_SERIES]('c1', [
                { payload: 1, _datapoint: pt(1, 1) },
                { payload: 2, _datapoint: [pt(2, 2), pt(3, 3)] }
            ])
            log.length = 0

            store.$c1.msg[0]._datapoint.y = 77
            store.$c1.msg[1]._datapoint[0].y = 88

            log.should.eql(['c1.0.y', 'c1.1.y'])
            store.c1[0].y.should.equal(77)
            store.c1[1].y.should.equal(88)
        })

        it('reports a write made through an appended message datapoint', function () {
            const { store, log } = makeStore()
            store[APPEND_ENTRY]('c1', { payload: 1, _datapoint: pt(1, 1) })
            store[APPEND_ENTRY]('c1', { payload: 2, _datapoint: [pt(2, 2), pt(3, 3)] })
            log.length = 0

            store.$c1.msg[0]._datapoint.y = 77
            store.$c1.msg[1]._datapoint[1].y = 88

            log.should.eql(['c1.0.y', 'c1.2.y'])
            store.c1[0].y.should.equal(77)
            store.c1[2].y.should.equal(88)
        })

        it('re-seeds the series when a flow has left another shape at the key', function () {
            for (const seed of [42, 'text', { not: 'a series' }, [1, 2]]) {
                const { store } = makeStore()
                store.c1 = seed

                const append = function () { store[APPEND_ENTRY]('c1', { payload: 1, _datapoint: pt(1, 1) }) }

                append.should.not.throw()
                store.c1.should.eql([pt(1, 1)])
                store.$c1.msg.should.have.length(1)
            }
        })

        it('keeps appending after a re-seed, rather than failing once and forever', function () {
            const { store } = makeStore()
            store.c1 = 42
            store[APPEND_ENTRY]('c1', { payload: 1, _datapoint: pt(1, 1) })
            store[APPEND_ENTRY]('c1', { payload: 2, _datapoint: pt(2, 2) })

            store.c1.should.eql([pt(1, 1), pt(2, 2)])
            store.$c1.msg.should.have.length(2)
        })

        it('reports discarding whatever a flow left at the key', function () {
            const { store, log } = makeStore()
            store.c1 = { not: 'a series' }
            log.length = 0

            store[APPEND_ENTRY]('c1', { payload: 1 })

            store.c1.should.eql([])
            log.should.eql(['c1'])
        })

        it('does not freeze a point a message reaches through another key', function () {
            for (const write of [
                (store, msg) => store[SET_SERIES]('c1', [msg]),
                (store, msg) => store[APPEND_ENTRY]('c1', msg)
            ]) {
                const { store } = makeStore({ clone: util.cloneMessage })
                const payload = { reading: { v: 1 } }
                write(store, { topic: 't', payload, _datapoint: { category: 'a', x: 1, y: payload.reading } })

                Object.isFrozen(store.c1[0].y).should.be.false()
                store.c1[0].y.v = 99
                store.c1[0].y.v.should.equal(99)
            }
        })

        it('freezes the stored series message itself', function () {
            const { store } = makeStore()
            store[APPEND_ENTRY]('c1', { topic: 't', payload: 1, _datapoint: pt(1, 1) })

            Object.isFrozen(store.$c1.msg[0]).should.be.true()
            const write = function () { 'use strict'; store.$c1.msg[0].topic = 'TAMPERED' }

            write.should.throw()
            store.$c1.msg[0].topic.should.equal('t')
        })

        it('keeps an empty or null datapoint on the stored message', function () {
            for (const datapoint of [null, []]) {
                const { store } = makeStore()
                store[APPEND_ENTRY]('c1', { payload: 'x', _datapoint: datapoint })
                store[SET_SERIES]('c2', [{ payload: 'x', _datapoint: datapoint }])

                store.$c1.msg[0].should.have.property('_datapoint')
                store.$c2.msg[0].should.have.property('_datapoint')
                should(store.$c1.msg[0]._datapoint).eql(datapoint)
                should(store.$c2.msg[0]._datapoint).eql(datapoint)
            }
        })

        it('does not let a multi-point datapoint be resized through $', function () {
            const { store } = makeStore()
            store[SET_SERIES]('c1', [{ payload: 1, _datapoint: [pt(1, 1), pt(2, 2)] }])

            const push = function () { 'use strict'; store.$c1.msg[0]._datapoint.push(pt(9, 9)) }

            push.should.throw()
            store.$c1.msg[0]._datapoint.should.have.length(2)
            store.c1.should.have.length(2)
        })

        it('freezes everything on a series message except its datapoint', function () {
            const { store } = makeStore()
            store[SET_SERIES]('c1', [{ payload: 1, _datapoint: pt(1, 1), meta: { n: 1 } }])

            const write = function () { 'use strict'; store.$c1.msg[0].meta.n = 'TAMPERED' }

            write.should.throw()
            store.$c1.msg[0].meta.n.should.equal(1)
        })
    })

    describe('append entry', function () {
        const pt = (x, y, category = 'a') => ({ category, x, y })

        it('creates a series on first append', function () {
            const { store, log } = makeStore()
            store[APPEND_ENTRY]('c1', { payload: 1, _datapoint: pt(1, 1) })

            store.c1.should.eql([pt(1, 1)])
            store.$c1.msg.should.have.length(1)
            store.$c1.msg[0].payload.should.equal(1)
            log.should.eql(['c1.0'])
        })

        it('pushes onto an existing series', function () {
            const { store, log } = makeStore()
            store[APPEND_ENTRY]('c1', { payload: 1, _datapoint: pt(1, 1) })
            log.length = 0
            store[APPEND_ENTRY]('c1', { payload: 2, _datapoint: pt(2, 2) })

            store.c1.should.have.length(2)
            store.c1[1].x.should.equal(2)
            store.$c1.msg.should.have.length(2)
            log.should.eql(['c1.1'])
        })

        it('pushes every point of a multi-series message, but the message once', function () {
            const { store, log } = makeStore()
            store[APPEND_ENTRY]('c1', { payload: [1, 5], _datapoint: [pt(1, 1, 'a'), pt(1, 5, 'b')] })

            store.c1.should.eql([pt(1, 1, 'a'), pt(1, 5, 'b')])
            store.$c1.msg.should.have.length(1)
            log.should.eql(['c1.0', 'c1.1'])
        })

        it('keeps the message but fires nothing when there are no points', function () {
            const { store, log } = makeStore()
            store[APPEND_ENTRY]('c1', { payload: 'no datapoint' })

            store.c1.should.eql([])
            store.$c1.msg.should.have.length(1)
            log.should.eql([])
        })

        it('keeps history empty, because the value is an array', function () {
            const { store } = makeStore()
            store[APPEND_ENTRY]('c1', { payload: 1, _datapoint: pt(1, 1) })
            store[APPEND_ENTRY]('c1', { payload: 2, _datapoint: pt(2, 2) })
            store[APPEND_ENTRY]('c1', { payload: 3, _datapoint: pt(3, 3) })

            store.$c1.history.should.eql([])
        })
    })

    describe('history', function () {
        it('keeps the prior value on reassignment', function () {
            const { store } = makeStore()
            store.obj = { n: 1 }
            store.obj = { n: 2 }
            store.obj.should.eql({ n: 2 })
            store.$obj.history.map((h) => h.value).should.eql([{ n: 1 }])
        })

        it('snapshots history so later mutation cannot corrupt it', function () {
            const { store } = makeStore()
            store.obj = { n: 1 }
            store.obj = { n: 2 }
            store.obj.n = 999
            store.$obj.history.map((h) => h.value).should.eql([{ n: 1 }])
        })

        it('evicts beyond maxHistory', function () {
            const { store } = makeStore({ maxHistory: 2 })
            for (let i = 0; i < 5; i++) store.h = i
            store.$h.history.map((h) => h.value).should.eql([2, 3])
            store.h.should.equal(4)
        })

        it('keeps no history for array-valued keys', function () {
            const { store } = makeStore()
            store.series = [1, 2]
            store.series = [3, 4, 5]
            store.$series.history.should.eql([])
        })

        it('does not snapshot the old array when it is replaced (even by a scalar)', function () {
            const { store } = makeStore()
            store.k = [1, 2, 3]
            store.k = 9
            store.$k.history.should.eql([])
        })

        it('does snapshot a scalar when it becomes an array', function () {
            const { store } = makeStore()
            store.k = 5
            store.k = [1, 2]
            store.$k.history.map((h) => h.value).should.eql([5])
        })
    })

    describe('deep reactivity', function () {
        it('fires on a nested object mutation', function () {
            const { store, log } = makeStore()
            store.robot = { temp: 20 }
            log.length = 0
            store.robot.temp = 25
            log.should.eql(['robot.temp'])
            store.robot.temp.should.equal(25)
        })

        it('fires on array push, deep item mutation, and clear', function () {
            const { store, log } = makeStore()
            store.series = []
            log.length = 0
            store.series.push({ x: 1, y: 2 })
            log.should.eql(['series.0'])
            log.length = 0
            store.series[0].y = 99
            log.should.eql(['series.0.y'])
            log.length = 0
            store.series.length = 0
            log.should.eql(['series'])
            store.series.should.eql([])
        })

        it('fires for an array at a nested path the same as one at a top-level key', function () {
            const { store, log } = makeStore()
            store.top = [1, 2]
            store.nested = { rows: [1, 2] }

            log.length = 0
            store.top.push(3)
            store.nested.rows.push(3)

            log.should.eql(['top.2', 'nested.rows.2'])
        })

        it('does not alias an array assigned into the store', function () {
            const { store } = makeStore()
            const original = [{ x: 1 }]
            store.series = original

            original[0].x = 999

            store.series.should.eql([{ x: 1 }])
        })
    })

    describe('delete', function () {
        it('fires onChange and removes the value', function () {
            const { store, log } = makeStore()
            store.gone = 1
            log.length = 0
            delete store.gone
            log.should.eql(['gone'])
            should(store.gone).be.undefined()
        })
    })

    describe('guards', function () {
        it('blocks prototype pollution and creates no bad keys', function () {
            const { store } = makeStore()
            store.__proto__ = { polluted: true } // eslint-disable-line no-proto
            store.constructor = { polluted: true }
            should({}.polluted).be.undefined()
            Reflect.ownKeys(store).filter((k) => k === '__proto__' || k === 'constructor').should.eql([])
        })

        it('does not report a write to a value that has been replaced', function () {
            const { store, log } = makeStore()
            store.k = { n: 1 }
            const detached = store.k
            store.k = { n: 2 }
            log.length = 0
            const stamp = store.$k.timestamp

            detached.n = 999

            log.should.eql([])
            detached.n.should.equal(999)
            store.k.n.should.equal(2)
            store.$k.timestamp.should.equal(stamp)
        })

        it('does not report a write to a value whose key was deleted', function () {
            const { store, log } = makeStore()
            store.k = { n: 1 }
            const held = store.k
            delete store.k
            log.length = 0

            held.n = 99

            log.should.eql([])
            held.n.should.equal(99)
            should(store.k).be.undefined()
        })

        it('does not report a write to a child of a replaced value', function () {
            const { store, log } = makeStore()
            store.k = { child: { n: 1 } }
            const detachedChild = store.k.child
            store.k = { child: { n: 2 } }
            log.length = 0

            detachedChild.n = 999

            log.should.eql([])
            detachedChild.n.should.equal(999)
            store.k.child.n.should.equal(2)
        })

        it('still reports writes to the current value after a replacement', function () {
            const { store, log } = makeStore()
            store.k = { n: 1 }
            store.k = { n: 2 }
            log.length = 0

            store.k.n = 3

            log.should.eql(['k.n'])
            store.k.n.should.equal(3)
        })

        it('stores a self-referencing object without blowing the stack', function () {
            const { store } = makeStore()
            const a = { n: 1 }
            a.self = a

            const write = function () { store.k = a }

            write.should.not.throw()
            store.k.n.should.equal(1)
            store.k.self.should.equal(store.k)
        })

        it('stores a mutually-referencing pair', function () {
            const { store } = makeStore()
            const a = { name: 'a' }
            const b = { name: 'b', a }
            a.b = b

            const write = function () { store.k = a }

            write.should.not.throw()
            store.k.b.name.should.equal('b')
            store.k.b.a.should.equal(store.k)
        })

        it('keeps a cyclic value reactive', function () {
            const { store, log } = makeStore()
            const a = { n: 1 }
            a.self = a
            store.k = a
            log.length = 0

            store.k.self.n = 2

            log.should.eql(['k.n'])
            store.k.n.should.equal(2)
        })

        it('does not let a subscriber error escape a write', function () {
            const { store } = makeStore({ onChange: () => { throw new Error('boom') } })

            const write = function () { store.k = 1 }

            write.should.not.throw()
            store.k.should.equal(1)
        })

        it('does not let a subscriber error escape a nested write', function () {
            let live = false
            const { store } = makeStore({ onChange: () => { if (live) throw new Error('boom') } })
            store.k = { n: 1 }
            live = true

            const write = function () { store.k.n = 2 }

            write.should.not.throw()
            store.k.n.should.equal(2)
        })

        it('does not let a subscriber error escape a delete', function () {
            let live = false
            const { store } = makeStore({ onChange: () => { if (live) throw new Error('boom') } })
            store.k = 1
            live = true

            const remove = function () { delete store.k }

            remove.should.not.throw()
            should(store.k).be.undefined()
        })

        it('does not let a write through $ replace the stored value', function () {
            const { store, log } = makeStore()
            store.k = 1
            log.length = 0

            store.$k.value = 'TAMPERED'

            store.k.should.equal(1)
            log.should.eql([])
        })

        it('does not let history grow past the cap through $', function () {
            const { store } = makeStore({ maxHistory: 2 })
            store.k = 1
            store.k = 2
            store.k = 3

            const push = function () { store.$k.history.push({ value: 'x', timestamp: 0 }) }

            push.should.throw()
            store.$k.history.should.have.length(2)
        })

        it('does not let a stored history entry be rewritten through $', function () {
            const { store } = makeStore()
            store.k = 1
            store.k = 2

            const write = function () { 'use strict'; store.$k.history[0].value = 'x' }

            write.should.throw()
            store.$k.history[0].value.should.equal(1)
        })

        it('does not let the stored msg be rewritten through $', function () {
            const { store, log } = makeStore()
            store[MERGE_ENTRY]('k', { payload: 42, topic: 'boiler' })
            log.length = 0

            const write = function () { 'use strict'; store.$k.msg.payload = 'TAMPERED' }

            write.should.throw()
            store.$k.msg.payload.should.equal(42)
            log.should.be.empty()
        })

        it('does not let a non-payload property of the stored msg be rewritten through $', function () {
            const { store } = makeStore()
            store[MERGE_ENTRY]('k', { payload: 1, meta: { deep: { n: 1 } } })

            const write = function () { 'use strict'; store.$k.msg.meta.deep.n = 'TAMPERED' }

            write.should.throw()
            store.$k.msg.meta.deep.n.should.equal(1)
        })

        it('reports a nested write made through the $ msg payload, since it is the value', function () {
            const { store, log } = makeStore()
            store[MERGE_ENTRY]('k', { payload: { deep: { n: 1 } } })
            log.length = 0

            store.$k.msg.payload.deep.n = 2

            log.should.eql(['k.deep.n'])
            store.k.deep.n.should.equal(2)
        })

        it('does not let a nested property of a history entry be rewritten through $', function () {
            const { store } = makeStore()
            store.k = { n: 1 }
            store.k = { n: 2 }

            const write = function () { 'use strict'; store.$k.history[0].value.n = 'TAMPERED' }

            write.should.throw()
            store.$k.history[0].value.n.should.equal(1)
        })

        it('does not freeze the payload when the message references it under another key', function () {
            // a change node copies by reference unless deep copy is ticked, so msg.copy === msg.payload
            const { store } = makeStore({ clone: util.cloneMessage })
            const payload = { temp: 25 }
            store[MERGE_ENTRY]('k', { payload, copy: payload, topic: 't' })

            Object.isFrozen(store.k).should.be.false()
            store.k.temp = 26
            store.k.temp.should.equal(26)
            Object.isFrozen(store.$k.msg.copy).should.be.true()
        })

        it('leaves msg.req and msg.res usable, since cloneMessage keeps them by reference', function () {
            // msg.res is an object literal in Node-RED (createResponseWrapper), not a class instance,
            // so isReactable accepts it and nothing but an explicit exemption keeps it writable
            const paths = [
                (store, msg) => store[MERGE_ENTRY]('k', msg),
                (store, msg) => store[SET_SERIES]('k', [msg]),
                (store, msg) => store[APPEND_ENTRY]('k', msg)
            ]
            for (const write of paths) {
                const { store } = makeStore({ clone: util.cloneMessage })
                const req = new http.IncomingMessage({ fake: 'socket' })
                const res = { _res: new http.ServerResponse(req), set () {}, status () {} }
                const msg = { payload: 1, req, res, _datapoint: { category: 'a', x: 1, y: 1 } }
                write(store, msg)

                store.$k.msg.should.be.ok()
                Object.isFrozen(req).should.be.false()
                Object.isFrozen(res).should.be.false()
                res.statusCode = 404
                res.statusCode.should.equal(404)
            }
        })

        it('still reports a nested write made through the $ value', function () {
            const { store, log } = makeStore()
            store.k = { n: 1 }
            log.length = 0

            store.$k.value.n = 2

            log.should.eql(['k.n'])
            store.k.n.should.equal(2)
        })

        it('passes a symbol delete straight through, like get and set do', function () {
            const { store, log } = makeStore()
            store.k = 1
            log.length = 0

            delete store[STORE]

            log.should.be.empty()
        })

        it('reserves toJSON so a key can never shadow the serialiser', function () {
            const { store, log } = makeStore()
            store.real = 1
            log.length = 0

            store.toJSON = 5

            log.should.eql([])
            should(store.$toJSON).be.undefined()
            Object.keys(store).should.eql(['real'])
            JSON.stringify(store).should.equal('{"real":1}')
        })

        it('reserves the $ prefix so keys are never silently lost', function () {
            const { store } = makeStore()
            store.$weird = 1
            should(store.$weird).be.undefined()
            store.normal = 7
            store.normal.should.equal(7)
            store.$normal.value.should.equal(7)
        })
    })

    describe('clone on write', function () {
        it('does not alias the caller object into the store', function () {
            const { store } = makeStore()
            const original = { inner: { x: 1 } }
            store.obj = original
            original.inner.x = 999
            store.obj.inner.x.should.equal(1)
        })

        it('does not alias a nested assignment into the store', function () {
            const { store } = makeStore()
            store.robot = { sensors: {} }
            const original = { x: 1 }
            store.robot.sensors = original
            original.x = 999
            store.robot.sensors.x.should.equal(1)
        })

        it('does not wrap the caller object in place on a nested assignment', function () {
            const { store } = makeStore()
            store.robot = { sensors: {} }
            const original = { inner: { x: 1 } }
            const innerRef = original.inner
            store.robot.sensors = original
            should(original.inner).equal(innerRef)
        })
    })

    describe('timestamps', function () {
        it('uses Date.now by default', function () {
            const store = createDataStore({})
            store.k = 1
            store.$k.timestamp.should.be.a.Number().and.above(0)
        })

        it('advances on each write', function () {
            const { store } = makeStore()
            store.k = 1
            const first = store.$k.timestamp
            store.k = 2
            store.$k.timestamp.should.be.above(first)
        })
    })

    describe('serialise and restart', function () {
        it('flattens entries to values, including nested', function () {
            const { store } = makeStore()
            store.a = 10
            store.robot = { temp: 20, axes: [1, 2] }
            JSON.parse(JSON.stringify(store)).should.eql({ a: 10, robot: { temp: 20, axes: [1, 2] } })
        })

        it('rebuilds reactivity around a restored snapshot', function () {
            const first = makeStore()
            first.store.a = 10
            first.store.robot = { temp: 20, axes: [1, 2] }
            const snapshot = JSON.parse(JSON.stringify(first.store))

            const { store, log } = makeStore()
            for (const [k, v] of Object.entries(snapshot)) store[k] = v
            store.a.should.equal(10)
            store.robot.should.eql({ temp: 20, axes: [1, 2] })
            log.length = 0
            store.robot.axes.push(3)
            log.should.eql(['robot.axes.2'])
        })
    })

    describe('via Node-RED global context', function () {
        function makeContext () {
            const log = []
            const ctx = Memory({})
            ctx.set('global', 'dashboardStore', createDataStore({ onChange: (k, e, p) => log.push(p) }))
            return { ctx, log }
        }

        it('observes a change-node style path write', function () {
            const { ctx, log } = makeContext()
            ctx.set('global', 'dashboardStore.tag1', 123)
            log.should.eql(['tag1'])
            ctx.get('global', 'dashboardStore.tag1').should.equal(123)
        })

        it('observes a function-node get-then-mutate', function () {
            const { ctx, log } = makeContext()
            ctx.set('global', 'dashboardStore.robot', { temp: 20 })
            log.length = 0
            ctx.get('global', 'dashboardStore.robot').temp = 25
            log.should.eql(['robot.temp'])
        })

        it('creates a brand-new nested path from a change-node write', function () {
            const { ctx, log } = makeContext()
            ctx.set('global', 'dashboardStore.newObj.sub', 5)
            ctx.get('global', 'dashboardStore.newObj').should.eql({ sub: 5 })
            log.should.containEql('newObj.sub')
        })

        it('works through the async callback API', function () {
            const { ctx, log } = makeContext()
            let cbVal
            ctx.set('global', 'dashboardStore.cbk', 42, () => {})
            ctx.get('global', 'dashboardStore.cbk', (err, v) => { cbVal = err ? 'ERR' : v })
            cbVal.should.equal(42)
            log.length = 0
            ctx.set('global', 'dashboardStore.cbk', 43, () => {})
            log.should.eql(['cbk'])
        })

        it('a raw overwrite drops reactivity until Dashboard re-injects (see attachToContext)', function () {
            const { ctx, log } = makeContext()
            ctx.set('global', 'dashboardStore.k', 1)
            ctx.set('global', 'dashboardStore', { k: 999 })
            log.length = 0
            ctx.set('global', 'dashboardStore.k', 2)
            log.should.eql([])
            ctx.get('global', 'dashboardStore.k').should.equal(2)
        })
    })

    describe('with RED.util.cloneMessage as the cloner', function () {
        function makeCloneStore () {
            const log = []
            const store = createDataStore({ clone: util.cloneMessage, onChange: (k, e, p) => log.push(p) })
            return { store, log }
        }

        it('deep-watches an object built in a function node realm', function () {
            const { store, log } = makeCloneStore()
            store.w = fnNodeObject('({ nested: { temp: 20 } })')
            log.length = 0

            store.w.nested.temp = 25

            log.should.eql(['w.nested.temp'])
            store.w.nested.temp.should.equal(25)
        })

        it('reassigning an object value fires only the key, no phantom req/res', function () {
            const { store, log } = makeCloneStore()
            store.robot = { temp: 20 }
            log.length = 0
            store.robot = { temp: 21 }
            log.should.eql(['robot'])
        })

        it('keeps a Buffer value intact and unproxied', function () {
            const { store } = makeCloneStore()
            store.buf = Buffer.from([1, 2, 3])
            Buffer.isBuffer(store.buf).should.equal(true)
            store.buf.should.eql(Buffer.from([1, 2, 3]))
        })

        it('keeps a Date value intact', function () {
            const { store } = makeCloneStore()
            const d = new Date('2020-01-01T00:00:00Z')
            store.d = d
            store.d.should.be.instanceof(Date)
            store.d.getTime().should.equal(d.getTime())
        })
    })

    describe('strict-mode guards', function () {
        it('do not throw when a strict caller writes a reserved key', function () {
            const { store } = makeStore()
            const write = function () { 'use strict'; store.$x = 1; store.__proto__ = {} } // eslint-disable-line no-proto
            write.should.not.throw()
            should(store.$x).be.undefined()
        })
    })

    describe('attachToContext', function () {
        it('does not copy an array a flow put in its place into numeric keys', function () {
            const m = {}
            const g = { get: (k) => m[k], set: (k, v) => { m[k] = v } }
            attachToContext(g, {})
            m.dashboardStore = ['a', 'b']

            const store = attachToContext(g, {})

            Object.keys(store).should.eql([])
            JSON.stringify(store).should.equal('{}')
        })

        it('does not spread a class instance a flow put in its place into keys', function () {
            const m = {}
            const g = { get: (k) => m[k], set: (k, v) => { m[k] = v } }
            attachToContext(g, {})
            m.dashboardStore = new Date()

            const store = attachToContext(g, {})

            Object.keys(store).should.eql([])
        })

        it('copies in an object a function node put in its place', function () {
            const m = {}
            const g = { get: (k) => m[k], set: (k, v) => { m[k] = v } }
            attachToContext(g, {})
            m.dashboardStore = fnNodeObject('({ robot: "PLAIN", count: 3 })')

            const store = attachToContext(g, {})

            store.robot.should.equal('PLAIN')
            store.count.should.equal(3)
        })

        it('copies in a plain object a flow put in its place', function () {
            const m = {}
            const g = { get: (k) => m[k], set: (k, v) => { m[k] = v } }
            attachToContext(g, {})
            m.dashboardStore = { robot: { temp: 20 }, count: 3 }

            const store = attachToContext(g, {})

            store.count.should.equal(3)
            store.robot.temp.should.equal(20)
            store.$robot.timestamp.should.be.a.Number()
        })

        it('recognises a store injected by another copy of the module', function () {
            const m = {}
            const g = { get: (k) => m[k], set: (k, v) => { m[k] = v } }
            // what a second copy of this module would have put in context
            const foreign = { robot: 'from the other copy' }
            foreign[Symbol.for('@flowfuse/node-red-dashboard/store')] = true
            m.dashboardStore = foreign

            const store = attachToContext(g, {})

            store.should.equal(foreign)
        })

        function fakeGlobal () {
            const m = {}
            return { get: (k) => m[k], set: (k, v) => { m[k] = v } }
        }

        it('injects the store under the dashboard namespace', function () {
            const g = fakeGlobal()
            const store = attachToContext(g, { onChange: () => {} })
            should(g.get('dashboardStore')).equal(store)
            store.a = 1
            g.get('dashboardStore').a.should.equal(1)
        })

        it('is idempotent, reusing the store across calls', function () {
            const g = fakeGlobal()
            const first = attachToContext(g)
            const second = attachToContext(g)
            should(second).equal(first)
        })

        it('rewires reactivity around plain data a flow put in its place', function () {
            const g = fakeGlobal()
            attachToContext(g)
            g.set('dashboardStore', { a: 5, robot: { temp: 1 } })
            const log = []
            const store = attachToContext(g, { onChange: (k, e, p) => log.push(p) })
            store.a.should.equal(5)
            store.robot.should.eql({ temp: 1 })
            store.a = 6
            log.should.containEql('a')
        })

        it('does not report a replacement when the context only ever hands back copies', function () {
            const m = {}
            let copying = false
            const g = { get: (k) => copying ? JSON.parse(JSON.stringify(m[k])) : m[k], set: (k, v) => { m[k] = v } }
            attachToContext(g)
            copying = true

            let warned = 0
            const results = []
            for (let i = 0; i < 3; i++) results.push(attachToContext(g, { onReplaced: () => { warned++ } }))

            warned.should.equal(0)
            results.should.eql([null, null, null])
        })

        it('reinjects and warns when a flow has overwritten the namespace, preserving data', function () {
            const g = fakeGlobal()
            const store = attachToContext(g)
            store.k = 1
            g.set('dashboardStore', { k: 1, extra: 2 }) // a flow replaces the proxy with a plain object

            let warned = 0
            const restored = attachToContext(g, { onReplaced: () => { warned++ } })
            warned.should.equal(1)
            restored[STORE].should.equal(true)
            should(g.get('dashboardStore')).equal(restored)
            restored.extra.should.equal(2)
            should(attachToContext(g)).equal(restored) // idempotent again, no re-overwrite
            restored.k = 5
            restored.k.should.equal(5)
        })

        it('does not warn on a clean first injection', function () {
            const g = fakeGlobal()
            let warned = 0
            attachToContext(g, { onReplaced: () => { warned++ } })
            warned.should.equal(0)
        })

        it('starts fresh after a restart, without warning, rather than restoring plain data it never injected', function () {
            const g = fakeGlobal()
            g.set('dashboardStore', { widget: 'from disk' }) // what a persistent context store hands back
            let warned = 0
            const store = attachToContext(g, { onReplaced: () => { warned++ } })
            warned.should.equal(0)
            should(store.widget).be.undefined()
            should(g.get('dashboardStore')).equal(store)
        })

        const replacements = [
            ['an object', { mine: 1 }],
            ['an array', [1, 2]],
            ['a string', 'hello'],
            ['a number', 42],
            ['null', null],
            ['undefined', undefined]
        ]
        replacements.forEach(([label, value]) => {
            it(`warns when a flow replaces the injected store with ${label}`, function () {
                const g = fakeGlobal()
                attachToContext(g)
                let warned = 0
                g.set('dashboardStore', value)
                const restored = attachToContext(g, { onReplaced: () => { warned++ } })
                warned.should.equal(1)
                restored[STORE].should.equal(true)
            })
        })
    })

    describe('context stores that cannot hold a live proxy', function () {
        it('attaches to an in-memory context', function () {
            const m = {}
            const g = { get: (k) => m[k], set: (k, v) => { m[k] = v } }
            should(attachToContext(g, {})).not.be.null()
        })

        it('reports why the context store could not be read', function () {
            let reason = null
            const globalContext = {
                get () { throw new Error('ECONNREFUSED: context store unreachable') },
                set () {}
            }

            const store = attachToContext(globalContext, { onUnavailable: (err) => { reason = err } })

            should(store).be.null()
            reason.message.should.equal('ECONNREFUSED: context store unreachable')
        })

        it('does not report a reason when the context store reads fine', function () {
            let reason = null
            const m = {}
            const globalContext = { get: (k) => m[k], set: (k, v) => { m[k] = v } }

            attachToContext(globalContext, { onUnavailable: (err) => { reason = err } })

            should(reason).be.null()
        })

        it('returns null when a cache-off store throws on synchronous get', function () {
            const g = {
                get: () => { throw new Error('File Store cache disabled - only asynchronous access supported') },
                set: () => {}
            }
            should(attachToContext(g, {})).be.null()
        })

        it('returns null for a store that hands back a serialised copy', function () {
            const disk = {}
            const g = {
                get: (k) => disk[k] === undefined ? undefined : JSON.parse(disk[k]),
                set: (k, v) => { disk[k] = JSON.stringify(v) }
            }
            should(attachToContext(g, {})).be.null()
        })

        it('never reports a replacement for a store it refused to attach to', function () {
            const disk = {}
            const g = {
                get: (k) => disk[k] === undefined ? undefined : JSON.parse(disk[k]),
                set: (k, v) => { disk[k] = JSON.stringify(v) }
            }
            let warned = 0

            for (let deploy = 0; deploy < 3; deploy++) attachToContext(g, { onReplaced: () => { warned++ } })

            warned.should.equal(0)
        })

        // a real localfilesystem store, accessed the way the context manager's sync path does
        function realGlobal (store) {
            return { get: (key) => store.get('global', key), set: (key, value) => store.set('global', key, value) }
        }
        function tmpDir () {
            const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-ctx-'))
            after(() => fs.rmSync(dir, { recursive: true, force: true }))
            return dir
        }

        it('returns null for a real cache-off localfilesystem store', function () {
            const store = LocalFileSystem({ dir: tmpDir(), cache: false })
            should(attachToContext(realGlobal(store), {})).be.null()
        })

        it('attaches to a real cache-backed localfilesystem store', function () {
            const store = LocalFileSystem({ dir: tmpDir(), cache: true })
            should(attachToContext(realGlobal(store), {})).not.be.null()
        })
    })
})

describe('store: MERGE_ENTRY', function () {
    const merging = () => makeStore({ clone: util.cloneMessage })

    it('merges a message onto the stored one, as the legacy datastore does', function () {
        const { store } = merging()
        store[MERGE_ENTRY]('k', { payload: 1, topic: 'a', label: 'x' })

        store[MERGE_ENTRY]('k', { topic: 'b' })

        store.$k.msg.should.eql({ payload: 1, topic: 'b', label: 'x' })
    })

    it('keeps the value and adds no history for a message without a payload', function () {
        const { store } = merging()
        store[MERGE_ENTRY]('k', { payload: { n: 1 } })
        const value = store.k

        store[MERGE_ENTRY]('k', { topic: 'b' })

        store.k.should.equal(value)
        store.$k.history.should.eql([])
    })

    it('adds no history for a value that no message ever set', function () {
        const { store } = merging()
        store[MERGE_ENTRY]('k', { topic: 'a' })
        store[MERGE_ENTRY]('u', { payload: undefined })

        store[MERGE_ENTRY]('k', { payload: 1 })
        store[MERGE_ENTRY]('u', { payload: 1 })

        store.$k.history.should.eql([])
        store.$u.history.map((h) => h.value).should.eql([undefined])
    })

    it('records history for every message that carries a payload, even a repeated one', function () {
        const { store } = merging()
        store[MERGE_ENTRY]('k', { payload: true })
        store[MERGE_ENTRY]('k', { payload: true })
        store[MERGE_ENTRY]('k', { payload: false })

        store.$k.history.map((h) => h.value).should.eql([true, true])
    })

    it('does not add a payload key that no message had', function () {
        const { store } = merging()

        store[MERGE_ENTRY]('k', { topic: 't' })

        Object.keys(store.$k.msg).should.eql(['topic'])
    })

    it('merges onto a value a flow wrote directly', function () {
        const { store } = merging()
        store.k = 5

        store[MERGE_ENTRY]('k', { topic: 't' })

        store.$k.msg.should.eql({ payload: 5, topic: 't' })
    })

    it('does not alias or freeze the message it is given', function () {
        const { store } = merging()
        const msg = { payload: { n: 1 }, nested: { a: 1 } }

        store[MERGE_ENTRY]('k', msg)
        msg.nested.a = 2

        store.$k.msg.nested.a.should.equal(1)
        Object.isFrozen(msg.nested).should.equal(false)
    })

    it('updates the timestamp when it keeps the value', function () {
        const { store } = merging()
        store[MERGE_ENTRY]('k', { payload: 1 })
        const before = store.$k.timestamp

        store[MERGE_ENTRY]('k', { topic: 'b' })

        store.$k.timestamp.should.be.above(before)
    })

    it('does not keep a series as the value when a message without a payload is merged onto it', function () {
        const { store } = merging()
        store[APPEND_ENTRY]('k', { payload: 1, _datapoint: { category: 'a', x: 1, y: 1 } })

        store[MERGE_ENTRY]('k', { topic: 't' })

        should(store.k).be.undefined()
        store.$k.msg.topic.should.equal('t')
    })

    it('keeps a replaced series\' messages as legacy does, without leaving their points writable', function () {
        const { store, log } = merging()
        store[APPEND_ENTRY]('k', { payload: 1, _datapoint: { category: 'a', x: 1, y: 1 } })

        store[MERGE_ENTRY]('k', { payload: 'single' })
        log.length = 0
        try { store.$k.msg[0]._datapoint.y = 777 } catch (err) {}

        store.$k.msg.should.eql({ 0: { payload: 1, _datapoint: { category: 'a', x: 1, y: 1 } }, payload: 'single' })
        log.should.eql([])
    })

    it('merges onto the trimmed series, reporting once', function () {
        const { store, log } = merging()
        for (let x = 0; x < 5; x++) {
            store[APPEND_ENTRY]('k', { payload: x, _datapoint: { category: 'a', x, y: x } })
        }
        store[TRIM_SERIES]('k', (msgs) => msgs.filter((m) => m._datapoint.x > 2))
        log.length = 0

        store[MERGE_ENTRY]('k', { topic: 'later' })

        Object.keys(store.$k.msg).should.eql(['0', '1', 'topic'])
        store.$k.msg[0].payload.should.equal(3)
        log.should.eql(['k'])
    })

    it('reuses stored fields rather than cloning them again on every merge', function () {
        const { store } = merging()
        store[MERGE_ENTRY]('k', { payload: 'a', options: [{ label: 'one', value: 1 }] })
        const options = store.$k.msg.options

        store[MERGE_ENTRY]('k', { payload: 'b' })

        store.$k.msg.options.should.equal(options)
        Object.isFrozen(store.$k.msg.options).should.equal(true)
    })

    it('keeps stored fields in their original order, with payload last', function () {
        const { store } = merging()
        store[MERGE_ENTRY]('k', { topic: 'a', payload: 1, label: 'x' })

        store[MERGE_ENTRY]('k', { topic: 'b', extra: true })

        Object.keys(store.$k.msg).should.eql(['topic', 'label', 'extra', 'payload'])
    })

    it('reports each merge once', function () {
        const { store, log } = merging()
        store[MERGE_ENTRY]('k', { payload: 1 })
        log.length = 0

        store[MERGE_ENTRY]('k', { topic: 'b' })

        log.should.eql(['k'])
    })
})

describe('store: ENTRY_MSG', function () {
    const point = (x) => ({ payload: x, topic: 'a', _datapoint: { category: 'a', x, y: x } })

    it('reads a stored message as a copy the caller owns', function () {
        const { store } = makeStore({ clone: util.cloneMessage })
        store[MERGE_ENTRY]('k', { payload: 1, topic: 't', meta: { a: 1 } })

        const msg = store[ENTRY_MSG]('k')
        msg.meta.a = 2
        msg.payload = 99

        store[ENTRY_MSG]('k').should.eql({ topic: 't', meta: { a: 1 }, payload: 1 })
        store[ENTRY_MSG]('k').should.not.equal(msg)
    })

    it('reads a trimmed series as a copy the caller owns', function () {
        const { store } = makeStore({ clone: util.cloneMessage })
        for (let x = 0; x < 5; x++) {
            store[APPEND_ENTRY]('c', point(x))
        }
        store[TRIM_SERIES]('c', (msgs) => msgs.filter((m) => m.payload > 2))

        const msgs = store[ENTRY_MSG]('c')
        msgs[0]._datapoint.y = 999
        msgs.push({ payload: 'extra' })

        msgs.slice(0, 2).map((m) => m.payload).should.eql([3, 4])
        store.c[0].y.should.equal(3)
        store[ENTRY_MSG]('c').should.have.length(2)
    })

    it('matches the $ view', function () {
        const { store } = makeStore({ clone: util.cloneMessage })
        store[APPEND_ENTRY]('c', point(1))
        store[MERGE_ENTRY]('k', { payload: 1 })

        store[ENTRY_MSG]('c').should.eql(store.$c.msg)
        store[ENTRY_MSG]('k').should.eql(store.$k.msg)
    })

    it('reads nothing for a missing entry', function () {
        const { store } = makeStore({ clone: util.cloneMessage })

        should(store[ENTRY_MSG]('missing')).be.undefined()
    })
})

describe('store: TRIM_SERIES', function () {
    const point = (x, topic = 'a') => ({ payload: x, topic, _datapoint: { category: topic, x, y: x } })
    const keepLatest = (max) => (msgs) => msgs.filter((m, i) => msgs.slice(i + 1).filter((n) => n.topic === m.topic).length < max)

    function series (n, topicOf = () => 'a', opts = {}) {
        const made = makeStore({ clone: util.cloneMessage, ...opts })
        for (let i = 0; i < n; i++) {
            made.store[APPEND_ENTRY]('c', point(i, topicOf(i)))
        }
        return made
    }
    const payloads = (store) => store.$c.msg.map((m) => m.payload)

    it('applies each trim to the stored series straight away', function () {
        const { store } = series(100)

        store[TRIM_SERIES]('c', (msgs) => msgs.filter((m) => m.payload > 9))

        store.c.should.have.length(90)
        payloads(store).should.eql(Array.from({ length: 90 }, (_, i) => i + 10))
    })

    it('keeps the value and the stored messages in step after a trim', function () {
        const { store } = series(10)

        store[TRIM_SERIES]('c', keepLatest(3))

        store.c.map((p) => p.x).should.eql([7, 8, 9])
        payloads(store).should.eql([7, 8, 9])
        store.$c.msg.forEach((m, i) => m._datapoint.should.equal(store.c[i]))
    })

    it('matches trimming after every message when points arrive out of order', function () {
        const { store } = series(0)
        store[SET_SERIES]('c', [])
        for (const [x, cutoff] of [[100, 0], [1, 10], [50, 20]]) {
            store[APPEND_ENTRY]('c', point(x))
            store[TRIM_SERIES]('c', keepLatest(2))
            store[TRIM_SERIES]('c', (msgs) => msgs.filter((m) => m._datapoint.x > cutoff))
        }

        payloads(store).should.eql([100, 50])
    })

    it('applies every trim, not just the latest', function () {
        const { store } = series(5)
        store[TRIM_SERIES]('c', (msgs) => msgs.filter((m) => m.payload !== 1))
        store[TRIM_SERIES]('c', (msgs) => msgs.filter((m) => m.payload !== 3))

        payloads(store).should.eql([0, 2, 4])
    })

    it('gives a position-based trim the positions a per-message trim would see', function () {
        const { store } = series(5)
        store[TRIM_SERIES]('c', (msgs) => msgs.filter((m, i) => i > 0))
        store[APPEND_ENTRY]('c', point(5))
        store[TRIM_SERIES]('c', (msgs) => msgs.filter((m, i) => i > 0))

        payloads(store).should.eql([2, 3, 4, 5])
    })

    it('shows points appended after the last trim', function () {
        const { store } = series(5)
        store[TRIM_SERIES]('c', (msgs) => msgs.filter((m) => m.payload !== 0))
        store[APPEND_ENTRY]('c', point(5))

        payloads(store).should.eql([1, 2, 3, 4, 5])
    })

    it('does not rebuild or report when trims remove nothing', function () {
        const { store, log } = series(10)
        log.length = 0

        for (let i = 0; i < 60; i++) {
            store[TRIM_SERIES]('c', (msgs) => msgs)
        }

        log.should.eql([])
        payloads(store).should.eql([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('trims the replacing series, not the old one', function () {
        const { store } = series(10)
        store[TRIM_SERIES]('c', keepLatest(1))
        store[SET_SERIES]('c', [point(1), point(2)])

        store[TRIM_SERIES]('c', keepLatest(1))

        payloads(store).should.eql([2])
    })

    it('starts a fresh series after the entry is deleted', function () {
        const { store } = series(10)
        store[TRIM_SERIES]('c', keepLatest(1))

        delete store.c
        store[APPEND_ENTRY]('c', point(1))
        store[APPEND_ENTRY]('c', point(2))

        payloads(store).should.eql([1, 2])
    })

    it('ignores trims on an entry that is not a series', function () {
        const { store } = makeStore({ clone: util.cloneMessage })
        store.k = 5

        store[TRIM_SERIES]('k', () => [])
        store[TRIM_SERIES]('missing', () => [])

        store.k.should.equal(5)
    })

    it('trims the oldest points', function () {
        const { store } = series(10)

        store[TRIM_SERIES]('c', (msgs) => msgs.filter((m) => m.payload > 3))

        store.c.map((p) => p.x).should.eql([4, 5, 6, 7, 8, 9])
        store.$c.msg.forEach((m, i) => m._datapoint.should.equal(store.c[i]))
    })

    it('trims points from the middle of the series', function () {
        const { store } = series(10, (i) => (i % 2 ? 'a' : 'b'))

        store[TRIM_SERIES]('c', (msgs) => msgs.filter((m) => m.topic === 'a' || m.payload > 6))

        store.c.map((p) => p.x).should.eql([1, 3, 5, 7, 8, 9])
        store.$c.msg.forEach((m, i) => m._datapoint.should.equal(store.c[i]))
    })

    it('trims multi-point messages and messages without points exactly', function () {
        const { store } = makeStore({ clone: util.cloneMessage })
        const two = (x) => ({ payload: x, topic: 'm', _datapoint: [{ category: 'a', x, y: 1 }, { category: 'b', x, y: 2 }] })
        store[SET_SERIES]('c', [two(1), { payload: 'none', topic: 'n' }, two(2), point(3), two(4)])

        store[TRIM_SERIES]('c', (msgs) => msgs.slice(1))
        store.c.map((p) => p.x).should.eql([2, 2, 3, 4, 4])

        store[TRIM_SERIES]('c', (msgs) => msgs.filter((m) => m.payload !== 3))
        store.c.map((p) => p.x).should.eql([2, 2, 4, 4])
        store.$c.msg.map((m) => m.payload).should.eql(['none', 2, 4])
    })

    it('trims without cloning', function () {
        let clones = 0
        const { store } = series(50, (i) => (i % 2 ? 'a' : 'b'), { clone: (v) => { clones++; return util.cloneMessage(v) } })
        clones = 0

        store[TRIM_SERIES]('c', keepLatest(10))
        store[TRIM_SERIES]('c', (msgs) => msgs.filter((m) => m.topic === 'a'))

        clones.should.equal(0)
        store.c.should.have.length(10)
    })

    it('does not clone on trims that remove nothing', function () {
        let clones = 0
        const { store } = series(50, (i) => (i % 2 ? 'a' : 'b'), { clone: (v) => { clones++; return util.cloneMessage(v) } })
        store[TRIM_SERIES]('c', keepLatest(10))
        clones = 0

        for (let i = 0; i < 59; i++) {
            store[TRIM_SERIES]('c', keepLatest(10))
        }

        clones.should.equal(0)
    })

    it('reports each trim that removes something once', function () {
        const { store, log } = series(100)
        log.length = 0

        for (let i = 0; i < 60; i++) {
            store[TRIM_SERIES]('c', (msgs) => msgs.filter((m) => m.payload > i))
        }

        log.should.eql(Array(60).fill('c'))
    })
})

describe('store: series points', function () {
    const point = (x, topic = 'a') => ({ payload: x, topic, _datapoint: { category: topic, x, y: x } })

    function series (n, topicOf = () => 'a', opts = {}) {
        const made = makeStore({ clone: util.cloneMessage, ...opts })
        for (let i = 0; i < n; i++) {
            made.store[APPEND_ENTRY]('c', point(i, topicOf(i)))
        }
        return made
    }

    const storedMsgs = (store) => {
        let msgs
        store[TRIM_SERIES]('c', (given) => { msgs = given; return given })
        return msgs
    }

    it('links stored messages to plain points', function () {
        const { store } = series(3)

        types.isProxy(storedMsgs(store)[0]._datapoint).should.equal(false)
        types.isProxy(store.c[0]).should.equal(true)
    })

    it('links a saved series\' messages to plain points', function () {
        const { store } = makeStore({ clone: util.cloneMessage })
        store[SET_SERIES]('c', [point(1), { payload: [2, 3], _datapoint: [{ category: 'a', x: 2, y: 2 }, { category: 'b', x: 2, y: 3 }] }])

        const msgs = storedMsgs(store)

        types.isProxy(msgs[0]._datapoint).should.equal(false)
        types.isProxy(msgs[1]._datapoint[0]).should.equal(false)
    })

    it('keeps proxies out of the stored points after nested reads and writes', function () {
        const { store } = series(1)
        store.c[0].meta = { a: { b: 1 } }

        store.c[0].meta.a.b = 2

        const dp = storedMsgs(store)[0]._datapoint
        types.isProxy(dp.meta).should.equal(false)
        types.isProxy(dp.meta.a).should.equal(false)
        dp.meta.a.b.should.equal(2)
    })

    it('reports a write with the point\'s position after a trim', function () {
        const { store, log } = series(5)
        store.c[3].y.should.equal(3)
        store[TRIM_SERIES]('c', (msgs) => msgs.filter((m) => m.payload > 1))
        log.length = 0

        store.c[1].y = 30

        log.should.eql(['c.1.y'])
    })

    it('moves the timestamp on a trim', function () {
        const { store } = series(5)
        const before = store.$c.timestamp

        store[TRIM_SERIES]('c', (msgs) => msgs.filter((m) => m.payload > 1))

        store.$c.timestamp.should.be.above(before)
    })

    it('reads the same proxy for a point each time', function () {
        const { store } = series(3)

        store.c[1].should.equal(store.c[1])
    })

    it('reports a write through a point and shows it in the stored message', function () {
        const { store, log } = series(3)
        log.length = 0

        store.c[0].y = 50

        log.should.eql(['c.0.y'])
        store[ENTRY_MSG]('c')[0]._datapoint.y.should.equal(50)
    })

    it('reports a nested write through a point', function () {
        const { store, log } = series(1)
        store.c[0].meta = { a: 1 }
        log.length = 0

        store.c[0].meta.a = 2

        log.should.eql(['c.0.meta.a'])
    })

    it('stores a copy of a point pushed through the value', function () {
        const { store } = series(1)
        const p = { category: 'a', x: 9, y: 9 }

        store.c.push(p)
        p.y = 999

        store.c[1].y.should.equal(9)
    })

    it('links the $ view to the live points, including multi-point messages', function () {
        const { store } = makeStore({ clone: util.cloneMessage })
        store[SET_SERIES]('c', [
            { payload: [1, 2], _datapoint: [{ category: 'a', x: 1, y: 1 }, { category: 'b', x: 1, y: 2 }] },
            { payload: 'none' },
            { payload: 3, _datapoint: { category: 'a', x: 2, y: 3 } }
        ])

        const msg = store.$c.msg

        msg[0]._datapoint[0].should.equal(store.c[0])
        msg[0]._datapoint[1].should.equal(store.c[1])
        should(msg[1]._datapoint).be.undefined()
        msg[2]._datapoint.should.equal(store.c[2])
    })

    it('reports a write through a $ view point', function () {
        const { store, log } = series(2)
        log.length = 0

        store.$c.msg[1]._datapoint.y = 77

        log.should.eql(['c.1.y'])
        store.c[1].y.should.equal(77)
    })

    it('keeps a series proxy held across a trim live', function () {
        const { store, log } = series(5)
        const held = store.c
        store[TRIM_SERIES]('c', (msgs) => msgs.filter((m) => m.payload > 1))
        log.length = 0

        held[0].y = 40

        log.should.eql(['c.0.y'])
        store.c[0].y.should.equal(40)
        held.should.have.length(3)
    })

    it('stops a series proxy reporting once the series is replaced', function () {
        const { store, log } = series(2)
        const held = store.c
        store[SET_SERIES]('c', [point(5)])
        log.length = 0

        held[0].y = 1

        log.should.eql([])
    })

    it('stops a series proxy reporting once the entry is deleted', function () {
        const { store, log } = series(2)
        const held = store.c
        delete store.c
        log.length = 0

        held[0].y = 1

        log.should.eql([])
    })

    it('reads a point a flow has frozen', function () {
        const { store } = series(2)
        store.c[0].meta = { a: 1 }

        Object.freeze(store.c[0])

        store.c[0].x.should.equal(0)
        store.c[0].meta.a.should.equal(1)
    })

    it('reads a series a flow has frozen', function () {
        const { store } = series(2)

        Object.freeze(store.c)

        store.c.map((p) => p.x).should.eql([0, 1])
    })

    it('gives trim callbacks the stored messages with plain points', function () {
        const { store } = series(2)
        let seen

        store[TRIM_SERIES]('c', (msgs) => { seen = msgs[0]._datapoint; return msgs })

        types.isProxy(seen).should.equal(false)
    })
})

describe('store: flow writes to a series', function () {
    const pt = (x, category = 'a') => ({ category, x, y: x })

    function series (n) {
        const made = makeStore({ clone: util.cloneMessage })
        for (let i = 0; i < n; i++) {
            made.store[APPEND_ENTRY]('c', { payload: i, topic: 'a', unit: 'C', _datapoint: pt(i) })
        }
        made.log.length = 0
        return made
    }

    it('rebuilds the messages when a flow replaces the key', function () {
        const { store } = series(3)

        store.c = [pt(9, 'b')]

        store[ENTRY_MSG]('c').should.eql([{ payload: 9, topic: 'b', _datapoint: pt(9, 'b') }])
        store.$c.msg[0]._datapoint.should.equal(store.c[0])
    })

    it('clears the series when a flow sets it to []', function () {
        const { store } = series(3)

        store.c = []

        store[ENTRY_MSG]('c').should.eql([])
    })

    it('reports a replacement once', function () {
        const { store, log } = series(3)

        store.c = [pt(9), pt(10)]

        log.should.eql(['c'])
    })

    it('still turns a series into a plain value when given a non-array', function () {
        const { store } = series(3)

        store.c = 42

        store[ENTRY_MSG]('c').should.eql({ payload: 42 })
    })

    const built = (p) => ({ payload: p.y, topic: p.category, _datapoint: p })
    const xs = (store) => store.c.map((p) => p.x)
    const payloads = (store) => store[ENTRY_MSG]('c').map((m) => m.payload)

    it('keeps original fields for points that survive a write', function () {
        const { store } = series(3)

        store.c[3] = pt(30)

        const msgs = store[ENTRY_MSG]('c')
        msgs.slice(0, 3).map((m) => m.unit).should.eql(['C', 'C', 'C'])
        msgs[3].should.eql(built(pt(30)))
    })

    it('builds a message for a point assigned over another', function () {
        const { store } = series(3)

        store.c[1] = pt(9)

        xs(store).should.eql([0, 9, 2])
        const msgs = store[ENTRY_MSG]('c')
        msgs[0].unit.should.equal('C')
        msgs[1].should.eql(built(pt(9)))
        msgs[2].unit.should.equal('C')
    })

    it('drops messages when a flow shortens the series', function () {
        const { store } = series(3)

        store.c.length = 1

        xs(store).should.eql([0])
        payloads(store).should.eql([0])
    })

    it('treats delete chart[i] as removing the point', function () {
        const { store } = series(3)

        delete store.c[1]

        xs(store).should.eql([0, 2])
        payloads(store).should.eql([0, 2])
    })

    it('appends a point written past the end', function () {
        const { store } = series(3)

        store.c[10] = pt(10)

        xs(store).should.eql([0, 1, 2, 10])
        store[ENTRY_MSG]('c')[3].should.eql(built(pt(10)))
    })

    it('keeps a multi-point message only while all its points survive', function () {
        const { store } = makeStore({ clone: util.cloneMessage })
        store[SET_SERIES]('c', [{ payload: [1, 2], topic: 'm', _datapoint: [pt(1, 'a'), pt(1, 'b')] }])

        store.c.length = 1

        store[ENTRY_MSG]('c').should.eql([built(pt(1, 'a'))])
    })

    it('keeps a message without points with the next message that has points', function () {
        const msgs = [{ payload: 0, topic: 'a', _datapoint: pt(0) }, { payload: 'n', topic: 'n' }, { payload: 1, topic: 'a', _datapoint: pt(1) }]
        const first = makeStore({ clone: util.cloneMessage }).store
        first[SET_SERIES]('c', msgs)
        const second = makeStore({ clone: util.cloneMessage }).store
        second[SET_SERIES]('c', msgs)

        delete first.c[1]
        delete second.c[0]

        payloads(first).should.eql([0])
        payloads(second).should.eql(['n', 1])
    })

    it('reports each single write once', function () {
        const { store, log } = series(3)

        store.c[0] = pt(5)

        log.should.eql(['c'])
    })

    it('keeps reporting nested writes inside a point', function () {
        const { store, log } = series(3)

        store.c[0].y = 5

        log.should.eql(['c.0.y'])
        store[ENTRY_MSG]('c')[0]._datapoint.y.should.equal(5)
    })

    it('does not relink on the chart\'s own appends', function () {
        const { store, log } = series(3)
        store.c[3] = pt(30)
        log.length = 0

        store[APPEND_ENTRY]('c', { payload: 4, topic: 'a', unit: 'C', _datapoint: pt(4) })

        store[ENTRY_MSG]('c')[4].unit.should.equal('C')
        log.should.eql(['c.4'])
    })

    it('ignores writes through a series proxy taken before the key was replaced', function () {
        const { store, log } = series(3)
        const held = store.c
        store[SET_SERIES]('c', [built(pt(5))])
        log.length = 0

        held[0] = pt(9)
        delete held[1]

        payloads(store).should.eql([5])
        log.should.eql([])
    })

    it('rescales every point in a loop without rebuilding all the messages each time', function () {
        const { store } = makeStore({ clone: util.cloneMessage })
        store[SET_SERIES]('c', Array.from({ length: 5000 }, (_, i) => built(pt(i))))
        const c = store.c
        const started = Date.now()

        for (let i = 0; i < c.length; i++) {
            c[i] = { ...c[i], y: c[i].y * 2 }
        }

        Date.now().should.be.below(started + 1000)
        store[ENTRY_MSG]('c')[4999].should.eql(built({ category: 'a', x: 4999, y: 9998 }))
    })

    it('drops a message without points when the message after it is replaced', function () {
        const { store } = makeStore({ clone: util.cloneMessage })
        store[SET_SERIES]('c', [built(pt(0)), { payload: 'n', topic: 'n' }, built(pt(1))])

        store.c[1] = pt(9)

        payloads(store).should.eql([0, 9])
    })

    it('drops a message without points in front of a replaced point after a multi-point message', function () {
        const { store } = makeStore({ clone: util.cloneMessage })
        store[SET_SERIES]('c', [{ payload: 'm', topic: 'm', _datapoint: [pt(0), pt(1)] }, { payload: 'n', topic: 'n' }, built(pt(2))])

        store.c[2] = pt(9)

        payloads(store).should.eql(['m', 9])
    })

    it('removes a point a flow sets to null', function () {
        const { store } = series(3)

        store.c[1] = null

        xs(store).should.eql([0, 2])
        payloads(store).should.eql([0, 2])
    })

    it('keeps messages without points at the end after a write', function () {
        const { store } = makeStore({ clone: util.cloneMessage })
        store[SET_SERIES]('c', [built(pt(0)), built(pt(1)), { payload: 'n', topic: 'n' }])

        store.c[0] = pt(9)
        store.c.length = 1

        payloads(store).should.eql([9, 'n'])
    })

    it('re-wraps the series on an index write', function () {
        const { store } = series(3)
        const before = store.$c.timestamp

        store.c[1] = pt(9)

        store.$c.timestamp.should.be.above(before)
        store.$c.msg.forEach((m, i) => m._datapoint.should.equal(store.c[i]))
    })

    it('keeps a trailing message without points when a flow writes past the end', function () {
        const { store } = makeStore({ clone: util.cloneMessage })
        store[SET_SERIES]('c', [built(pt(0)), { payload: 'r', topic: 'r' }])

        store.c[store.c.length] = pt(9)

        payloads(store).should.eql([0, 9, 'r'])
    })

    it('flattens an array written as a point into one message', function () {
        const { store } = series(2)

        store.c[store.c.length] = [pt(5, 'a'), pt(5, 'b')]

        store.c.map((p) => p.category).should.eql(['a', 'a', 'a', 'b'])
        const last = store[ENTRY_MSG]('c')[2]
        last._datapoint.should.eql([pt(5, 'a'), pt(5, 'b')])
        store.$c.msg[2]._datapoint[1].should.equal(store.c[3])
    })

    it('leaves a non-series key alone when given an array', function () {
        const { store } = makeStore({ clone: util.cloneMessage })
        store.k = 1

        store.k = [1, 2]

        store[ENTRY_MSG]('k').should.eql({ payload: [1, 2] })
    })
})
