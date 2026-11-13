import { SeriesEntry, builtMessage, isPoint, preparedSeries } from './series.js'
import type { KeepMessages, PreparedSeries } from './series.js'
import type { ChartMessage, CloneValue, DashboardMessage, HistoryItem, OnChange, StoreEntry, StorePath, StoreProps, StoredMessage } from './types.js'
import { deepClone, deepFreeze, deepReactive, freezeOwned, isReactable } from './utils.js'

export const STORE: unique symbol = Symbol.for('@flowfuse/node-red-dashboard/store')
export const APPEND_ENTRY: unique symbol = Symbol.for('@flowfuse/node-red-dashboard/appendEntry')
export const SET_SERIES: unique symbol = Symbol.for('@flowfuse/node-red-dashboard/setSeries')
export const MERGE_ENTRY: unique symbol = Symbol.for('@flowfuse/node-red-dashboard/mergeEntry')
export const TRIM_SERIES: unique symbol = Symbol.for('@flowfuse/node-red-dashboard/trimSeries')
export const ENTRY_MSG: unique symbol = Symbol.for('@flowfuse/node-red-dashboard/entryMsg')
export const NAMESPACE: string = 'dashboardStore'

export type EntryMessages = Readonly<DashboardMessage> | readonly StoredMessage[] | undefined

interface StoreOperations {
    [STORE]: true
    [ENTRY_MSG]: (key: string) => EntryMessages
    [MERGE_ENTRY]: (key: string, msg: DashboardMessage) => void
    [SET_SERIES]: (key: string, messages: readonly ChartMessage[]) => void
    [APPEND_ENTRY]: (key: string, msg: ChartMessage) => void
    [TRIM_SERIES]: (key: string, keep: KeepMessages) => void
}

interface StoreRecords extends StoreOperations {
    [key: string]: StoreEntry
}

export interface EntryView {
    readonly value: unknown
    readonly msg: EntryMessages
    readonly quality: string
    readonly timestamp: number
    readonly history: readonly HistoryItem[]
}

export interface DataStore extends Readonly<StoreOperations> {
    [key: string]: unknown
    readonly [metaKey: `$${string}`]: EntryView | undefined
}

export interface StoreOptions {
    maxHistory?: number
    onChange?: OnChange
    clone?: CloneValue
    now?: () => number
}

export interface ContextOptions extends StoreOptions {
    namespace?: string
    onUnavailable?: (error: unknown) => void
    onReplaced?: () => void
}

export interface StoreGlobalContext {
    get: (key: string) => unknown
    set: (key: string, value: unknown) => void
}

class Entry {
    value: unknown
    msg: Readonly<DashboardMessage> | undefined
    quality: string
    timestamp: number
    history: HistoryItem[]

    constructor () {
        this.value = undefined
        this.msg = undefined
        this.quality = 'GOOD'
        this.timestamp = 0
        this.history = []
    }
}

export type { Entry }

function storeProxy (records: StoreRecords, handler: ProxyHandler<StoreRecords>): DataStore
function storeProxy (records: StoreRecords, handler: ProxyHandler<StoreRecords>): object {
    return new Proxy(records, handler)
}

