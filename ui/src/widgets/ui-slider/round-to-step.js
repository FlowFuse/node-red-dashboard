function roundToStep (value, min, step) {
    const offset = min % step
    return Math.round((value - offset) / step) * step + offset
}

export { roundToStep }

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { roundToStep }
    module.exports.default = module.exports
}
