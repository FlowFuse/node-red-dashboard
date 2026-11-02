// Store to manage any dynamic properties set

import { isClientScoped } from '../utils/index.js'

import type { DashboardMessage, StoreBaseNode, StoreRuntime, StoreWidgetNode } from './types.js'

export type WidgetState = Record<string, unknown>

const state: Record<string, WidgetState> = {}
const config: { RED: StoreRuntime | null } = {
    RED: null
}

function runtime (): StoreRuntime {
    if (!config.RED) {
        throw new Error('state store used before setConfig')
    }
    return config.RED
}

function canSaveInStore (base: StoreBaseNode, node: StoreWidgetNode, msg: DashboardMessage | null | undefined): boolean {
    const checks: boolean[] = []

    if (msg) {
        // core check
        if (base.acceptsClientConfig.includes(node.type)) {
            // we are in a node type that allows for definition of specific clients,
            if (isClientScoped(msg)) {
                // and a client has been defined
                checks.push(false)
            } else {
                // whilst this node does allow for constraints, none were defined in this message
                checks.push(true)
            }
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

// given a widget id, return all dynamically set properties
export function getAll (id: string): WidgetState | undefined {
    return state[id]
}

// given a widget id, return a specific dynamically set property
export function getProperty (id: string, property: string): unknown {
    if (Object.prototype.hasOwnProperty.call(state, id)) {
        return state[id][property]
    } else {
        return undefined
    }
}

// map the instance of Node-RED to this module
export function setConfig (storeRuntime: StoreRuntime): void {
    config.RED = storeRuntime
}

export function set (base: StoreBaseNode, node: StoreWidgetNode, msg: DashboardMessage | null | undefined, property: string, value: unknown): void {
    if (canSaveInStore(base, node, msg)) {
        if (!state[node.id]) {
            state[node.id] = {}
        }
        state[node.id][property] = value
    }
}

// remove data associated to a given widget
export function reset (id: string): void {
    delete state[id]
}
