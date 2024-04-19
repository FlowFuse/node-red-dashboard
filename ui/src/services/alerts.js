const subscriptions = []

export default {
    subscribe: function (fcn) {
        subscriptions.push(fcn)
    },
    /**
     * Show a toast notification
     * @param {string} title Short text to summarize category of problem
     * @param {string} description Longer text to describe the specific problem
     * @param {number} [countdown] How long to show in ms (defaults to 3000ms)
     */
    emit: function (title, description, color, options) {
        // type: 'info' | 'confirmation' | 'warning'
        // countdown: defaults to 3000 if not provided
        for (let fcn = 0; fcn < subscriptions.length; fcn++) {
            subscriptions[fcn](title, description, color, options)
        }
    }
}
