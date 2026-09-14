/*
 * Reactive data store POC: an Entry (value + metadata) at each top-level key,
 * with a deep-reactive .value, injected into a real Node-RED memory context.
 * A write fires onChange(key, entry, path).
 * Run from the dashboard repo or a Node-RED install: node combined-store.js
 *
 * Tests: value/$meta reads, history, nested + array mutation (incl. truncation),
 * top-level delete, '$'-key reservation, prototype guards, maxHistory eviction,
 * callback API, namespace clobber, and serialise + restart with reactivity.
 */

const Memory = require('@node-red/runtime/lib/nodes/context/memory.js')

let tick = 0
const clock = () => tick++ // deterministic for the spike; Date.now() in production
const snapshot = (v) => (v && typeof v === 'object') ? JSON.parse(JSON.stringify(v)) : v

class Entry {
    constructor () {
        this.value = undefined
        this.quality = 'GOOD'
        this.timestamp = 0
        this.history = []
    }
}

function deepReactive (value, notify, path) {
    if (value === null || typeof value !== 'object') return value
    for (const k of Object.keys(value)) value[k] = deepReactive(value[k], notify, `${path}.${k}`)
    return new Proxy(value, {
        get (t, p, r) { return Reflect.get(t, p, r) },
        set (t, p, v) {
            if (typeof p === 'symbol') return Reflect.set(t, p, v)
            const shrank = p === 'length' && Array.isArray(t) && v < t.length
            t[p] = deepReactive(v, notify, `${path}.${String(p)}`)
            if (p !== 'length') notify(`${path}.${String(p)}`) // index/prop write
            else if (shrank) notify(path) // array truncation (e.g. arr.length = 0); growth from push is ignored
            return true
        },
        deleteProperty (t, p) { const ok = delete t[p]; notify(`${path}.${String(p)}`); return ok }
    })
}

function createDataStore ({ maxHistory = 20, onChange } = {}) {
    const records = Object.create(null)
    const handler = {
        get (target, prop, receiver) {
            if (typeof prop === 'symbol') return Reflect.get(target, prop, receiver)
            if (prop === 'toJSON') {
                return () => Object.fromEntries(Object.entries(target).map(([k, r]) => [k, r.value]))
            }
            if (prop.startsWith('$')) return target[prop.slice(1)] // read-only meta view: $key -> Entry
            const rec = target[prop]
            return rec ? rec.value : undefined // value by default (deep-reactive if object)
        },
        set (target, prop, value) {
            if (typeof prop === 'symbol') return Reflect.set(target, prop, value)
            if (prop === '__proto__' || prop === 'constructor') return false
            if (prop.startsWith('$')) return false // '$' reserved for the meta view; keys can't start with $

            let rec = target[prop]
            if (!rec) {
                rec = new Entry()
                target[prop] = rec
            } else {
                rec.history.push({ value: snapshot(rec.value), timestamp: rec.timestamp })
                if (rec.history.length > maxHistory) rec.history.shift()
            }
            const notify = (path) => { rec.timestamp = clock(); onChange?.(prop, rec, path) }
            rec.value = deepReactive(value, notify, prop)
            rec.timestamp = clock()
            onChange?.(prop, rec, prop)
            return true
        },
        ownKeys (target) { return Reflect.ownKeys(target) },
        getOwnPropertyDescriptor (target, prop) {
            return Object.getOwnPropertyDescriptor(target, prop) ?? { enumerable: true, configurable: true }
        },
        deleteProperty (target, prop) {
            const existed = prop in target
            const ok = delete target[prop]
            if (existed) onChange?.(prop, undefined, prop) // notify on top-level delete
            return ok
        }
    }
    return new Proxy(records, handler)
}

// ---- wire into a real Node-RED memory context under global.dashboard ----
let log = []
function makeContext (opts = {}) {
    log = []
    const ctx = Memory({})
    ctx.set('global', 'dashboard', createDataStore({ ...opts, onChange: (key, entry, path) => log.push(path) }))
    return ctx
}
const gset = (ctx, k, v) => ctx.set('global', k, v)
const gget = (ctx, k) => ctx.get('global', k)

