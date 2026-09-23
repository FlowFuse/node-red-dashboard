const STORE = Symbol.for('@flowfuse/node-red-dashboard/store')
const NAMESPACE = 'dashboardStore'

class Entry {
    constructor () {
        this.value = undefined
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

function createDataStore ({ maxHistory = 5, onChange, clone = deepClone, now = Date.now } = {}) {
    const cloneValue = (v) => (v && typeof v === 'object') ? clone(v) : v
    const emit = (prop, rec, path) => { try { onChange?.(prop, rec, path) } catch (err) {} }
    const records = Object.create(null)

    records[STORE] = true

    const handler = {
        get (target, prop, receiver) {
            if (typeof prop === 'symbol') return Reflect.get(target, prop, receiver)
            if (prop === 'toJSON') {
                return () => Object.fromEntries(Object.entries(target).map(([k, r]) => [k, r.value]))
            }
            if (prop.startsWith('$')) {
                const rec = target[prop.slice(1)]
                return rec && Object.freeze({ value: rec.value, quality: rec.quality, timestamp: rec.timestamp, history: Object.freeze(rec.history.slice()) })
            }
            const rec = target[prop]
            return rec ? rec.value : undefined
        },
        set (target, prop, value) {
            if (typeof prop === 'symbol') return Reflect.set(target, prop, value)
            // no-op guards return true so strict-mode callers do not throw
            if (prop === '__proto__' || prop === 'constructor' || prop === 'toJSON') return true
            if (prop.startsWith('$')) return true // '$' is reserved for the read-only meta view

            let rec = target[prop]
            if (!rec) {
                rec = new Entry()
                target[prop] = rec
            } else {
                rec.history.push(Object.freeze({ value: cloneValue(rec.value), timestamp: rec.timestamp }))
                if (rec.history.length > maxHistory) rec.history.shift()
            }
            const notify = (path) => {
                // a replaced value keeps its proxies alive; they must not report into the record any more
                if (rec.value !== wrapped) return
                rec.timestamp = now()
                emit(prop, rec, path)
            }
            // clone on write so a flow reusing its own object can't mutate stored state
            const wrapped = deepReactive(cloneValue(value), notify, prop, cloneValue)
            rec.value = wrapped
            rec.timestamp = now()
            emit(prop, rec, prop)
            return true
        },
        ownKeys (target) { return Reflect.ownKeys(target) },
        deleteProperty (target, prop) {
            const existed = prop in target
            const ok = delete target[prop]
            if (existed) emit(prop, undefined, prop)
            return ok
        }
    }
    return new Proxy(records, handler)
}

// A cache-off persistent store serves only async access, so a sync get throws; the reactive proxy needs an in-memory store.
function isInMemoryBacked (globalContext, namespace = NAMESPACE) {
    try {
        globalContext.get(namespace)
        return true
    } catch (err) {
        return false
    }
}

const injected = new WeakMap()

// Inject the store into global context once. On redeploy the existing store is reused;
// after a restart with a persistent context store, existing plain data is rehydrated.
function attachToContext (globalContext, opts = {}) {
    const namespace = opts.namespace || NAMESPACE
    const existing = globalContext.get(namespace)
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
    injected.set(globalContext, store)
    return store
}

module.exports = { createDataStore, attachToContext, isInMemoryBacked, NAMESPACE, STORE }
