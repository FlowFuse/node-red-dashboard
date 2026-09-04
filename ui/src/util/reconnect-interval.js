function nextReconnectInterval (retryCount, randomFn = Math.random) {
    let base = 2500
    if (retryCount >= 14) {
        base = 30000
    } else if (retryCount >= 4) {
        base = 5000
    }
    const deviation = base * 0.5 * (randomFn() * 2 - 1)
    return Math.round(base + deviation)
}

export { nextReconnectInterval }

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { nextReconnectInterval }
    module.exports.default = module.exports
}