let pass = 0; let fail = 0
// shape check (JSON equality) — proves stored/serialised shape, NOT liveness. Liveness is proven via `log`.
const check = (n, a, e) => { const ok = JSON.stringify(a) === JSON.stringify(e); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${ok ? '' : `  (exp ${JSON.stringify(e)}, got ${JSON.stringify(a)})`}`); ok ? pass++ : fail++ }

console.log('\n--- flat scalar ---')
{
    const ctx = makeContext()
    gset(ctx, 'dashboard.k1', 123)
    check('scalar set fires onChange at key level', log, ['k1'])
    check('value by default', gget(ctx, 'dashboard.k1'), 123)
    check('$meta returns the Entry', (() => { const r = gget(ctx, 'dashboard.$k1'); return { value: r.value, quality: r.quality } })(), { value: 123, quality: 'GOOD' })
}

console.log('\n--- reassign: history snapshots the prior value (not a live ref) ---')
{
    const ctx = makeContext()
    gset(ctx, 'dashboard.obj', { n: 1 })
    gset(ctx, 'dashboard.obj', { n: 2 })
    check('current value', gget(ctx, 'dashboard.obj'), { n: 2 })
    const hist = gget(ctx, 'dashboard.$obj').history
    check('history captured prior value', hist.map(h => h.value), [{ n: 1 }])
    // mutate the CURRENT value; history must not change (snapshot, not alias)
    gget(ctx, 'dashboard.obj').n = 999
    check('history not corrupted by later mutation', gget(ctx, 'dashboard.$obj').history.map(h => h.value), [{ n: 1 }])
}

console.log('\n--- nested object: liveness proven, not just shape ---')
{
    const ctx = makeContext()
    gset(ctx, 'dashboard.robot', { temp: 20 })
    log = []
    gget(ctx, 'dashboard.robot').temp = 25 // direct nested mutation on the returned value
    check('LIVENESS: nested mutation on returned value fires', log, ['robot.temp'])
    check('nested value updated', gget(ctx, 'dashboard.robot').temp, 25)
    gset(ctx, 'dashboard.robot.speed', 5) // nested set via context path (change-node style)
    check('value-by-default still returns the whole object', gget(ctx, 'dashboard.robot'), { temp: 25, speed: 5 })
}

console.log('\n--- array: push, deep mutate, and CLEAR (length=0) ---')
{
    const ctx = makeContext()
    gset(ctx, 'dashboard.series', [])
    log = []
    gget(ctx, 'dashboard.series').push({ x: 1, y: 2 })
    check('push fires once (length growth ignored)', log, ['series.0'])
    log = []
    gget(ctx, 'dashboard.series')[0].y = 99
    check('deep mutation inside array fires', log, ['series.0.y'])
    log = []
    gget(ctx, 'dashboard.series').length = 0 // truncation — previously invisible
    check('array clear via length=0 fires', log, ['series'])
    check('array emptied', gget(ctx, 'dashboard.series'), [])
}

console.log('\n--- top-level delete notifies ---')
{
    const ctx = makeContext()
    gset(ctx, 'dashboard.gone', 1)
    log = []
    gset(ctx, 'dashboard.gone', undefined) // change-node style: setObjectProperty deletes on undefined
    check('delete fires onChange', log, ['gone'])
    check('value removed', gget(ctx, 'dashboard.gone'), undefined)
}

console.log('\n--- guards: no prototype pollution AND no own-key created ---')
{
    const ctx = makeContext()
    const store = gget(ctx, 'dashboard')
    store.__proto__ = { polluted: true } // eslint-disable-line no-proto
    store.constructor = { polluted: true }
    check('Object.prototype not polluted', ({}).polluted, undefined)
    check('no __proto__/constructor own-keys created', Reflect.ownKeys(store).filter(k => k === '__proto__' || k === 'constructor'), [])
}

console.log('\n--- $ prefix reserved (no silent data loss) ---')
{
    const ctx = makeContext()
    gset(ctx, 'dashboard.$weird', 1) // reserved: set is a no-op
    check('set of $-key is a no-op, not stored-then-lost', gget(ctx, 'dashboard.$weird'), undefined)
    gset(ctx, 'dashboard.normal', 7)
    check('normal keys unaffected', gget(ctx, 'dashboard.normal'), 7)
    check('$normal still reads the Entry', gget(ctx, 'dashboard.$normal').value, 7)
}

console.log('\n--- maxHistory eviction ---')
{
    const ctx = makeContext({ maxHistory: 2 })
    for (let i = 0; i < 5; i++) gset(ctx, 'dashboard.h', i)
    check('history capped at maxHistory', gget(ctx, 'dashboard.$h').history.map(x => x.value), [2, 3])
    check('current value is latest', gget(ctx, 'dashboard.h'), 4)
}

console.log('\n--- Node-RED async callback API works + reactivity intact ---')
{
    const ctx = makeContext()
    let cbVal
    ctx.set('global', 'dashboard.cbk', 42, () => {}) // set with callback
    ctx.get('global', 'dashboard.cbk', (err, v) => { cbVal = err ? 'ERR' : v }) // get with callback
    check('callback get returns value', cbVal, 42)
    log = []
    gget(ctx, 'dashboard.cbk') // no-op read
    ctx.set('global', 'dashboard.cbk', 43, () => {})
    check('write via callback still fires onChange', log, ['cbk'])
}

console.log('\n--- namespace clobber (documents Story 2 risk) ---')
{
    const ctx = makeContext()
    gset(ctx, 'dashboard.k', 1)
    gset(ctx, 'dashboard', { k: 999 }) // a flow overwrites the whole namespace
    log = []
    gset(ctx, 'dashboard.k', 2)
    check('after clobber, writes are NOT observed (proxy replaced)', log, [])
    check('namespace is now a plain object', gget(ctx, 'dashboard.k'), 2)
}

console.log('\n--- serialise + restart, with nesting + deep reactivity rewired ---')
{
    const ctx = makeContext()
    gset(ctx, 'dashboard.a', 10)
    gset(ctx, 'dashboard.robot', { temp: 20, axes: [1, 2] })
    const snap = JSON.parse(JSON.stringify(gget(ctx, 'dashboard')))
    check('toJSON flattens Entries -> values (nested preserved)', snap, { a: 10, robot: { temp: 20, axes: [1, 2] } })

    const ctx2 = Memory({})
    const store2 = createDataStore({ onChange: (k, e, p) => log.push(p) })
    for (const [k, v] of Object.entries(snap)) store2[k] = v // rehydrate through set
    ctx2.set('global', 'dashboard', store2)
    check('scalar survived restart', ctx2.get('global', 'dashboard.a'), 10)
    check('nested survived restart', ctx2.get('global', 'dashboard.robot'), { temp: 20, axes: [1, 2] })
    log = []
    ctx2.get('global', 'dashboard.robot').axes.push(3) // deep reactivity, post-restart
    check('LIVENESS: deep reactivity works after restart', log, ['robot.axes.2'])
}

console.log(`\n===== ${pass} passed, ${fail} failed =====`)
process.exit(fail ? 1 : 0)
