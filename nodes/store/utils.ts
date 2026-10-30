import type { CloneValue, NotifyChange, StorePath } from './types.js'

export type Reactable = Record<PropertyKey, unknown>

// only plain objects and arrays are deep-watched; Buffers, Dates, class instances etc. are opaque leaves
export function isReactable (value: unknown): value is Reactable {
    if (Array.isArray(value)) return true
    if (value === null || typeof value !== 'object') return false
    const prototype: object | null = Object.getPrototypeOf(value)
    return prototype === null || Object.getPrototypeOf(prototype) === null
}

function isObject (value: unknown): value is Readonly<Record<string, unknown>> {
    return value !== null && typeof value === 'object'
}

// reads through proxies (structuredClone rejects them); production injects RED.util.cloneMessage
export function deepClone<TValue> (value: TValue, seen?: WeakMap<object, object>): TValue
export function deepClone (value: unknown, seen: WeakMap<object, object> = new WeakMap()): unknown {
    if (!isObject(value)) return value
    if (Buffer.isBuffer(value)) {
        return Buffer.from(value)
    }
    if (value instanceof Date) {
        return new Date(value)
    }
    if (seen.has(value)) {
        return seen.get(value)
    }
    const copy: object = Array.isArray(value) ? [] : {}
    seen.set(value, copy)
    for (const key of Object.keys(value)) {
        Reflect.set(copy, key, deepClone(value[key], seen))
    }
    return copy
}

export function deepReactive<TValue> (value: TValue, notify: NotifyChange, path: StorePath, clone: CloneValue, seen?: WeakMap<object, object>, wrapOnRead?: boolean): TValue
export function deepReactive (value: unknown, notify: NotifyChange, path: StorePath, clone: CloneValue, seen: WeakMap<object, object> = new WeakMap(), wrapOnRead: boolean = false): unknown {
    if (!isReactable(value)) return value
    if (seen.has(value)) {
        return seen.get(value)
    }
    const traps: ProxyHandler<Reactable> = {
        set (target: Reactable, property: string | symbol, newValue: unknown): boolean {
            if (typeof property === 'symbol') return Reflect.set(target, property, newValue)
            // a push writes the new index then grows length; only a shrink is a change worth reporting
            const shrank: boolean = property === 'length' && Array.isArray(target) && Number(newValue) < target.length
            target[property] = wrapOnRead ? clone(newValue) : deepReactive(clone(newValue), notify, `${path}.${property}`, clone)
            if (property !== 'length') notify(`${path}.${property}`)
            else if (shrank) notify(path)
            return true
        },
        deleteProperty (target: Reactable, property: string | symbol): boolean {
            const existed: boolean = property in target
            const deleted: boolean = Reflect.deleteProperty(target, property)
            if (existed) notify(`${path}.${String(property)}`)
            return deleted
        }
    }
    if (wrapOnRead) {
        traps.get = (target: Reactable, property: string | symbol, receiver: unknown): unknown => {
            const current: unknown = Reflect.get(target, property, receiver)
            const descriptor: PropertyDescriptor | undefined = typeof property === 'symbol' ? undefined : Object.getOwnPropertyDescriptor(target, property)
            if (!descriptor || (!descriptor.writable && !descriptor.configurable)) {
                return current
            }
            return deepReactive(current, notify, `${path}.${String(property)}`, clone, seen, true)
        }
    }
    const proxy: Reactable = new Proxy(value, traps)
    // registered before walking children so a cycle resolves to this proxy instead of recursing
    seen.set(value, proxy)
    if (!wrapOnRead) {
        for (const key of Object.keys(value)) {
            value[key] = deepReactive(value[key], notify, `${path}.${key}`, clone, seen)
        }
    }
    return proxy
}

export function deepFreeze<TValue> (value: TValue): TValue {
    if (!isReactable(value) || Object.isFrozen(value)) return value
    Object.freeze(value)
    for (const key of Object.keys(value)) {
        deepFreeze(value[key])
    }
    return value
}

export function freezeOwned<TOwned extends Record<string, unknown>> (owned: TOwned, except?: string): TOwned {
    for (const key of Object.keys(owned)) {
        if (key === except || key === 'req' || key === 'res') continue
        deepFreeze(owned[key])
    }
    return owned
}
