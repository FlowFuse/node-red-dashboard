const STORE = Symbol.for('@flowfuse/node-red-dashboard/store')
const APPEND_ENTRY = Symbol.for('@flowfuse/node-red-dashboard/appendEntry')
const SET_SERIES = Symbol.for('@flowfuse/node-red-dashboard/setSeries')
const MERGE_ENTRY = Symbol.for('@flowfuse/node-red-dashboard/mergeEntry')
const TRIM_SERIES = Symbol.for('@flowfuse/node-red-dashboard/trimSeries')
const ENTRY_MSG = Symbol.for('@flowfuse/node-red-dashboard/entryMsg')
const NAMESPACE = 'dashboardStore'
const SERIES_METHODS = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin'])
const RETURNS_ARRAY = new Set(['sort', 'reverse', 'fill', 'copyWithin'])

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

function readWrapped (notify, path, clone, seen) {
    return (t, p, r) => {
        const v = Reflect.get(t, p, r)
        const descriptor = typeof p === 'symbol' ? undefined : Object.getOwnPropertyDescriptor(t, p)
        if (!descriptor || (!descriptor.writable && !descriptor.configurable)) {
            return v
        }
        return deepReactive(v, notify, `${path}.${p}`, clone, seen, true)
    }
}

function deleteReported (notify, path) {
    return (t, p) => {
        const existed = p in t
        const ok = delete t[p]
        if (existed) {
            notify(`${path}.${String(p)}`)
        }
        return ok
    }
}

