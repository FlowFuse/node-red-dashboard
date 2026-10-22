const { preparedSeries, SeriesEntry } = require('./series.js')
const { isReactable, deepClone, deepReactive, deepFreeze, freezeOwned } = require('./utils.js')

const STORE = Symbol.for('@flowfuse/node-red-dashboard/store')
const APPEND_ENTRY = Symbol.for('@flowfuse/node-red-dashboard/appendEntry')
const SET_SERIES = Symbol.for('@flowfuse/node-red-dashboard/setSeries')
const MERGE_ENTRY = Symbol.for('@flowfuse/node-red-dashboard/mergeEntry')
const TRIM_SERIES = Symbol.for('@flowfuse/node-red-dashboard/trimSeries')
const ENTRY_MSG = Symbol.for('@flowfuse/node-red-dashboard/entryMsg')
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

function createDataStore ({ maxHistory = 5, onChange, clone = deepClone, now = Date.now } = {}) {
    const cloneValue = (v) => (v && typeof v === 'object') ? clone(v) : v
    const emit = (prop, rec, path) => { try { onChange?.(prop, rec, path) } catch (err) {} }
    const records = Object.create(null)

    records[STORE] = true

    const storeProps = { cloneValue, emit, now, entryFor: (prop) => records[prop] }

    const snapshot = (rec) => {
        // snapshotting a whole array on every write (e.g. a table's rows) would blow up memory
        if (Array.isArray(rec.value) || !('payload' in rec.msg)) {
            return
        }
        rec.history.push(Object.freeze({ value: deepFreeze(cloneValue(rec.value)), timestamp: rec.timestamp }))
        if (rec.history.length > maxHistory) {
            rec.history.shift()
        }
    }

    // returns the record without notifying, so a caller can finish writing it before onChange fires
    const writeValue = (prop, value) => {
        let rec = records[prop]
        if (rec instanceof SeriesEntry) {
            const history = rec.history
            rec = new Entry()
            rec.history = history
            records[prop] = rec
        } else if (rec) {
            snapshot(rec)
        } else {
            rec = new Entry()
            records[prop] = rec
        }
        const notify = (path) => {
            // a replaced value keeps its proxies alive; they must not report into the record any more
            if (records[prop] !== rec || rec.value !== wrapped) return
            rec.timestamp = now()
            emit(prop, rec, path)
        }
        const wrapped = deepReactive(value, notify, prop, cloneValue)
        rec.value = wrapped
        rec.msg = Object.freeze({ payload: wrapped })
        rec.timestamp = now()
        return rec
    }

    const seriesAt = (prop) => {
        const current = records[prop]
        if (current instanceof SeriesEntry) {
            return current
        }
        if (current) {
            snapshot(current)
        }
        const entry = new SeriesEntry(prop, storeProps, current ? current.history : [])
        records[prop] = entry
        return entry
    }

    records[ENTRY_MSG] = (prop) => {
        const rec = records[prop]
        if (!rec) {
            return undefined
        }
        return clone(rec.msg)
    }

    records[MERGE_ENTRY] = (prop, msg) => {
        const current = records[prop]
        const { payload, ...incoming } = msg
        const isSeries = current instanceof SeriesEntry
        const previous = isSeries ? freezeOwned(cloneValue({ ...current.msg })) : current?.msg || {}
        const { payload: storedPayload, ...stored } = previous
        const keepValue = current && !isSeries && !('payload' in msg)
        const owned = freezeOwned(cloneValue(incoming))
        const value = keepValue ? undefined : cloneValue(payload)
        const rec = keepValue ? current : writeValue(prop, value)
        const fields = { ...stored, ...owned }
        const hasPayload = 'payload' in msg || (keepValue && 'payload' in current.msg)
        rec.msg = Object.freeze(hasPayload ? { ...fields, payload: rec.value } : fields)
        rec.timestamp = now()
        emit(prop, rec, prop)
    }

    records[SET_SERIES] = (prop, msgs) => {
        const prepared = preparedSeries(msgs, cloneValue)
        seriesAt(prop).replaceAll(prepared)
    }

    records[APPEND_ENTRY] = (prop, msg) => {
        const { _datapoint, ...rest } = msg
        const owned = cloneValue(rest)
        const replaced = prop in records && !(records[prop] instanceof SeriesEntry)
        const entry = seriesAt(prop)
        entry.append(owned, _datapoint, '_datapoint' in msg)
        if (replaced) {
            emit(prop, entry, prop)
        }
    }

    records[TRIM_SERIES] = (prop, trim) => {
        const rec = records[prop]
        if (rec instanceof SeriesEntry) {
            rec.trim(trim)
        }
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
                const msg = rec instanceof SeriesEntry ? rec.linkedMessages() : rec.msg
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
            if (typeof prop === 'symbol') return Reflect.deleteProperty(target, prop)
            const rec = target[prop]
            const existed = prop in target
            const ok = delete target[prop]
            if (rec) {
                rec.value = undefined
            }
            if (existed) emit(prop, undefined, prop)
            return ok
        }
    }
    return new Proxy(records, handler)
}

const injected = new WeakMap()

// Inject the store into global context once. On redeploy the existing store is reused;
// after a restart it starts fresh and plain data a flow put in its place is copied in.
// Returns null when the context store can't hold a live proxy: a cache-off store serves
// only async access so a sync get throws, and a serialising store hands back a copy.
function attachToContext (globalContext, opts = {}) {
    const namespace = opts.namespace || NAMESPACE
    let existing
    try {
        existing = globalContext.get(namespace)
    } catch (err) {
        opts.onUnavailable?.(err)
        return null
    }
    if (existing && existing[STORE]) {
        injected.set(globalContext, existing)
        return existing
    }

    const previous = injected.get(globalContext)

    const store = createDataStore(opts)
    if (previous && isReactable(existing) && !Array.isArray(existing)) {
        for (const [k, v] of Object.entries(existing)) store[k] = v
    }
    globalContext.set(namespace, store)
    if (globalContext.get(namespace) !== store) return null
    if (previous && existing !== previous) opts.onReplaced?.()
    injected.set(globalContext, store)
    return store
}

module.exports = { createDataStore, attachToContext, NAMESPACE, STORE, APPEND_ENTRY, SET_SERIES, MERGE_ENTRY, TRIM_SERIES, ENTRY_MSG }