export function createDataStore ({ maxHistory = 5, onChange, clone = deepClone, now = Date.now }: StoreOptions = {}): DataStore {
    const cloneValue: CloneValue = <TValue>(value: TValue): TValue => (value && typeof value === 'object') ? clone(value) : value
    const emit: OnChange = (key: string, entry: StoreEntry | undefined, path: StorePath): void => { try { onChange?.(key, entry, path) } catch (error) {} }
    const records: StoreRecords = Object.create(null)

    records[STORE] = true

    const storeProps: StoreProps = { cloneValue, emit, now, entryFor: (key: string): StoreEntry | undefined => records[key] }

    const snapshot = (entry: Entry): void => {
        // snapshotting a whole array on every write (e.g. a table's rows) would blow up memory
        if (Array.isArray(entry.value) || !entry.msg || !('payload' in entry.msg)) {
            return
        }
        entry.history.push(Object.freeze({ value: deepFreeze(cloneValue(entry.value)), timestamp: entry.timestamp }))
        if (entry.history.length > maxHistory) {
            entry.history.shift()
        }
    }

    // returns the record without notifying, so a caller can finish writing it before onChange fires
    const writeValue = (key: string, value: unknown): Entry => {
        const current: StoreEntry | undefined = records[key]
        let entry: Entry
        if (current instanceof SeriesEntry) {
            entry = new Entry()
            entry.history = current.history
            Reflect.set(records, key, entry)
        } else if (current) {
            snapshot(current)
            entry = current
        } else {
            entry = new Entry()
            Reflect.set(records, key, entry)
        }
        const notify = (path: StorePath): void => {
            // a replaced value keeps its proxies alive; they must not report into the record any more
            if (records[key] !== entry || entry.value !== wrapped) {
                return
            }
            entry.timestamp = now()
            emit(key, entry, path)
        }
        const wrapped: unknown = deepReactive(value, notify, key, cloneValue)
        entry.value = wrapped
        entry.msg = Object.freeze({ payload: wrapped })
        entry.timestamp = now()
        return entry
    }

    const seriesAt = (key: string): SeriesEntry => {
        const current: StoreEntry | undefined = records[key]
        if (current instanceof SeriesEntry) {
            return current
        }
        if (current) {
            snapshot(current)
        }
        const entry: SeriesEntry = new SeriesEntry(key, storeProps, current ? current.history : [])
        Reflect.set(records, key, entry)
        return entry
    }

    records[ENTRY_MSG] = (key: string): EntryMessages => {
        const entry: StoreEntry | undefined = records[key]
        if (!entry) {
            return undefined
        }
        return clone(entry.msg)
    }

    records[MERGE_ENTRY] = (key: string, msg: DashboardMessage): void => {
        const current: StoreEntry | undefined = records[key]
        const { payload, ...incoming } = msg
        const previous: Readonly<DashboardMessage> = current instanceof SeriesEntry ? freezeOwned(cloneValue({ ...current.msg })) : current?.msg || {}
        const { payload: storedPayload, ...stored } = previous
        const kept: Entry | undefined = current instanceof Entry && !('payload' in msg) ? current : undefined
        const owned: DashboardMessage = freezeOwned(cloneValue(incoming))
        const value: unknown = kept ? undefined : cloneValue(payload)
        const entry: Entry = kept || writeValue(key, value)
        const fields: DashboardMessage = { ...stored, ...owned }
        const hasPayload: boolean = 'payload' in msg || (kept !== undefined && kept.msg !== undefined && 'payload' in kept.msg)
        entry.msg = Object.freeze(hasPayload ? { ...fields, payload: entry.value } : fields)
        entry.timestamp = now()
        emit(key, entry, key)
    }

    records[SET_SERIES] = (key: string, messages: readonly ChartMessage[]): void => {
        const prepared: PreparedSeries = preparedSeries(messages, cloneValue)
        seriesAt(key).replaceAll(prepared)
    }

    records[APPEND_ENTRY] = (key: string, msg: ChartMessage): void => {
        const { _datapoint, ...rest } = msg
        const owned: ChartMessage = cloneValue(rest)
        const replaced: boolean = key in records && !(records[key] instanceof SeriesEntry)
        const entry: SeriesEntry = seriesAt(key)
        entry.append(owned, _datapoint, '_datapoint' in msg)
        if (replaced) {
            emit(key, entry, key)
        }
    }

    records[TRIM_SERIES] = (key: string, keep: KeepMessages): void => {
        const entry: StoreEntry | undefined = records[key]
        if (entry instanceof SeriesEntry) {
            entry.trim(keep)
        }
    }

    const handler: ProxyHandler<StoreRecords> = {
        get (target: StoreRecords, key: string | symbol, receiver: unknown): unknown {
            if (typeof key === 'symbol') {
                return Reflect.get(target, key, receiver)
            }
            if (key === 'toJSON') {
                return (): Record<string, unknown> => Object.fromEntries(Object.entries(target).map(([name, entry]: [string, StoreEntry]): [string, unknown] => [name, entry.value]))
            }
            if (key.startsWith('$')) {
                const entry: StoreEntry | undefined = target[key.slice(1)]
                if (!entry) {
                    return undefined
                }
                const msg: EntryMessages = entry instanceof SeriesEntry ? entry.linkedMessages() : entry.msg
                const view: EntryView = { value: entry.value, msg, quality: entry.quality, timestamp: entry.timestamp, history: Object.freeze(entry.history.slice()) }
                return Object.freeze(view)
            }
            const entry: StoreEntry | undefined = target[key]
            return entry ? entry.value : undefined
        },
        set (target: StoreRecords, key: string | symbol, value: unknown): boolean {
            if (typeof key === 'symbol') {
                return Reflect.set(target, key, value)
            }
            // returning true rather than false so a strict caller picking a reserved name doesn't throw
            if (key === '__proto__' || key === 'constructor' || key === 'toJSON') {
                return true
            }
            if (key.startsWith('$')) {
                return true // '$' is reserved for the read-only meta view
            }

            if (target[key] instanceof SeriesEntry && Array.isArray(value)) {
                records[SET_SERIES](key, value.filter(isPoint).map(builtMessage))
                return true
            }
            const entry: Entry = writeValue(key, cloneValue(value))
            emit(key, entry, key)
            return true
        },
        ownKeys (target: StoreRecords): (string | symbol)[] { return Reflect.ownKeys(target) },
        deleteProperty (target: StoreRecords, key: string | symbol): boolean {
            if (typeof key === 'symbol') {
                return Reflect.deleteProperty(target, key)
            }
            const entry: StoreEntry | undefined = target[key]
            const existed: boolean = key in target
            const deleted: boolean = Reflect.deleteProperty(target, key)
            if (entry) {
                entry.value = undefined
            }
            if (existed) {
                emit(key, undefined, key)
            }
            return deleted
        }
    }
    return storeProxy(records, handler)
}

function isDataStore (value: unknown): value is DataStore {
    return (typeof value === 'object' || typeof value === 'function') && value !== null && Boolean(Reflect.get(value, STORE))
}

const injected: WeakMap<StoreGlobalContext, DataStore> = new WeakMap()

// Inject the store into global context once. On redeploy the existing store is reused;
// after a restart it starts fresh and plain data a flow put in its place is copied in.
// Returns null when the context store can't hold a live proxy: a cache-off store serves
// only async access so a sync get throws, and a serialising store hands back a copy.
export function attachToContext (globalContext: StoreGlobalContext, options: ContextOptions = {}): DataStore | null {
    const namespace: string = options.namespace || NAMESPACE
    let existing: unknown
    try {
        existing = globalContext.get(namespace)
    } catch (error) {
        options.onUnavailable?.(error)
        return null
    }
    if (isDataStore(existing)) {
        injected.set(globalContext, existing)
        return existing
    }

    const previous: DataStore | undefined = injected.get(globalContext)

    const store: DataStore = createDataStore(options)
    if (previous && isReactable(existing) && !Array.isArray(existing)) {
        for (const [key, value] of Object.entries(existing)) {
            store[key] = value
        }
    }
    globalContext.set(namespace, store)
    if (globalContext.get(namespace) !== store) {
        return null
    }
    if (previous && existing !== previous) {
        options.onReplaced?.()
    }
    injected.set(globalContext, store)
    return store
}
