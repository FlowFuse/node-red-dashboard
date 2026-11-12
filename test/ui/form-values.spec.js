const should = require('should') // eslint-disable-line no-unused-vars

const { toMultiValue, hasValue } = require('../../ui/src/widgets/ui-form/form-values.js')

describe('ui-form values', function () {
    describe('toMultiValue', function () {
        it('returns an empty array for empty values', function () {
            toMultiValue(undefined).should.eql([])
            toMultiValue(null).should.eql([])
            toMultiValue('').should.eql([])
        })

        it('returns arrays untouched', function () {
            const arr = ['a', 'b']
            toMultiValue(arr).should.equal(arr)
            toMultiValue([]).should.eql([])
        })

        it('wraps a single value in an array', function () {
            toMultiValue('a').should.eql(['a'])
            toMultiValue(0).should.eql([0])
            toMultiValue(false).should.eql([false])
        })
    })

    describe('hasValue', function () {
        it('requires at least one selection for multiselect', function () {
            hasValue('multiselect', []).should.be.false()
            hasValue('multiselect', null).should.be.false()
            hasValue('multiselect', undefined).should.be.false()
            hasValue('multiselect', ['a']).should.be.true()
        })

        it('rejects NaN, null and empty string for number', function () {
            hasValue('number', NaN).should.be.false()
            hasValue('number', null).should.be.false()
            hasValue('number', '').should.be.false()
            hasValue('number', 0).should.be.true()
        })

        it('rejects null, undefined and empty string for other types', function () {
            hasValue('text', '').should.be.false()
            hasValue('dropdown', null).should.be.false()
            hasValue('dropdown', undefined).should.be.false()
            hasValue('text', 'x').should.be.true()
            hasValue('dropdown', 0).should.be.true()
        })
    })
})
