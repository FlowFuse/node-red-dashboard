const should = require('should') // eslint-disable-line no-unused-vars

const statestore = require('../../nodes/store/state.js')

const RED = {
    plugins: {
        getByType: () => []
    }
}

describe('store: state', function () {
    before(function () {
        statestore.setConfig(RED)
    })

    describe('set', function () {
        const base = { acceptsClientConfig: ['ui-text'] }
        const node = { id: 'w1', type: 'ui-text' }

        beforeEach(function () {
            statestore.reset(node.id)
        })

        it('stores a property with no client constraint', function () {
            statestore.set(base, node, { enabled: false }, 'enabled', false)
            statestore.getProperty(node.id, 'enabled').should.equal(false)
        })

        it('stores a property when no msg is given', function () {
            statestore.set(base, node, null, 'enabled', true)
            statestore.getProperty(node.id, 'enabled').should.equal(true)
        })

        it('does not store a socketId-targeted property', function () {
            statestore.set(base, node, { _client: { socketId: 's1' } }, 'enabled', false)
            should(statestore.getAll(node.id)).be.undefined()
        })

        it('does not store a clientId-targeted property', function () {
            statestore.set(base, node, { _client: { clientId: 'c1' } }, 'enabled', false)
            should(statestore.getAll(node.id)).be.undefined()
        })

        it('stores a targeted property for a node type that is not client-constrained', function () {
            statestore.set({ acceptsClientConfig: [] }, node, { _client: { clientId: 'c1' } }, 'enabled', false)
            statestore.getProperty(node.id, 'enabled').should.equal(false)
        })
    })
})
