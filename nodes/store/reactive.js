const STORE = Symbol.for('@flowfuse/node-red-dashboard/store')
const SET_ENTRY = Symbol.for('@flowfuse/node-red-dashboard/setEntry')
const APPEND_ENTRY = Symbol.for('@flowfuse/node-red-dashboard/appendEntry')
const SET_SERIES = Symbol.for('@flowfuse/node-red-dashboard/setSeries')
const NAMESPACE = 'dashboardStore'

class Entry {
    constructor () {
        this.value = undefined
        this.msg = undefined
        this.quality = 'GOOD'
        this.timestamp = 0
        this.history = []
    }
}

// only plain objects and arrays are deep-watched; Buffers, Dates, class instances etc. are opaque leaves
function isReactable (v) {
    if (Array.isArray(v)) return true
    if (v === null || typeof v !== 'object') return false
    const proto = Object.getPrototypeOf(v)
    return proto === null || Object.getPrototypeOf(proto) === null
}

// reads through proxies (structuredClone rejects them); production injects RED.util.cloneMessage
function deepClone (v, seen = new WeakMap()) {
    if (v === null || typeof v !== 'object') return v
    if (Buffer.isBuffer(v)) return Buffer.from(v)
    if (v instanceof Date) return new Date(v)
    if (seen.has(v)) return seen.get(v)
    const out = Array.isArray(v) ? [] : {}
    seen.set(v, out)
    for (const k of Object.keys(v)) out[k] = deepClone(v[k], seen)
    return out
}

function deepReactive (value, notify, path, clone, seen = new WeakMap()) {
    if (!isReactable(value)) return value
    if (seen.has(value)) return seen.get(value)
    const proxy = new Proxy(value, {
        get (t, p, r) { return Reflect.get(t, p, r) },
        set (t, p, v) {
            if (typeof p === 'symbol') return Reflect.set(t, p, v)
            // a push writes the new index then grows length; only a shrink is a change worth reporting
            const shrank = p === 'length' && Array.isArray(t) && v < t.length
            t[p] = deepReactive(clone(v), notify, `${path}.${String(p)}`, clone)
            if (p !== 'length') notify(`${path}.${String(p)}`)
            else if (shrank) notify(path)
            return true
        },
        deleteProperty (t, p) {
            const existed = p in t
            const ok = delete t[p]
            if (existed) notify(`${path}.${String(p)}`)
            return ok
        }
    })
    // registered before walking children so a cycle resolves to this proxy instead of recursing
    seen.set(value, proxy)
    for (const k of Object.keys(value)) value[k] = deepReactive(value[k], notify, `${path}.${k}`, clone, seen)
    return proxy
}

function deepFreeze (v) {
    if (!isReactable(v) || Object.isFrozen(v)) return v
    Object.freeze(v)
    for (const k of Object.keys(v)) deepFreeze(v[k])
    return v
}

function freezeOwned (owned, except) {
    for (const k of Object.keys(owned)) {
        if (k === except || k === 'req' || k === 'res') continue
        deepFreeze(owned[k])
    }
    return owned
}

