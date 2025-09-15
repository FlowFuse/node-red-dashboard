const getAxisMinMax = (value) => {
    const min = value.min
    const max = value.max

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
    const minRoundingUnit = getRoundingUnit(range)
    let axisMin = 0
    if (minRoundingUnit > 0) {
        axisMin = Math.floor(min / minRoundingUnit) * minRoundingUnit
    }

    // Round max up to nearest appropriate unit
    const maxRoundingUnit = getRoundingUnit(range)
    let axisMax = 10
    if (maxRoundingUnit > 0) {
        axisMax = Math.ceil(max / maxRoundingUnit) * maxRoundingUnit
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

// CommonJS export
module.exports = {
    getAxisMinMax,
    getAxisMin,
    getAxisMax
}

// ES6 export for VueJS compatibility
module.exports.default = module.exports
