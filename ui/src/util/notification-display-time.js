/**
 * Resolve the (re)connect notification display time, in seconds, from the dashboard config.
 * The editor stores the value as a string, and "0" / "" / non-numeric values must not
 * produce a notification that never closes, so anything that is not a positive number
 * falls back to the default.
 * @param {Object} dashboard - the ui-base config as held in the Vuex store
 * @param {number} [fallback=5] - seconds to use when the config is missing or invalid
 * @returns {number}
 */
function notificationDisplayTime (dashboard, fallback = 5) {
    const t = Number(dashboard?.notificationDisplayTime)
    return Number.isFinite(t) && t > 0 ? t : fallback
}

export { notificationDisplayTime }

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { notificationDisplayTime }
    module.exports.default = module.exports
}
