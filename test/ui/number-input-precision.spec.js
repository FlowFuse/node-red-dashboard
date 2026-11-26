const should = require('should') // eslint-disable-line no-unused-vars

const { stepPrecision } = require('../../ui/src/widgets/ui-number-input/precision.js')

describe('ui-number-input precision', function () {
    const cases = [
        [1e-7, 7],
        [-1.25e-7, 9],
        [0.25, 2],
        [1, 0],
        [0, 0],
        [1e21, 0],
        [1e-100, 100]
    ]

    for (const [step, expected] of cases) {
        it(`uses ${expected} decimal places for ${step}`, function () {
            stepPrecision(step).should.equal(expected)
        })
    }

    it('preserves a small step when formatted with toFixed', function () {
        const step = 1e-7
        step.toFixed(stepPrecision(step)).should.equal('0.0000001')
    })
})
