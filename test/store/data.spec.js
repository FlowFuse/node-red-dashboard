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

describe('store: data reads that avoid cloning', function () {
    const { util } = require('@node-red/util')
    const base = { acceptsClientConfig: [] }
    let clones = 0
    const countingRED = {
        util: { ...util, cloneMessage: (m) => { clones++; return util.cloneMessage(m) } },
        plugins: { getByType: () => [] }
    }
    const pt = (topic, n) => ({ topic, payload: n })
    const topicsAndPayloads = (id) => datastore.get(id).map((m) => `${m.topic}:${m.payload}`)

    beforeEach(function () {
        datastore.setConfig(countingRED)
    })

    afterEach(function () {
        datastore.setConfig(RED)
    })

    describe('has', function () {
        it('is false for a widget with no data', function () {
            datastore.clear('has-1')
            datastore.has('has-1').should.equal(false)
        })

        it('is true once a series exists, even an empty one', function () {
            const node = { id: 'has-2', type: 'ui-chart' }
            datastore.save(base, node, [])
            datastore.has('has-2').should.equal(true)
        })

        it('does not clone', function () {
            const node = { id: 'has-3', type: 'ui-chart' }
            for (let i = 0; i < 10; i++) datastore.append(base, node, pt('a', i))
            clones = 0

            datastore.has('has-3')

            clones.should.equal(0)
        })
    })

    describe('keepLatestPerTopic', function () {
        it('keeps the newest points of each topic, in their original order', function () {
            const node = { id: 'keep-1', type: 'ui-chart' }
            datastore.save(base, node, [])
            for (const [t, n] of [['a', 1], ['b', 1], ['a', 2], ['b', 2], ['a', 3], ['b', 3], ['a', 4]]) datastore.append(base, node, pt(t, n))

            datastore.keepLatestPerTopic(base, node, 2)

            topicsAndPayloads('keep-1').should.eql(['b:2', 'a:3', 'b:3', 'a:4'])
        })

        it('treats messages without a topic as one series', function () {
            const node = { id: 'keep-2', type: 'ui-chart' }
            datastore.save(base, node, [])
            for (let i = 1; i <= 4; i++) datastore.append(base, node, { payload: i })

            datastore.keepLatestPerTopic(base, node, 3)

            datastore.get('keep-2').map((m) => m.payload).should.eql([2, 3, 4])
        })

        it('leaves the series alone when no topic is over the limit', function () {
            const node = { id: 'keep-3', type: 'ui-chart' }
            datastore.save(base, node, [])
            for (let i = 1; i <= 3; i++) datastore.append(base, node, pt('a', i))

            datastore.keepLatestPerTopic(base, node, 3)

            topicsAndPayloads('keep-3').should.eql(['a:1', 'a:2', 'a:3'])
        })

        it('does nothing when the widget holds a single message rather than a series', function () {
            const node = { id: 'keep-4', type: 'ui-text' }
            datastore.save(base, node, { payload: 'x' })

            datastore.keepLatestPerTopic(base, node, 1)

            datastore.get('keep-4').payload.should.equal('x')
        })

        it('does not clone the series', function () {
            const node = { id: 'keep-5', type: 'ui-chart' }
            datastore.save(base, node, [])
            for (let i = 0; i < 50; i++) datastore.append(base, node, pt(i % 2 ? 'a' : 'b', i))
            clones = 0

            datastore.keepLatestPerTopic(base, node, 10)

            clones.should.equal(0)
        })
    })

    it('still returns a copy from get', function () {
        const node = { id: 'copy-1', type: 'ui-chart' }
        datastore.save(base, node, [])
        datastore.append(base, node, pt('a', 1))

        datastore.get('copy-1')[0].payload = 'mutated'

        datastore.get('copy-1')[0].payload.should.equal(1)
    })
})
