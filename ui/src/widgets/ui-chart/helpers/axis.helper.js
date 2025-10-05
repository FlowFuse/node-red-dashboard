// Round x to a nice number, using factors of 1, 2, 5 or 10
// and determine how many decimal places are needed to show it
const niceNumber = (x) => {
    // find x as a number between 1 and 9.9999 with power of 10 multiplier
    // eg, 68.7 is 6.87 * 10^1 so exp is 1 and f is 6.8
    const exp = Math.floor(Math.log10(x))
    const f = x / Math.pow(10, exp)

    // round f to 1, 2 5 or 10
    let niceFraction
    if (f < 1.5) niceFraction = 1
    else if (f < 3) niceFraction = 2
    else if (f < 7) niceFraction = 5
    else niceFraction = 10
    // and scale it up to the range of the input value so if x were 68.7 this returns 50
    const niceX = niceFraction * Math.pow(10, exp)
    // determine the number of decimal places necessary to represent this
    const decimals = Math.max(0, -exp)
    return [niceX, decimals]
}

const getAxisMinMax = (value) => {
    const min = typeof value?.min === 'number' ? value?.min : 0
    let max = typeof value?.max === 'number' ? value?.max : 1
    // protect against min == max which is the case when only one point has been added
    max = (max === min) ? min + 1 : max

    const range = max - min

    const targetTicks = 6 // assume 6 ticks on y axis (5 divisions)
    const roughStep = range / (targetTicks - 1)

    // round the step size to a nice number and determine how many decimal places
    // are needed to show it
    const [step, decimals] = niceNumber(roughStep)

    // round min down and max up using multiples of step
    const axisMin = Number((Math.floor(min / step) * step).toFixed(decimals))
    const axisMax = Number((Math.ceil(max / step) * step).toFixed(decimals))

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
