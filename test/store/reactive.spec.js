const fs = require('fs')
const http = require('http')
const os = require('os')
const path = require('path')

const vm = require('vm')

const LocalFileSystem = require('@node-red/runtime/lib/nodes/context/localfilesystem.js')
const Memory = require('@node-red/runtime/lib/nodes/context/memory.js')

const { util } = require('@node-red/util')
const should = require('should') // eslint-disable-line no-unused-vars

const { createDataStore, attachToContext, STORE, SET_ENTRY } = require('../../nodes/store/reactive.js')

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
            store[SET_ENTRY]('k1', 42, { payload: 42, topic: 'boiler' })
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

            store[SET_ENTRY]('gauge', msg.payload, msg)

            store.gauge.should.equal(42)
            store.$gauge.msg.should.eql({ payload: 42, topic: 'sensor-A' })
            log.should.eql(['gauge'])
        })

        it('keeps history on the value, as a normal write does', function () {
            const { store } = makeStore()
            store[SET_ENTRY]('gauge', 1, { payload: 1 })
            store[SET_ENTRY]('gauge', 2, { payload: 2 })

            store.gauge.should.equal(2)
            store.$gauge.history.map((h) => h.value).should.eql([1])
        })

        it('does not clone the message it is given', function () {
            const { store } = makeStore()
            const msg = { payload: 1, nested: { a: 1 } }
            store[SET_ENTRY]('k', msg.payload, msg)

            should(store.$k.msg).equal(msg)
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
            store[SET_ENTRY]('k', 42, { payload: 42, topic: 'boiler' })
            log.length = 0

            const write = function () { 'use strict'; store.$k.msg.payload = 'TAMPERED' }

            write.should.throw()
            store.$k.msg.payload.should.equal(42)
            log.should.be.empty()
        })

        it('does not let a nested property of the stored msg be rewritten through $', function () {
            const { store } = makeStore()
            store[SET_ENTRY]('k', { deep: { n: 1 } }, { payload: { deep: { n: 1 } } })

            const write = function () { 'use strict'; store.$k.msg.payload.deep.n = 'TAMPERED' }

            write.should.throw()
            store.$k.msg.payload.deep.n.should.equal(1)
        })

        it('does not let a nested property of a history entry be rewritten through $', function () {
            const { store } = makeStore()
            store.k = { n: 1 }
            store.k = { n: 2 }

            const write = function () { 'use strict'; store.$k.history[0].value.n = 'TAMPERED' }

            write.should.throw()
            store.$k.history[0].value.n.should.equal(1)
        })

        it('leaves msg.req and msg.res usable, since cloneMessage keeps them as live handles', function () {
            const { store } = makeStore()
            const req = new http.IncomingMessage({ fake: 'socket' })
            const res = new http.ServerResponse(req)
            store[SET_ENTRY]('k', 1, { payload: 1, req, res })

            Object.isFrozen(req).should.be.false()
            res.setHeader.bind(res, 'x-test', '1').should.not.throw()
        })

        it('still reports a nested write made through the $ value', function () {
            const { store, log } = makeStore()
            store.k = { n: 1 }
            log.length = 0

            store.$k.value.n = 2

            log.should.eql(['k.n'])
            store.k.n.should.equal(2)
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
        it('does not rehydrate an array into numeric keys', function () {
            const m = { dashboardStore: ['a', 'b'] }
            const g = { get: (k) => m[k], set: (k, v) => { m[k] = v } }

            const store = attachToContext(g, {})

            Object.keys(store).should.eql([])
            JSON.stringify(store).should.equal('{}')
        })

        it('does not spread a class instance into keys', function () {
            const m = { dashboardStore: new Date() }
            const g = { get: (k) => m[k], set: (k, v) => { m[k] = v } }

            const store = attachToContext(g, {})

            Object.keys(store).should.eql([])
        })

        it('rehydrates an object a function node left at the namespace', function () {
            const m = { dashboardStore: fnNodeObject('({ robot: "PLAIN", count: 3 })') }
            const g = { get: (k) => m[k], set: (k, v) => { m[k] = v } }

            const store = attachToContext(g, {})

            store.robot.should.equal('PLAIN')
            store.count.should.equal(3)
        })

        it('still rehydrates a plain object', function () {
            const m = { dashboardStore: { robot: { temp: 20 }, count: 3 } }
            const g = { get: (k) => m[k], set: (k, v) => { m[k] = v } }

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

        it('does not warn when a restart rehydrates plain data it never injected', function () {
            const g = fakeGlobal()
            g.set('dashboardStore', { widget: 'from disk' }) // what a persistent context store hands back
            let warned = 0
            const store = attachToContext(g, { onReplaced: () => { warned++ } })
            warned.should.equal(0)
            store.widget.should.equal('from disk')
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
