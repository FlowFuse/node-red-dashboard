import { EventEmitter } from 'events'

const DEFAULT_GRACE_MS: number = 20000

type GraceTimer = ReturnType<typeof setTimeout>

export interface ClientEvent {
    event: 'connected' | 'reconnected' | 'gone'
    clientId: string
    socketId?: string
}

interface ClientEvents {
    client: [ClientEvent]
}

interface ClientEntry {
    sockets: Set<string>
    graceTimer: GraceTimer | null
}

export interface ConnectedClient {
    clientId: string
    socketId: string | undefined
}

export interface ClientStoreOptions {
    graceMs?: number
    setTimeoutFn?: (callback: () => void, ms: number) => GraceTimer
    clearTimeoutFn?: (timer: GraceTimer) => void
}

export interface ClientStore {
    connect: (clientId: string | undefined, socketId: string) => void
    disconnect: (clientId: string | undefined, socketId: string) => void
    dropSocket: (clientId: string | undefined, socketId: string) => void
    list: () => ConnectedClient[]
    events: EventEmitter<ClientEvents>
}

/**
 * Tracks client presence across reconnects (socket.id churns every reconnect; clientId is stable).
 * A client may hold several live sockets (one per tab); events fire on its socket count crossing
 * zero, not per socket. Emits { event, clientId, socketId? }:
 *   connected:   count 0 -> 1, no grace pending (new client)
 *   reconnected: count 0 -> 1 during the grace window (returned before being declared gone)
 *   gone:        count -> 0 and the grace window elapses
 * Extra tabs (1 -> 2, 2 -> 1) emit nothing; the client is still present.
 */
export function createClientStore ({ graceMs = DEFAULT_GRACE_MS, setTimeoutFn = setTimeout, clearTimeoutFn = clearTimeout }: ClientStoreOptions = {}): ClientStore {
    const clients: Record<string, ClientEntry> = {}
    const events: EventEmitter<ClientEvents> = new EventEmitter()
    events.setMaxListeners(0)

    function connect (clientId: string | undefined, socketId: string): void {
        if (!clientId) { return }
        let entry: ClientEntry | undefined = clients[clientId]
        const returning: boolean = !!(entry && entry.graceTimer)
        if (!entry) {
            entry = clients[clientId] = { sockets: new Set(), graceTimer: null }
        }
        if (entry.graceTimer) {
            clearTimeoutFn(entry.graceTimer)
            entry.graceTimer = null
        }
        const wasEmpty: boolean = entry.sockets.size === 0
        entry.sockets.add(socketId)
        if (wasEmpty) {
            events.emit('client', { event: returning ? 'reconnected' : 'connected', clientId, socketId })
        }
    }

    function disconnect (clientId: string | undefined, socketId: string): void {
        if (!clientId) { return }
        const entry: ClientEntry | undefined = clients[clientId]
        if (!entry) { return }
        entry.sockets.delete(socketId)
        if (entry.sockets.size === 0 && !entry.graceTimer) {
            entry.graceTimer = setTimeoutFn((): void => {
                delete clients[clientId]
                events.emit('client', { event: 'gone', clientId })
            }, graceMs)
            if (typeof entry.graceTimer?.unref === 'function') { entry.graceTimer.unref() }
        }
    }

    function dropSocket (clientId: string | undefined, socketId: string): void {
        if (!clientId) { return }
        const entry: ClientEntry | undefined = clients[clientId]
        if (!entry) { return }
        entry.sockets.delete(socketId)
        if (entry.sockets.size === 0) {
            if (entry.graceTimer) { clearTimeoutFn(entry.graceTimer) }
            delete clients[clientId]
        }
    }

    function list (): ConnectedClient[] {
        return Object.entries(clients)
            .filter(([, entry]: [string, ClientEntry]): boolean => entry.sockets.size > 0)
            .map(([clientId, entry]: [string, ClientEntry]): ConnectedClient => ({ clientId, socketId: entry.sockets.values().next().value }))
    }

    return { connect, disconnect, dropSocket, list, events }
}