function createDataStore ({ maxHistory = 5, onChange, clone = deepClone, now = Date.now } = {}) {
    const cloneValue = (v) => (v && typeof v === 'object') ? clone(v) : v
    const emit = (prop, rec, path) => { try { onChange?.(prop, rec, path) } catch (err) {} }
    const records = Object.create(null)

    records[STORE] = true

    // returns the record without notifying, so a caller can finish writing it before onChange fires
    const writeValue = (prop, value) => {
        let rec = records[prop]
        if (!rec) {
            rec = new Entry()
            records[prop] = rec
        } else if (!Array.isArray(rec.value)) {
            // snapshotting a whole array on every write (e.g. a table's rows) would blow up memory
            rec.history.push(Object.freeze({ value: deepFreeze(cloneValue(rec.value)), timestamp: rec.timestamp }))
            if (rec.history.length > maxHistory) rec.history.shift()
        }
        const notify = (path) => {
            // a replaced value keeps its proxies alive; they must not report into the record any more
            if (rec.value !== wrapped) return
            rec.timestamp = now()
            emit(prop, rec, path)
        }
        const wrapped = deepReactive(value, notify, prop, cloneValue)
        rec.value = wrapped
        rec.msg = Object.freeze({ payload: wrapped })
        rec.timestamp = now()
        return rec
    }

    records[SET_ENTRY] = (prop, msg) => {
        const { payload, ...rest } = cloneValue(msg)
        const rec = writeValue(prop, payload)
        rec.msg = Object.freeze({ ...freezeOwned(rest), payload: rec.value })
        emit(prop, rec, prop)
    }

    const pointsOf = (d) => (d === undefined || d === null) ? [] : (Array.isArray(d) ? d : [d])

    const toStoredDatapoint = (series, datapoint, start, end) => {
        if (end === start) return undefined
        return Array.isArray(datapoint) ? Object.freeze(series.slice(start, end)) : series[start]
    }

    const toStoredMessage = (owned, datapoint) => {
        freezeOwned(owned, '_datapoint')
        if (datapoint !== undefined) owned._datapoint = datapoint
        else deepFreeze(owned._datapoint)
        return Object.freeze(owned)
    }

    records[SET_SERIES] = (prop, msgs) => {
        const points = []
        const parts = msgs.map((msg) => {
            const { _datapoint, ...rest } = msg
            const owned = cloneValue(rest)
            const datapoint = cloneValue(_datapoint)
            const start = points.length
            for (const p of pointsOf(datapoint)) points.push(p)
            return { msg, owned, datapoint, start, end: points.length }
        })
        const rec = writeValue(prop, points)
        rec.msg = parts.map(({ msg, owned, datapoint, start, end }) => {
            const stored = toStoredDatapoint(rec.value, datapoint, start, end)
            if (stored === undefined && '_datapoint' in msg) owned._datapoint = datapoint
            return toStoredMessage(owned, stored)
        })
        emit(prop, rec, prop)
    }

    records[APPEND_ENTRY] = (prop, msg) => {
        let rec = records[prop]
        const replaced = !!rec && !(Array.isArray(rec.value) && Array.isArray(rec.msg))
        if (!rec || replaced) {
            rec = writeValue(prop, [])
            rec.msg = []
        }
        // the proxy clones on push, so points must not be cloned again here
        const { _datapoint, ...rest } = msg
        const owned = cloneValue(rest)
        const start = rec.value.length
        for (const p of pointsOf(_datapoint)) rec.value.push(p)
        const stored = toStoredDatapoint(rec.value, _datapoint, start, rec.value.length)
        if (stored === undefined && '_datapoint' in msg) owned._datapoint = cloneValue(_datapoint)
        rec.msg.push(toStoredMessage(owned, stored))
        if (replaced) emit(prop, rec, prop)
    }

    const handler = {
        get (target, prop, receiver) {
            if (typeof prop === 'symbol') return Reflect.get(target, prop, receiver)
            if (prop === 'toJSON') {
                return () => Object.fromEntries(Object.entries(target).map(([k, r]) => [k, r.value]))
            }
            if (prop.startsWith('$')) {
                const rec = target[prop.slice(1)]
                if (!rec) return undefined
                const msg = Array.isArray(rec.msg) ? Object.freeze(rec.msg.slice()) : rec.msg
                return Object.freeze({ value: rec.value, msg, quality: rec.quality, timestamp: rec.timestamp, history: Object.freeze(rec.history.slice()) })
            }
            const rec = target[prop]
            return rec ? rec.value : undefined
        },
        set (target, prop, value) {
            if (typeof prop === 'symbol') return Reflect.set(target, prop, value)
            // returning true rather than false so a strict caller picking a reserved name doesn't throw
            if (prop === '__proto__' || prop === 'constructor' || prop === 'toJSON') return true
            if (prop.startsWith('$')) return true // '$' is reserved for the read-only meta view

            const rec = writeValue(prop, cloneValue(value))
            emit(prop, rec, prop)
            return true
        },
        ownKeys (target) { return Reflect.ownKeys(target) },
        deleteProperty (target, prop) {
            const rec = target[prop]
            const existed = prop in target
            const ok = delete target[prop]
            if (rec) rec.value = undefined
            if (existed) emit(prop, undefined, prop)
            return ok
        }
    }
    return new Proxy(records, handler)
}

const injected = new WeakMap()

// Inject the store into global context once. On redeploy the existing store is reused;
// after a restart with a persistent context store, existing plain data is rehydrated.
// Returns null when the context store can't hold a live proxy: a cache-off store serves
// only async access so a sync get throws, and a serialising store hands back a copy.
function attachToContext (globalContext, opts = {}) {
    const namespace = opts.namespace || NAMESPACE
    let existing
    try {
        existing = globalContext.get(namespace)
    } catch (err) {
        return null
    }
    if (existing && existing[STORE]) {
        injected.set(globalContext, existing)
        return existing
    }

    const previous = injected.get(globalContext)
    if (previous && existing !== previous) opts.onReplaced?.()

    const store = createDataStore(opts)
    if (isReactable(existing) && !Array.isArray(existing)) {
        for (const [k, v] of Object.entries(existing)) store[k] = v
    }
    globalContext.set(namespace, store)
    if (globalContext.get(namespace) !== store) return null
    injected.set(globalContext, store)
    return store
}

module.exports = { createDataStore, attachToContext, NAMESPACE, STORE, SET_ENTRY, APPEND_ENTRY, SET_SERIES }
