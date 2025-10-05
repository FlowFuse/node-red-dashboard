const should = require('should') // eslint-disable-line no-unused-vars

const axisHelper = require('../../ui/src/widgets/ui-chart/helpers/axis.helper.js')

describe('axis.helper', function () {
    describe('getAxisMinMax', function () {
        const testCases = [
            { min: 3.2, max: 3.2, expectedMin: 3.2, expectedMax: 4.2, description: 'min === max' },
            { min: 3.2, max: 7.8, expectedMin: 3, expectedMax: 8, description: 'values < 10' },
            { min: 15.7, max: 23.4, expectedMin: 14, expectedMax: 24, description: 'values 10-99' },
            { min: 47.3, max: 89.1, expectedMin: 40, expectedMax: 90, description: 'values 10-99' },
            { min: 123.5, max: 456.7, expectedMin: 100, expectedMax: 500, description: 'values 100-999' },
            { min: 234.8, max: 567.2, expectedMin: 200, expectedMax: 600, description: 'values 100-999' },
            { min: 1234.5, max: 4567.8, expectedMin: 1000, expectedMax: 5000, description: 'values 1000-9999' },
            { min: 2345.6, max: 5678.9, expectedMin: 2000, expectedMax: 6000, description: 'values 1000-9999' },
            { min: 1234.5, max: 2345.6, expectedMin: 1200, expectedMax: 2400, description: 'values 1000-9999' },
            { min: 567.8, max: 1234.5, expectedMin: 500, expectedMax: 1300, description: 'mixed ranges' },
            { min: 89.1, max: 1234.5, expectedMin: 0, expectedMax: 1400, description: 'mixed ranges' },
            { min: 512.1, max: 526.5, expectedMin: 512, expectedMax: 528, description: 'close values in 100-999 range' },
            { min: 412.1, max: 526.5, expectedMin: 400, expectedMax: 540, description: 'close values in 100-999 range' },
            { min: -183, max: -165, expectedMin: -185, expectedMax: -165, description: 'negative values' },
            { min: -0.3, max: 0, expectedMin: -0.3, expectedMax: 0, description: 'negative small values' },
            { min: 0.000154, max: 0.000195, expectedMin: 0.00015, expectedMax: 0.00020, description: 'very small decimal values' }
        ]

        testCases.forEach((testCase, index) => {
            it(`should handle ${testCase.description} (min: ${testCase.min}, max: ${testCase.max})`, function () {
                const result = axisHelper.getAxisMinMax(testCase)
                result.min.should.equal(testCase.expectedMin)
                result.max.should.equal(testCase.expectedMax)
            })
        })
    })

    describe('getAxisMin', function () {
        it('should return only the min value', function () {
            const result = axisHelper.getAxisMin({ min: 15.7, max: 23.4 })
            result.should.equal(14)
        })
    })

    describe('getAxisMax', function () {
        it('should return only the max value', function () {
            const result = axisHelper.getAxisMax({ min: 15.7, max: 23.4 })
            result.should.equal(24)
        })
    })
})
