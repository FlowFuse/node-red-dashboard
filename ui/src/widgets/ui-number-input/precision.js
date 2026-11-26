function stepPrecision (step) {
    const [coefficient, exponent = '0'] = step.toString().split('e')
    const fractionDigits = coefficient.split('.')[1]?.length || 0
    // VNumberInput uses toFixed(), which accepts at most 100 digits.
    return Math.min(100, Math.max(0, fractionDigits - Number(exponent)))
}

export { stepPrecision }

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { stepPrecision }
    module.exports.default = module.exports
}
