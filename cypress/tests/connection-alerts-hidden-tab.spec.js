/* eslint-disable promise/catch-or-return, promise/always-return */

// The Dashboard shows its own "Connection Lost" / "Connected" alerts through an inline ui-notification
// (id "ui-inline-alert") in the Baseline layout. These tests drive the socket.io client directly
// (the same way the _debug view's "refresh" does) to exercise disconnect/reconnect.

const UI_BASE_ID = 'a70f99dbb76955c9' // ui-base node in the dashboard-text fixture
const TOAST = '.nrdb-ui-notification'
const CONTENT = TOAST + ' .v-overlay__content' // the snackbar body; the overlay root is a full-viewport fixed element

function getSocket () {
    return cy.window().then((win) => {
        const app = win.document.getElementById('app').__vue_app__
        return app._context.provides.$socket
    })
}

function deployWithBase (overrides) {
    blockNetworkWhileOffline()
    cy.deployFixture('dashboard-text', [{
        mode: 'merge',
        id: UI_BASE_ID,
        data: {
            showDisconnectNotification: true,
            showReconnectNotification: true,
            notificationDisplayTime: 1,
            ...overrides
        }
    }])
    cy.visit('/dashboard/page1')
    cy.get('#nrdb-ui-widget-dashboard-ui-text-left').should('exist')
}

// The client retries immediately after a disconnect, so to observe the "Connection Lost" state
// the socket.io handshake (always long-polling first) is failed while "offline".
const network = { offline: false }

function blockNetworkWhileOffline () {
    // both the socket.io handshake and the retry loop's _setup pre-fetch must fail, the way they do
    // while the server is restarting
    cy.intercept('**/socket.io/**', (req) => {
        if (network.offline) {
            req.reply({ forceNetworkError: true })
        }
    })
    cy.intercept('**/_setup*', (req) => {
        if (network.offline) {
            req.reply({ forceNetworkError: true })
        }
    })
}

function disconnect () {
    getSocket().then((socket) => {
        network.offline = true
        socket.disconnect()
    })
    cy.get(CONTENT).should('be.visible').and('contain', 'Connection Lost')
}

function reconnect () {
    getSocket().then((socket) => {
        network.offline = false
        socket.connect()
    })
}

describe('Node-RED Dashboard 2.0 - Connection alerts - hidden tab', () => {
    beforeEach(() => {
        network.offline = false
    })

    it('closes "Connected" when the countdown elapsed while the tab was hidden', () => {
        deployWithBase()
        disconnect()
        // simulate a background tab: document hidden
        cy.window().then((win) => {
            Object.defineProperty(win.document, 'visibilityState', { configurable: true, get: () => 'hidden' })
            Object.defineProperty(win.document, 'hidden', { configurable: true, get: () => true })
        })
        reconnect()
        cy.get(CONTENT).should('contain', 'Connected')
        // the countdown (1s) runs while hidden: the progress bar starts above 0 and then reaches 0 ...
        cy.get(TOAST + ' .v-progress-linear').should(($bar) => {
            expect(Number($bar.attr('aria-valuenow'))).to.be.greaterThan(0)
        })
        cy.get(TOAST + ' .v-progress-linear').should('have.attr', 'aria-valuenow', '0')
        // ... but the close is deferred, so the toast must still be there well after the display time
        // eslint-disable-next-line cypress/no-unnecessary-waiting -- asserting that nothing happens for a period
        cy.wait(750)
        cy.get(CONTENT).should('exist').and('contain', 'Connected')
        // tab becomes visible again
        cy.window().then((win) => {
            delete win.document.visibilityState
            delete win.document.hidden
            win.document.dispatchEvent(new win.Event('visibilitychange'))
        })
        cy.get(CONTENT).should('not.exist')
    })
})
