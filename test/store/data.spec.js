const should = require('should') // eslint-disable-line no-unused-vars

const datastore = require('../../nodes/store/data.js')

const RED = {
    util: {
        cloneMessage: (msg) => (msg === undefined ? undefined : JSON.parse(JSON.stringify(msg)))
    },
    plugins: {
        getByType: () => []
    }
}

describe('store: data', function () {
    before(function () {
        datastore.setConfig(RED)
    })

    describe('save', function () {
        const base = { acceptsClientConfig: ['ui-text'] }
        const node = { id: 'w1', type: 'ui-text' }

        beforeEach(function () {
            datastore.clear(node.id)
        })

        it('stores a msg with no client constraint', function () {
            datastore.save(base, node, { payload: 'everyone' })
            datastore.get(node.id).payload.should.equal('everyone')
        })

        it('does not store a socketId-targeted msg', function () {
            datastore.save(base, node, { payload: 'for A', _client: { socketId: 's1' } })
            should(datastore.get(node.id)).be.undefined()
        })

        it('does not store a clientId-targeted msg', function () {
            datastore.save(base, node, { payload: 'for A', _client: { clientId: 'c1' } })
            should(datastore.get(node.id)).be.undefined()
        })

        it('stores a targeted msg for a node type that is not client-constrained', function () {
            datastore.save({ acceptsClientConfig: [] }, node, { payload: 'for A', _client: { clientId: 'c1' } })
            datastore.get(node.id).payload.should.equal('for A')
        })

        it('filters targeted msgs out of an array', function () {
            datastore.save(base, node, [
                { payload: 'everyone' },
                { payload: 'for A', _client: { clientId: 'c1' } }
            ])
            datastore.get(node.id).should.have.length(1)
            datastore.get(node.id)[0].payload.should.equal('everyone')
        })

        it('does not append a clientId-targeted msg', function () {
            datastore.append(base, node, { payload: 'everyone' })
            datastore.append(base, node, { payload: 'for A', _client: { clientId: 'c1' } })
            datastore.get(node.id).should.have.length(1)
        })
    })
})
