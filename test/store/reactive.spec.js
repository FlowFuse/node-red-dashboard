const Memory = require('@node-red/runtime/lib/nodes/context/memory.js')
const { util } = require('@node-red/util')
const should = require('should') // eslint-disable-line no-unused-vars

const { createDataStore, attachToContext } = require('../../nodes/store/reactive.js')

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

        it('returns the whole object by default', function () {
            const { store } = makeStore()
            store.robot = { temp: 20 }
            store.robot.should.eql({ temp: 20 })
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

        it('still reports a nested write made through the $ value', function () {
            const { store, log } = makeStore()
            store.k = { n: 1 }
            log.length = 0

            store.$k.value.n = 2

            log.should.eql(['k.n'])
            store.k.n.should.equal(2)
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

        it('loses reactivity if a flow clobbers the namespace (known Story 2 risk)', function () {
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

        it('rehydrates around existing plain data and rewires reactivity', function () {
            const g = fakeGlobal()
            g.set('dashboardStore', { a: 5, robot: { temp: 1 } })
            const log = []
            const store = attachToContext(g, { onChange: (k, e, p) => log.push(p) })
            store.a.should.equal(5)
            store.robot.should.eql({ temp: 1 })
            store.a = 6
            log.should.containEql('a')
        })
    })
})
