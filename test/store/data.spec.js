const { util } = require('@node-red/util')
const should = require('should') // eslint-disable-line no-unused-vars

const datastore = require('../../nodes/store/data.js')

const RED = { util, plugins: { getByType: () => [] } }
datastore.setConfig(RED)

function fakeGlobal () {
    const m = {}
    return { get: (k) => m[k], set: (k, v) => { m[k] = v } }
}

function fakeNode (id, global) {
    return { id, type: 'ui-text', context: () => ({ global }) }
}

const base = { acceptsClientConfig: [] }

describe('store: data.js reactive-store mirror', function () {
    it('mirrors the clean payload into global.dashboard[id], not the whole message', function () {
        const global = fakeGlobal()
        const node = fakeNode('w1', global)
        datastore.save(base, node, { payload: 42, topic: 't', _msgid: 'm', extra: 'x' })

        const store = global.get('dashboard')
        store.w1.should.equal(42)
        // the reactive store holds only the value; the whole message stays in the legacy datastore
        datastore.get('w1').payload.should.equal(42)
        datastore.get('w1').topic.should.equal('t')
    })

    it('keeps the mirrored value in sync on the latest write', function () {
        const global = fakeGlobal()
        const node = fakeNode('w2', global)
        datastore.save(base, node, { payload: 1 })
        datastore.save(base, node, { payload: 2 })
        global.get('dashboard').w2.should.equal(2)
    })

    it('does not mirror a client-scoped message (not stored centrally)', function () {
        const global = fakeGlobal()
        const node = fakeNode('w3', global)
        const scopedBase = { acceptsClientConfig: ['ui-text'] }
        datastore.save(scopedBase, node, { payload: 9, _client: { socketId: 's1' } })
        should(global.get('dashboard')).be.undefined()
    })

    it('does not mirror array (chart-style) saves', function () {
        const global = fakeGlobal()
        const node = fakeNode('w4', global)
        datastore.save(base, node, [{ payload: 1 }, { payload: 2 }])
        should(global.get('dashboard')).be.undefined()
    })

    it('does not throw or mirror when the context store cannot hold the proxy', function () {
        const throwingGlobal = {
            get: () => { throw new Error('File Store cache disabled - only asynchronous access supported') },
            set: () => {}
        }
        const node = fakeNode('w5', throwingGlobal)
        should(() => datastore.save(base, node, { payload: 7 })).not.throw()
        datastore.get('w5').payload.should.equal(7) // legacy datastore still works
    })

    it('clearFromStore removes the widget key so a removed widget leaves no orphan', function () {
        const global = fakeGlobal()
        const node = fakeNode('w6', global)
        datastore.save(base, node, { payload: 5 })
        global.get('dashboard').w6.should.equal(5)

        datastore.clearFromStore(node)
        should(global.get('dashboard').w6).be.undefined()
    })

    it('clearFromStore does not throw when the store is unavailable', function () {
        const throwingGlobal = {
            get: () => { throw new Error('File Store cache disabled - only asynchronous access supported') },
            set: () => {}
        }
        const node = fakeNode('w7', throwingGlobal)
        should(() => datastore.clearFromStore(node)).not.throw()
    })
})
