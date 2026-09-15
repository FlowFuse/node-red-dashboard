const should = require('should') // eslint-disable-line no-unused-vars

const { getOrCreateClientId } = require('../../ui/src/util/client-id.js')

function fakeStorage () {
    const map = {}
    return {
        getItem: (k) => (k in map ? map[k] : null),
        setItem: (k, v) => { map[k] = v }
    }
}

describe('getOrCreateClientId', function () {
    it('generates and persists an id on first call', function () {
        const storage = fakeStorage()
        const id = getOrCreateClientId(storage, () => 'fixed-id')
        id.should.equal('fixed-id')
        storage.getItem('nrdb-client-id').should.equal('fixed-id')
    })

    it('returns the same id on subsequent calls', function () {
        const storage = fakeStorage()
        const first = getOrCreateClientId(storage)
        const second = getOrCreateClientId(storage)
        second.should.equal(first)
    })

    it('falls back to a fresh id when storage throws (blocked storage)', function () {
        const blocked = {
            getItem: () => { throw new Error('blocked') },
            setItem: () => { throw new Error('blocked') }
        }
        getOrCreateClientId(blocked, () => 'session-id').should.equal('session-id')
    })
})
