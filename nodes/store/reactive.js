const { pointsOf, storedDatapoint, compactTrimmed, linkLivePoints } = require('./series.js')
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
        this.plainPoints = undefined
    }
}

function createDataStore ({ maxHistory = 5, onChange, clone = deepClone, now = Date.now } = {}) {
    const cloneValue = (v) => (v && typeof v === 'object') ? clone(v) : v
    const emit = (prop, rec, path) => { try { onChange?.(prop, rec, path) } catch (err) {} }
    const records = Object.create(null)

    records[STORE] = true

    // returns the record without notifying, so a caller can finish writing it before onChange fires
    const writeValue = (prop, value, wrapOnRead = false) => {
        let rec = records[prop]
        if (!rec) {
            rec = new Entry()
            records[prop] = rec
        } else if (!Array.isArray(rec.value) && 'payload' in rec.msg) {
            // snapshotting a whole array on every write (e.g. a table's rows) would blow up memory
            rec.history.push(Object.freeze({ value: deepFreeze(cloneValue(rec.value)), timestamp: rec.timestamp }))
            if (rec.history.length > maxHistory) rec.history.shift()
        }
        const notify = (path) => {
            // a replaced value keeps its proxies alive; they must not report into the record any more
            if (wrapOnRead ? rec.plainPoints !== value : rec.value !== wrapped) return
            rec.timestamp = now()
            emit(prop, rec, path)
        }
        const wrapped = deepReactive(value, notify, prop, cloneValue, new WeakMap(), wrapOnRead)
        rec.value = wrapped
        rec.plainPoints = wrapOnRead ? value : undefined
        rec.msg = Object.freeze({ payload: wrapped })
        rec.timestamp = now()
        return rec
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
        const previous = Array.isArray(current?.msg) ? freezeOwned(cloneValue({ ...current.msg })) : current?.msg || {}
        const { payload: storedPayload, ...stored } = previous
        const keepValue = current && !Array.isArray(current.msg) && !('payload' in msg)
        const owned = freezeOwned(cloneValue(incoming))
        const value = keepValue ? undefined : cloneValue(payload)
        const rec = keepValue ? current : writeValue(prop, value)
        const fields = { ...stored, ...owned }
        const hasPayload = 'payload' in msg || (keepValue && 'payload' in current.msg)
        rec.msg = Object.freeze(hasPayload ? { ...fields, payload: rec.value } : fields)
        rec.timestamp = now()
        emit(prop, rec, prop)
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
        const rec = writeValue(prop, points, true)
        rec.msg = parts.map(({ msg, owned, datapoint, start, end }) => {
            const stored = storedDatapoint(points, datapoint, start, end)
            if (stored === undefined && '_datapoint' in msg) owned._datapoint = datapoint
            return toStoredMessage(owned, stored)
        })
        emit(prop, rec, prop)
    }

    records[APPEND_ENTRY] = (prop, msg) => {
        let rec = records[prop]
        const replaced = !!rec && !(Array.isArray(rec.value) && Array.isArray(rec.msg))
        // the proxy clones on push, so points must not be cloned again here
        const { _datapoint, ...rest } = msg
        const owned = cloneValue(rest)
        if (!rec || replaced) {
            rec = writeValue(prop, [], true)
            rec.msg = []
        }
        const start = rec.value.length
        for (const p of pointsOf(_datapoint)) rec.value.push(p)
        const stored = storedDatapoint(rec.plainPoints, _datapoint, start, rec.value.length)
        if (stored === undefined && '_datapoint' in msg) owned._datapoint = cloneValue(_datapoint)
        rec.msg.push(toStoredMessage(owned, stored))
        if (replaced) emit(prop, rec, prop)
    }

    records[TRIM_SERIES] = (prop, trim) => {
        const rec = records[prop]
        if (!rec || !Array.isArray(rec.msg)) {
            return
        }
        const msgs = trim(rec.msg)
        if (msgs.length === rec.msg.length) {
            return
        }
        compactTrimmed(rec.plainPoints, rec.msg, msgs)
        writeValue(prop, rec.plainPoints, true)
        rec.msg = msgs
        emit(prop, rec, prop)
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
                const msg = Array.isArray(rec.msg) ? linkLivePoints(rec.msg, (i) => rec.value[i]) : rec.msg
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
                rec.plainPoints = undefined
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
