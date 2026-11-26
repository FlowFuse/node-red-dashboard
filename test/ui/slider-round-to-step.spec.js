const assert = require('node:assert/strict')

const { roundToStep } = require('../../ui/src/widgets/ui-slider/round-to-step.js')

describe('ui-slider roundToStep', function () {
    it('keeps 3 on the step grid starting at 1 with a step of 2', function () {
        assert.equal(roundToStep(3, 1, 2), 3)
    })

    it('rounds relative to a negative minimum', function () {
        assert.equal(roundToStep(-2, -3, 2), -1)
    })

    it('rounds relative to a fractional minimum', function () {
        assert.equal(roundToStep(0.75, 0.25, 0.5), 0.75)
    })

    it('rounds relative to zero when the minimum is zero', function () {
        assert.equal(roundToStep(3, 0, 2), 4)
    })
})
