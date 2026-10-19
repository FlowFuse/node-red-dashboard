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
describe('Node-RED Dashboard 2.0 - Connection alerts', () => {
    beforeEach(() => {
        network.offline = false
        // fail the test on any uncaught render error, which is how the stuck-alert bug shows up
        const pageErrors = []
        cy.wrap(pageErrors).as('pageErrors')
        cy.on('uncaught:exception', (err) => {
            pageErrors.push(err.message)
            return false // keep the app running so we can observe the alert state
        })
    })
    it('shows "Connected" after a reconnect and closes it automatically', () => {
        deployWithBase()
        disconnect()
        reconnect()
        cy.get(CONTENT).should('be.visible').and('contain', 'Connected')
        cy.get(CONTENT).should('not.contain', 'Connection Lost')
        // allowDismiss renders a dismiss button (unlabelled by design for the inline alert)
        cy.get(CONTENT).find('.v-snackbar__actions button').should('exist')
        // displayTime is 1s; Cypress default retry timeout (4s) covers the close + leave transition
        cy.get(CONTENT).should('not.exist')
    })
    it('recovers on its own when the server restarts (the app drives the reconnect)', () => {
        // Closest reproduction of a Node-RED restart: the transport dies without a client-initiated
        // disconnect, and the app's own retry loop (fetch _setup -> socket.connect) has to recover.
        deployWithBase()
        cy.get(CONTENT).should('not.exist')
        getSocket().then((socket) => {
            network.offline = true
            socket.io.engine.close() // server went away
        })
        cy.get(CONTENT).should('be.visible').and('contain', 'Connection Lost')
        // let the retry loop fail a couple of times, as it would while the server is down
        // eslint-disable-next-line cypress/no-unnecessary-waiting -- emulating the restart window
        cy.wait(4000)
        cy.get(CONTENT).should('contain', 'Connection Lost')
        cy.then(() => {
            network.offline = false // server is back
        })
        // the app must reconnect by itself, replace the alert and then clear it
        cy.get(CONTENT, { timeout: 30000 }).should('contain', 'Connected')
        cy.get(CONTENT, { timeout: 30000 }).should('not.exist')
    })
    it('clears a "Connection Lost" alert that outlived the disconnection when the window becomes visible', () => {
        // Reproduces the stuck toast seen after a frozen window resumes: the alert is raised while the
        // socket is already live again, so socket.connect() is a no-op and no further 'connect' event
        // arrives. Only the visibility/retry reconciliation can remove it.
        deployWithBase()
        cy.get(CONTENT).should('not.exist')
        // stall the retry loop's pre-fetch so its own reconciliation cannot clear the alert;
        // this isolates the visibility path (and mimics a request left hanging by a frozen window)
        cy.intercept('**/_setup*', (req) => {
            req.on('response', (res) => res.setDelay(60000))
        }).as('stalledSetup')
        getSocket().then((socket) => {
            expect(socket.connected).to.equal(true)
            // deliver a stale 'disconnect' to the app's own handler without dropping the live socket
            socket.emitReserved('disconnect', 'transport close')
        })
        cy.get(CONTENT).should('be.visible').and('contain', 'Connection Lost')
        // the socket is still live and the retry pre-fetch is stalled, so the alert survives
        // eslint-disable-next-line cypress/no-unnecessary-waiting -- asserting that nothing clears it
        cy.wait(1500)
        cy.get(CONTENT).should('exist').and('contain', 'Connection Lost')
        getSocket().then((socket) => expect(socket.connected).to.equal(true))
        // returning to the window reconciles the alert with the live connection
        cy.window().then((win) => {
            win.document.dispatchEvent(new win.Event('visibilitychange'))
        })
        cy.get(CONTENT).should('not.exist')
    })
    it('clears "Connection Lost" without flashing "Connected" when the reconnect notification is disabled', () => {
        deployWithBase({ showReconnectNotification: false })
        disconnect()
        cy.window().then((win) => {
            // record every text the toast displays from now on
            win.__toastTexts = []
            const observer = new win.MutationObserver(() => {
                const el = win.document.querySelector(CONTENT)
                if (el) { win.__toastTexts.push(el.textContent) }
            })
            observer.observe(win.document.body, { subtree: true, childList: true, characterData: true })
        })
        reconnect()
        cy.get(CONTENT).should('not.exist')
        cy.window().then((win) => {
            expect(win.__toastTexts.join(' ')).to.not.contain('Connected')
        })
    })
})
