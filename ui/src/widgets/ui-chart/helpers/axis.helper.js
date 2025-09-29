const getAxisMinMax = (value) => {
    const min = typeof value?.min === 'number' ? value?.min : 0
    let max = typeof value?.max === 'number' ? value?.max : 1
    // protect against min == max which is the case when only one point has been added
    max = (max == min) ? min+1 : max

    const range = max - min

    const targetTicks = 6
    const roughStep = range / (targetTicks - 1)

    const step = niceNumber(roughStep)
    // number of decimal places necessary to represent step cleanly
    const decimals = Math.max(0, -Math.floor(Math.log10(step)))
    // round min down and max up using multiples of step
    const axisMin = Number((Math.floor(min / step) * step).toFixed(decimals))
    const axisMax = Number((Math.ceil(max / step) * step).toFixed(decimals))

    return {
        min: axisMin,
        max: axisMax
    }
}

// Round x to a nice number, using factors of 1, 2, 5 or 10
const niceNumber = (x) => {
    const exp = Math.floor(Math.log10(x))
    const f = x / Math.pow(10, exp) // fraction in [1, 10)
    let niceFraction
    if (f < 1.5) niceFraction = 1
    else if (f < 3) niceFraction = 2
    else if (f < 7) niceFraction = 5
    else niceFraction = 10
    return niceFraction * Math.pow(10, exp)
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
