const subscriptions = []

/**
 * Subscribe to in-app alerts (used by the Baseline layout to drive the inline ui-notification)
 * @param {Function} fcn - called with (title, description, color, options), or with title === null when alerts are cleared
 * @returns {Function} unsubscribe
 */
function subscribe (fcn) {
    subscriptions.push(fcn)
    return function unsubscribe () {
        const index = subscriptions.indexOf(fcn)
        if (index >= 0) {
            subscriptions.splice(index, 1)
        }
    }
}

/**
 * Show a toast notification
 * @param {string} title Short text to summarize category of problem
 * @param {string} description Longer text to describe the specific problem
 * @param {string} color CSS color used for the notification's accent/progress bar
 * @param {Object} options { displayTime (seconds, 0 = persist), allowDismiss, showCountdown }
 */
function emit (title, description, color, options) {
    subscriptions.slice().forEach((fcn) => fcn(title, description, color, options))
}

/**
 * Close any currently displayed alert without showing a new one
 */
function clear () {
    subscriptions.slice().forEach((fcn) => fcn(null))
}

const Alerts = { subscribe, emit, clear }

export default Alerts

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Alerts
    module.exports.default = module.exports
}
