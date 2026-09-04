const { EventEmitter } = require('events')

const DEFAULT_GRACE_MS = 20000

/**
 * Tracks client presence across reconnects (socket.id churns every reconnect; clientId is stable).
 * A client may hold several live sockets (one per tab); events fire on its socket count crossing
 * zero, not per socket. Emits { event, clientId, socketId? }:
 *   connected:   count 0 -> 1, no grace pending (new client)
 *   reconnected: count 0 -> 1 during the grace window (returned before being declared gone)
 *   gone:        count -> 0 and the grace window elapses
 * Extra tabs (1 -> 2, 2 -> 1) emit nothing; the client is still present.
 */
function createClientStore ({ graceMs = DEFAULT_GRACE_MS, setTimeoutFn = setTimeout, clearTimeoutFn = clearTimeout } = {}) {
    const clients = {} // clientId -> { sockets: Set<socketId>, graceTO }
    const events = new EventEmitter()
    events.setMaxListeners(0)

    function connect (clientId, socketId) {
        if (!clientId) { return }
        let entry = clients[clientId]
        const returning = !!(entry && entry.graceTO)
        if (!entry) {
            entry = clients[clientId] = { sockets: new Set(), graceTO: null }
        }
        if (entry.graceTO) {
            clearTimeoutFn(entry.graceTO)
            entry.graceTO = null
        }
        const wasEmpty = entry.sockets.size === 0
        entry.sockets.add(socketId)
        if (wasEmpty) {
            events.emit('client', { event: returning ? 'reconnected' : 'connected', clientId, socketId })
        }
    }

    function disconnect (clientId, socketId) {
        if (!clientId) { return }
        const entry = clients[clientId]
        if (!entry) { return }
        entry.sockets.delete(socketId)
        if (entry.sockets.size === 0 && !entry.graceTO) {
            entry.graceTO = setTimeoutFn(() => {
                delete clients[clientId]
                events.emit('client', { event: 'gone', clientId })
            }, graceMs)
        }
    }

    return { connect, disconnect, events }
}

module.exports = { createClientStore }
