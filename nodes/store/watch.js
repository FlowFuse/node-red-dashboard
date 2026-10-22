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

module.exports = { isReactable, deepClone, readWrapped, deleteReported, deepReactive, deepFreeze, freezeOwned }
