const should = require('should') // eslint-disable-line no-unused-vars

const { mergeRows } = require('../../ui/src/widgets/ui-table/helpers/rows.helper.js')

describe('rows.helper', function () {
    describe('mergeRows', function () {
        it('appends all rows when no unique key is set', function () {
            const existing = [{ id: 1, v: 'a' }]
            const incoming = [{ id: 1, v: 'b' }, { id: 2, v: 'c' }]
            mergeRows(existing, incoming).should.eql([{ id: 1, v: 'a' }, { id: 1, v: 'b' }, { id: 2, v: 'c' }])
            mergeRows(existing, incoming, '').should.eql([{ id: 1, v: 'a' }, { id: 1, v: 'b' }, { id: 2, v: 'c' }])
        })

        it('replaces rows with a matching key in place and appends the rest', function () {
            const existing = [{ id: 1, v: 'a' }, { id: 2, v: 'b' }, { id: 3, v: 'c' }]
            const incoming = [{ id: 2, v: 'B' }, { id: 4, v: 'd' }]
            mergeRows(existing, incoming, 'id').should.eql([
                { id: 1, v: 'a' }, { id: 2, v: 'B' }, { id: 3, v: 'c' }, { id: 4, v: 'd' }
            ])
        })

        it('does not modify the existing array', function () {
            const existing = [{ id: 1, v: 'a' }]
            const result = mergeRows(existing, [{ id: 1, v: 'b' }], 'id')
            result.should.not.equal(existing)
            existing.should.eql([{ id: 1, v: 'a' }])
        })

        it('handles a missing existing array', function () {
            mergeRows(undefined, [{ id: 1 }], 'id').should.eql([{ id: 1 }])
            mergeRows(null, [{ id: 1 }]).should.eql([{ id: 1 }])
        })

        it('lets later rows win when the incoming rows share a key', function () {
            const incoming = [{ id: 1, v: 'a' }, { id: 1, v: 'b' }]
            mergeRows([], incoming, 'id').should.eql([{ id: 1, v: 'b' }])
        })

        it('always appends rows without a value for the key', function () {
            const existing = [{ id: 1 }, { name: 'no id' }, { id: null }]
            const incoming = [{ name: 'no id' }, { id: null }, { id: undefined }]
            mergeRows(existing, incoming, 'id').should.eql([
                { id: 1 }, { name: 'no id' }, { id: null }, { name: 'no id' }, { id: null }, { id: undefined }
            ])
        })

        it('matches keys using strict equality', function () {
            mergeRows([{ id: 1, v: 'a' }], [{ id: '1', v: 'b' }], 'id').should.eql([{ id: 1, v: 'a' }, { id: '1', v: 'b' }])
        })

        it('matches falsy key values such as 0 and empty string', function () {
            const existing = [{ id: 0, v: 'a' }, { id: '', v: 'b' }, { id: false, v: 'c' }]
            const incoming = [{ id: 0, v: 'A' }, { id: '', v: 'B' }, { id: false, v: 'C' }]
            mergeRows(existing, incoming, 'id').should.eql(incoming)
        })

        it('ignores non-object rows when matching', function () {
            mergeRows([{ id: 1 }, 'text'], ['text', null], 'id').should.eql([{ id: 1 }, 'text', 'text', null])
        })
    })
})
