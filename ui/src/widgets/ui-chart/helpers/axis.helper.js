const getAxisMinMax = (value) => {
    const min = typeof value?.min === 'number' ? value?.min : 0
    const max = typeof value?.max === 'number' ? value?.max : 1

    const range = max - min

    // Determine rounding unit based on magnitude
    const getRoundingUnit = (val) => {
        const absVal = Math.abs(val)
        if (absVal < 0.1) {
            return 0.1
        } else if (absVal < 1) {
            return 1
        } else if (absVal < 100) {
            return 10
        } else if (absVal < 1000) {
            return 100
        } else if (absVal < 10000) {
            return 1000
        } else if (absVal < 100000) {
            return 10000
        } else {
            // For values >= 100000, use powers of 10
            return Math.pow(10, Math.floor(Math.log10(absVal)))
        }
    }

    // Round min down to nearest appropriate unit
    const roundingUnit = getRoundingUnit(range)
    let axisMin = 0
    if (roundingUnit > 0) {
        axisMin = Math.floor(min / roundingUnit) * roundingUnit
    }

    // Round max up to nearest appropriate unit
    let axisMax = 10
    if (roundingUnit > 0) {
        axisMax = Math.ceil(max / roundingUnit) * roundingUnit
    }

    return {
        min: axisMin,
        max: axisMax
    }
}

const getAxisMin = (value) => {
    return getAxisMinMax(value).min
}

const getAxisMax = (value) => {
    return getAxisMinMax(value).max
}

// ES6 export (primary)
export default {
    getAxisMinMax,
    getAxisMin,
    getAxisMax
}

// Named exports
export { getAxisMinMax, getAxisMin, getAxisMax }

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getAxisMinMax,
        getAxisMin,
        getAxisMax
    }
    module.exports.default = module.exports
}
