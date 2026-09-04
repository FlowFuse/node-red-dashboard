const should = require('should') // eslint-disable-line no-unused-vars

const { createClientStore } = require('../../nodes/store/clients.js')

// Controllable timer so grace behavior is deterministic
function fakeTimer () {
    let pending = null
    return {
        setTimeoutFn: (fn) => { pending = fn; return { id: 1 } },
        clearTimeoutFn: () => { pending = null },
        fire: () => { const fn = pending; pending = null; if (fn) { fn() } }
    }
}

function collect (store) {
    const seen = []
    store.events.on('client', (e) => seen.push(e))
    return seen
}

describe('client store', function () {
    it('emits connect on a genuinely new client', function () {
        const store = createClientStore()
        const events = collect(store)
        store.connect('c1', 's1')
        events.should.have.length(1)
        events[0].should.match({ event: 'connected', clientId: 'c1' })
    })

    it('does not emit for a second tab of the same client', function () {
        const store = createClientStore()
        store.connect('c1', 's1')
        const events = collect(store)
        store.connect('c1', 's2') // second tab
        events.should.have.length(0)
    })

    it('does not go gone while one of two sockets is still live', function () {
        const t = fakeTimer()
        const store = createClientStore(t)
        store.connect('c1', 's1')
        store.connect('c1', 's2')
        const events = collect(store)
        store.disconnect('c1', 's1') // s2 still live -> no grace, no gone
        t.fire() // nothing should be pending
        events.should.have.length(0)
    })

    it('emits reconnect (not gone) when it comes back within grace', function () {
        const t = fakeTimer()
        const store = createClientStore(t)
        store.connect('c1', 's1')
        const events = collect(store)
        store.disconnect('c1', 's1') // last socket -> grace pending
        store.connect('c1', 's2') // returns before grace fires
        events.should.matchAny({ event: 'reconnected', clientId: 'c1' })
        events.should.not.matchAny({ event: 'gone' })
    })

    it('emits gone when the grace window elapses', function () {
        const t = fakeTimer()
        const store = createClientStore(t)
        store.connect('c1', 's1')
        const events = collect(store)
        store.disconnect('c1', 's1')
        t.fire() // grace elapses
        events.should.matchAny({ event: 'gone', clientId: 'c1' })
    })

    it('re-emits connect after a client has gone (entry was deleted)', function () {
        const t = fakeTimer()
        const store = createClientStore(t)
        store.connect('c1', 's1')
        store.disconnect('c1', 's1')
        t.fire() // gone -> entry deleted
        const events = collect(store)
        store.connect('c1', 's2') // same clientId, but it's a fresh presence now
        events.should.matchAny({ event: 'connected', clientId: 'c1' })
    })

    it('is silent when a new socket arrives while the old one is still live', function () {
        const store = createClientStore()
        store.connect('c1', 's1')
        const events = collect(store)
        store.connect('c1', 's2') // e.g. reconnect races ahead of the old socket's drop
        events.should.have.length(0) // looks like a second tab; no reconnect/connect
    })

    it('ignores connects/disconnects with no clientId', function () {
        const store = createClientStore()
        const events = collect(store)
        store.connect(undefined, 's1')
        store.disconnect(undefined, 's1')
        events.should.have.length(0)
    })
})