function deepReactive (value, notify, path, clone, seen = new WeakMap(), wrapOnRead = false) {
    if (!isReactable(value)) return value
    if (seen.has(value)) return seen.get(value)
    const traps = {
        set (t, p, v) {
            if (typeof p === 'symbol') return Reflect.set(t, p, v)
            // a push writes the new index then grows length; only a shrink is a change worth reporting
            const shrank = p === 'length' && Array.isArray(t) && v < t.length
            t[p] = wrapOnRead ? clone(v) : deepReactive(clone(v), notify, `${path}.${String(p)}`, clone)
            if (p !== 'length') notify(`${path}.${String(p)}`)
            else if (shrank) notify(path)
            return true
        },
        deleteProperty: deleteReported(notify, path)
    }
    if (wrapOnRead) {
        traps.get = readWrapped(notify, path, clone, seen)
    }
    const proxy = new Proxy(value, traps)
    // registered before walking children so a cycle resolves to this proxy instead of recursing
    seen.set(value, proxy)
    if (!wrapOnRead) {
        for (const k of Object.keys(value)) value[k] = deepReactive(value[k], notify, `${path}.${k}`, clone, seen)
    }
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
        const wrapped = wrapOnRead ? wrapSeries(prop, rec, value, notify) : deepReactive(value, notify, prop, cloneValue)
        rec.value = wrapped
        rec.plainPoints = wrapOnRead ? value : undefined
        rec.msg = Object.freeze({ payload: wrapped })
        rec.timestamp = now()
        return rec
    }

    const isIndex = (p) => typeof p === 'string' && /^(0|[1-9]\d*)$/.test(p)

    const wrapSeries = (prop, rec, points, notify) => {
        const isCurrent = () => rec.plainPoints === points
        const deleteOther = deleteReported(notify, prop)
        const readPoint = readWrapped(notify, prop, cloneValue, new WeakMap())
        const proxy = new Proxy(points, {
            get (t, p, r) {
                if (!SERIES_METHODS.has(p)) {
                    return readPoint(t, p, r)
                }
                return (...args) => {
                    if (!isCurrent()) {
                        const result = Array.prototype[p].apply(points, argsWithCopies(p, args))
                        return RETURNS_ARRAY.has(p) ? proxy : result
                    }
                    return runSeriesMethod(prop, rec, p, args)
                }
            },
            set (t, p, v) {
                if (typeof p === 'symbol') return Reflect.set(t, p, v)
                if (!isIndex(p) && p !== 'length') {
                    t[p] = cloneValue(v)
                    notify(`${prop}.${p}`)
                    return true
                }
                const replaced = t[p]
                t[p] = p === 'length' ? v : cloneValue(v)
                if (!isCurrent()) {
                    return true
                }
                if (p === 'length' || !replaceOneMessage(prop, rec, Number(p), replaced)) {
                    syncMessagesToPoints(prop, rec)
                }
                return true
            },
            deleteProperty (t, p) {
                if (!isIndex(p) || !isCurrent()) {
                    return deleteOther(t, p)
                }
                if (p in t) {
                    t.splice(Number(p), 1)
                    syncMessagesToPoints(prop, rec)
                }
                return true
            }
        })
        return proxy
    }

    const argsWithCopies = (name, args) => {
        if (name === 'push' || name === 'unshift') {
            return args.map(cloneValue)
        }
        if (name === 'splice') {
            return [...args.slice(0, 2), ...args.slice(2).map(cloneValue)]
        }
        if (name === 'fill') {
            return [cloneValue(args[0]), ...args.slice(1)]
        }
        return args
    }

    const runSeriesMethod = (prop, rec, name, args) => {
        const points = rec.plainPoints
        const before = name === 'fill' || name === 'copyWithin' ? points.slice() : null
        const result = Array.prototype[name].apply(points, argsWithCopies(name, args))
        if (before) {
            for (let i = 0; i < points.length; i++) {
                if (points[i] !== before[i]) {
                    points[i] = cloneValue(points[i])
                }
            }
        }
        const msgs = messagesAfterEdgeChange(rec, name, args.length, result)
        if (msgs) {
            commitMessages(prop, rec, msgs)
        } else {
            syncMessagesToPoints(prop, rec)
        }
        return RETURNS_ARRAY.has(name) ? rec.value : result
    }

    const isPoint = (p) => p !== undefined && p !== null

    // push, unshift, pop and shift only touch an edge, so the messages there can change without a full rebuild
    const messagesAfterEdgeChange = (rec, name, added, removed) => {
        const msgs = rec.msg
        const points = rec.plainPoints
        const last = msgs[msgs.length - 1]
        if (name === 'push') {
            const pushed = points.slice(points.length - added)
            if (!pushed.every(isPoint) || (last && pointCount(last._datapoint) === 0)) {
                return null
            }
            msgs.push(...pushed.map(storedMessageFor))
            return msgs
        }
        if (name === 'unshift') {
            const unshifted = points.slice(0, added)
            if (!unshifted.every(isPoint)) {
                return null
            }
            msgs.unshift(...unshifted.map(storedMessageFor))
            return msgs
        }
        if (name === 'pop' && last?._datapoint === removed && (msgs.length === 1 || pointCount(msgs[msgs.length - 2]._datapoint) > 0)) {
            msgs.pop()
            return msgs
        }
        if (name === 'shift' && msgs.length > 0 && msgs[0]._datapoint === removed) {
            msgs.shift()
            return msgs
        }
        return null
    }

    const commitMessages = (prop, rec, msgs) => {
        writeValue(prop, rec.plainPoints, true)
        rec.msg = msgs
        emit(prop, rec, prop)
    }

    const removeGaps = (points) => {
        let writeAt = 0
        for (let readAt = 0; readAt < points.length; readAt++) {
            if (isPoint(points[readAt])) {
                points[writeAt++] = points[readAt]
            }
        }
        points.length = writeAt
    }

    const indexMessagesByPoint = (msgs) => {
        const messageOfPoint = new Map()
        const messagesWithoutPointsBefore = new Map()
        let withoutPoints = []
        for (const msg of msgs) {
            const msgPoints = pointsOf(msg._datapoint)
            if (msgPoints.length === 0) {
                withoutPoints.push(msg)
                continue
            }
            messagesWithoutPointsBefore.set(msg, withoutPoints)
            withoutPoints = []
            for (const point of msgPoints) {
                messageOfPoint.set(point, msg)
            }
        }
        return { messageOfPoint, messagesWithoutPointsBefore, trailingWithoutPoints: withoutPoints }
    }

    const storedMessageFor = (point) => {
        const { _datapoint, ...fields } = builtMessage(point)
        return toStoredMessage(cloneValue(fields), point)
    }

    const replaceOneMessage = (prop, rec, i, replaced) => {
        const point = rec.plainPoints[i]
        const owner = rec.msg[i]
        if (!owner || !isPoint(point) || owner._datapoint !== replaced || (i > 0 && pointCount(rec.msg[i - 1]._datapoint) === 0)) {
            return false
        }
        rec.msg[i] = storedMessageFor(point)
        commitMessages(prop, rec, rec.msg)
        return true
    }

    const syncMessagesToPoints = (prop, rec) => {
        const points = rec.plainPoints
        removeGaps(points)
        const { messageOfPoint, messagesWithoutPointsBefore, trailingWithoutPoints } = indexMessagesByPoint(rec.msg)
        const kept = new Set()
        const synced = []
        let i = 0
        while (i < points.length) {
            const msg = messageOfPoint.get(points[i])
            const msgPoints = msg && !kept.has(msg) ? pointsOf(msg._datapoint) : []
            const stillWhole = msgPoints.length > 0 && msgPoints.every((point, k) => points[i + k] === point)
            if (stillWhole) {
                kept.add(msg)
                synced.push(...messagesWithoutPointsBefore.get(msg), msg)
                i += msgPoints.length
            } else {
                synced.push(storedMessageFor(points[i]))
                i++
            }
        }
        synced.push(...trailingWithoutPoints)
        commitMessages(prop, rec, synced)
    }

    const builtMessage = (point) => ({ payload: point?.y, topic: point?.category, _datapoint: point })
    const pointsOf = (d) => (d === undefined || d === null) ? [] : (Array.isArray(d) ? d : [d])
    const pointCount = (d) => (d === undefined || d === null) ? 0 : (Array.isArray(d) ? d.length : 1)

    const messagesWithLivePoints = (rec) => {
        let i = 0
        return Object.freeze(rec.msg.map((m) => {
            const n = pointCount(m._datapoint)
            if (n === 0) {
                return m
            }
            const livePoints = Array.from({ length: n }, () => rec.value[i++])
            return Object.freeze({ ...m, _datapoint: Array.isArray(m._datapoint) ? Object.freeze(livePoints) : livePoints[0] })
        }))
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
        const rec = writeValue(prop, points, true)
        rec.msg = parts.map(({ msg, owned, datapoint, start, end }) => {
            const stored = toStoredDatapoint(points, datapoint, start, end)
            if (stored === undefined && '_datapoint' in msg) owned._datapoint = datapoint
            return toStoredMessage(owned, stored)
        })
        emit(prop, rec, prop)
    }

    records[APPEND_ENTRY] = (prop, msg) => {
        let rec = records[prop]
        const replaced = !!rec && !(Array.isArray(rec.value) && Array.isArray(rec.msg))
        const { _datapoint, ...rest } = msg
        const owned = cloneValue(rest)
        if (!rec || replaced) {
            rec = writeValue(prop, [], true)
            rec.msg = []
        }
        const points = rec.plainPoints
        const start = points.length
        for (const p of pointsOf(_datapoint)) {
            points.push(cloneValue(p))
            rec.timestamp = now()
            emit(prop, rec, `${prop}.${points.length - 1}`)
        }
        const stored = toStoredDatapoint(points, _datapoint, start, points.length)
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
        const points = rec.plainPoints
        const removedMessages = rec.msg.length - msgs.length
        if (msgs.length === 0 || msgs[0] === rec.msg[removedMessages]) {
            let removedPoints = 0
            for (let i = 0; i < removedMessages; i++) {
                removedPoints += pointCount(rec.msg[i]._datapoint)
            }
            points.splice(0, removedPoints)
        } else {
            let readAt = 0
            let writeAt = 0
            let nextKept = 0
            for (const m of rec.msg) {
                const n = pointCount(m._datapoint)
                if (m === msgs[nextKept]) {
                    nextKept++
                    for (let k = 0; k < n; k++) {
                        points[writeAt++] = points[readAt + k]
                    }
                }
                readAt += n
            }
            points.length = writeAt
        }
        writeValue(prop, points, true)
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
                const msg = Array.isArray(rec.msg) ? messagesWithLivePoints(rec) : rec.msg
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

            if (Array.isArray(target[prop]?.msg) && Array.isArray(value)) {
                records[SET_SERIES](prop, value.map(builtMessage))
                return true
            }
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
