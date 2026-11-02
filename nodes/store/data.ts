import { isClientScoped } from '../utils/index.js'

import { APPEND_ENTRY, ENTRY_MSG, MERGE_ENTRY, SET_SERIES, TRIM_SERIES, attachToContext, createDataStore } from './reactive.js'
import type { ContextOptions, DataStore, EntryMessages, StoreGlobalContext } from './reactive.js'
import type { KeepMessages } from './series.js'
import type { DashboardMessage, StoreBaseNode, StoreRuntime, StoreWidgetNode, StoredMessage } from './types.js'

export interface InitOptions extends ContextOptions {
    node?: StoreBaseNode
}

export type MessageFilter = (msg: StoredMessage) => boolean

const config: { RED: StoreRuntime | null } = {
    RED: null
}

let storeOptions: ContextOptions = {}
let fallbackStore: DataStore | null = null
let storeContext: StoreGlobalContext | null = null
let storeBase: StoreBaseNode | undefined
let warned: boolean = false

function runtime (): StoreRuntime {
    if (!config.RED) {
        throw new Error('data store used before setConfig')
    }
    return config.RED
}

function isMessage (value: unknown): value is DashboardMessage {
    return typeof value === 'object' && value !== null
}

function messageOf (error: unknown): unknown {
    return typeof error === 'object' && error !== null ? Reflect.get(error, 'message') : undefined
}

function warnOnce (problem: string): void {
    if (warned || !storeBase) {
        return
    }
    warned = true
    storeBase.warn(`Dashboard data store: ${problem}. Further store failures are not reported until the next full deploy or restart.`)
}

const attachOptions = (): ContextOptions => ({ clone: runtime().util.cloneMessage, ...storeOptions })

function getOrCreateStore (globalContext: StoreGlobalContext): DataStore {
    let unavailable: unknown = null
    const store: DataStore | null = attachToContext(globalContext, { ...attachOptions(), onUnavailable: (error: unknown): void => { unavailable = error } })
    if (!store) {
        throw unavailable || new Error('global context saved a copy of the store rather than the store itself, which happens with context stores that serialise values')
    }
    return store
}

function getStoreOrWarn (action: string, id: string): DataStore | undefined {
    try {
        if (fallbackStore) {
            return fallbackStore
        }
        if (!storeContext) {
            throw new Error('data store used before initStore')
        }
        return getOrCreateStore(storeContext)
    } catch (error) {
        warnOnce(`${action} ${id} failed (${messageOf(error)})`)
    }
}

export function initStore (globalContext: StoreGlobalContext, { node, ...options }: InitOptions = {}): DataStore | null {
    storeOptions = options
    storeContext = globalContext
    storeBase = node
    warned = false
    let store: DataStore | null = null
    try {
        store = attachToContext(globalContext, attachOptions())
    } finally {
        if (store) {
            fallbackStore = null
        } else if (!fallbackStore) {
            fallbackStore = createDataStore(attachOptions())
        }
    }
    return store
}

function latestPerTopic (messages: readonly StoredMessage[], maxPoints: number): StoredMessage[] {
    const counts: Record<PropertyKey, number> = {}
    const kept: StoredMessage[] = []
    for (let index = messages.length - 1; index >= 0; index--) {
        const topic: unknown = messages[index].topic
        const key: PropertyKey = typeof topic === 'symbol' ? topic : String(topic)
        counts[key] = (counts[key] || 0) + 1
        if (counts[key] <= maxPoints) {
            kept.push(messages[index])
        }
    }
    return kept.reverse()
}

function canSaveInStore (base: StoreBaseNode, node: StoreWidgetNode, msg: unknown): boolean {
    // gets a list of node types that allow for client configuration/limits
    const constrained: string[] = base.acceptsClientConfig

    const checks: boolean[] = []

    if (constrained.includes(node.type)) {
        // core check
        if (isClientScoped(msg)) {
            // we are in a node type that allows for definition of specific clients,
            // and a client has been defined
            checks.push(false)
        }
        // plugin checks

        // loop over plugins and check if any have defined a custom isValidConnection function
        // if so, use that to determine if the connection is valid
        for (const plugin of runtime().plugins.getByType('node-red-dashboard-2')) {
            if (plugin.hooks?.onCanSaveInStore) {
                checks.push(plugin.hooks.onCanSaveInStore(msg))
            }
        }
    }

    return checks.length === 0 || !checks.includes(false)
}

export function RED (): StoreRuntime | null {
    return config.RED
}

// given a widget id, return the latest msg received
export function get (id: string): EntryMessages {
    return getStoreOrWarn('reading', id)?.[ENTRY_MSG](id)
}

export function has (id: string): boolean {
    const store: DataStore | undefined = getStoreOrWarn('reading', id)
    return !!store && id in store
}

// map the instance of Node-RED to this module
export function setConfig (storeRuntime: StoreRuntime): void {
    config.RED = storeRuntime
}

// remove data associated to a given widget
export function clear (id: string): void {
    const store: DataStore | undefined = getStoreOrWarn('clearing', id)
    if (store) {
        delete store[id]
    }
}

export function save (base: StoreBaseNode, node: StoreWidgetNode, msg: unknown): void {
    if (Array.isArray(msg)) {
        const messages: unknown[] = msg.filter((item: unknown): boolean => canSaveInStore(base, node, item))
        if (messages.every(isMessage)) {
            getStoreOrWarn('saving', node.id)?.[SET_SERIES](node.id, messages)
        }
    } else if (isMessage(msg) && canSaveInStore(base, node, msg)) {
        const { ui_update: uiUpdate, ...rest } = msg
        getStoreOrWarn('saving', node.id)?.[MERGE_ENTRY](node.id, rest)
    }
}

// given a widget id, and msg, store in an array of history of values
// useful for charting widgets
export function append (base: StoreBaseNode, node: StoreWidgetNode, msg: unknown): void {
    if (isMessage(msg) && canSaveInStore(base, node, msg)) {
        getStoreOrWarn('saving', node.id)?.[APPEND_ENTRY](node.id, msg)
    }
}

// fast filtering of existing array data (skips cloning and save checks for fast data cleanup)
export function filter (base: StoreBaseNode, node: StoreWidgetNode, filterFunction: MessageFilter | undefined): void {
    if (filterFunction) {
        const keep: KeepMessages = (messages: StoredMessage[]): StoredMessage[] => messages.filter(filterFunction)
        getStoreOrWarn('trimming', node.id)?.[TRIM_SERIES](node.id, keep)
    }
}

export function keepLatestPerTopic (base: StoreBaseNode, node: StoreWidgetNode, maxPoints: number): void {
    getStoreOrWarn('trimming', node.id)?.[TRIM_SERIES](node.id, (messages: StoredMessage[]): StoredMessage[] => latestPerTopic(messages, maxPoints))
}
