/**
 * Decides which connection alert (if any) should be on screen, so the logic can be unit tested
 * independently of main.mjs (which is a side-effecting module).
 *
 * The "Connection Lost" alert is persistent (displayTime 0) and cannot be dismissed by the user,
 * so it must be removed by code. Relying only on the socket's 'connect' event is not enough: if a
 * disconnect is processed when the socket is already live again, socket.connect() is a no-op and no
 * further 'connect' event ever arrives, which would leave the alert on screen forever. Every place
 * that learns the connection is up therefore calls sync(true).
 */
function createConnectionAlerts ({ alerts, getDashboard, displayTime }) {
    // tracks only the persistent "Connection Lost" alert; the "Connected" one closes on its own
    let lostShowing = false

    // the dashboard config is read from a vuex getter that throws until the ui-config has arrived
    function dashboardConfig () {
        try {
            return getDashboard()
        } catch (_error) {
            return undefined
        }
    }

    function clear () {
        if (lostShowing) {
            lostShowing = false
            alerts.clear()
        }
    }

    return {
        /** a 'disconnect' event was received */
        onDisconnect () {
            if (dashboardConfig()?.showDisconnectNotification) {
                // record it before emitting: if a subscriber throws, the alert may still be on screen and
                // must stay clearable (an untracked persistent alert could never be removed)
                lostShowing = true
                alerts.emit('Connection Lost', 'Attempting to reconnect to server...', 'red', {
                    displayTime: 0, // displayTime 0 persists notifications until another notification closes it
                    allowDismiss: false,
                    showCountdown: false
                })
            }
        },
        /**
         * a 'connect' event was received
         * @param {boolean} reconnected - false for the very first connection of the session
         */
        onConnect (reconnected) {
            if (reconnected) {
                // only read the config when it is actually needed: on the very first connection of the
                // session the dashboard config has not been received yet
                const dashboard = dashboardConfig()
                if (dashboard?.showReconnectNotification) {
                    // this alert replaces whatever is showing, and closes itself after displayTime
                    lostShowing = false
                    alerts.emit('Connected', 'Connection re-established.', '#1BC318', {
                        displayTime: displayTime(dashboard), // seconds, default: 5
                        allowDismiss: true,
                        showCountdown: true
                    })
                    return
                }
            }
            // nothing to show: make sure no stale "Connection Lost" alert is left behind
            clear()
        },
        /**
         * Reconcile the alert with the actual connection state. Safe to call at any time (on the
         * retry tick, when the window becomes visible, ...); it only ever removes a stale alert.
         * @param {boolean} connected
         */
        sync (connected) {
            if (connected) {
                clear()
            }
        },
        /** exposed for tests */
        hasPersistentAlert () {
            return lostShowing
        }
    }
}

export { createConnectionAlerts }

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createConnectionAlerts }
    module.exports.default = module.exports
}
