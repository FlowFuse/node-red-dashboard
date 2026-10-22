/* eslint-disable promise/catch-or-return, promise/always-return */

// A UI-scoped ui-template must survive a reconnect. The ui-config is re-sent on every reconnect,
// which re-renders every widget; the template widget used to generate a new component type on each
// render, so Vue destroyed and re-created the user's component (and anything it teleports) every time.

const UI_BASE_ID = 'a70f99dbb76955c9' // ui-base node in the dashboard-text fixture

const UI_SCOPED_TEMPLATE = {
    id: 'dashboard-ui-scoped-template',
    type: 'ui-template',
    z: 'node-red-tab-text',
    name: 'top right status',
    ui: UI_BASE_ID,
    group: '',
    page: '',
    order: 0,
    width: 0,
    height: 0,
    head: '',
    format: `<template>
    <Teleport v-if="mounted" to="#app-bar-actions">
        <span class="nrdb-appbar-probe">probe</span>
    </Teleport>
</template>
<script>
    export default {
        data () { return { mounted: false } },
        mounted () {
            this.mounted = true
            window.__templateMounts = (window.__templateMounts || 0) + 1
        }
    }
</script>`,
    storeOutMessages: true,
    passthru: true,
    resendOnRefresh: true,
    templateScope: 'widget:ui',
    className: '',
    x: 140,
    y: 1440,
    wires: [[]]
}

// the client retries immediately, so the socket.io handshake is failed while "offline"
const network = { offline: false }

function getSocket () {
    return cy.window().then((win) => win.document.getElementById('app').__vue_app__._context.provides.$socket)
}

describe('Node-RED Dashboard 2.0 - Template - UI scope survives a reconnect', () => {
    beforeEach(() => {
        network.offline = false
        const pageErrors = []
        cy.wrap(pageErrors).as('pageErrors')
        cy.on('uncaught:exception', (err) => {
            pageErrors.push(err.message)
            return false
        })
        cy.intercept('**/socket.io/**', (req) => {
            if (network.offline) { req.reply({ forceNetworkError: true }) }
        })
        cy.intercept('**/_setup*', (req) => {
            if (network.offline) { req.reply({ forceNetworkError: true }) }
        })
        cy.deployFixture('dashboard-text', [{ mode: 'append', data: [UI_SCOPED_TEMPLATE] }])
        cy.visit('/dashboard/page1')
        cy.get('.nrdb-appbar-probe').should('exist')
    })

    it('keeps the same component instance when the server restarts', () => {
        cy.window().its('__templateMounts').should('equal', 1)

        getSocket().then((socket) => {
            network.offline = true
            socket.io.engine.close() // server went away
        })
        cy.get('.nrdb-ui-notification .v-overlay__content').should('contain', 'Connection Lost')
        cy.then(() => {
            network.offline = false // server is back: ui-config is re-applied on reconnect
        })
        cy.get('.nrdb-ui-notification .v-overlay__content', { timeout: 30000 }).should('contain', 'Connected')
        cy.get('.nrdb-ui-notification .v-overlay__content', { timeout: 30000 }).should('not.exist')

        // the user's component was patched, not destroyed and re-created
        cy.window().its('__templateMounts').should('equal', 1)
        cy.get('.nrdb-appbar-probe').should('exist')
        cy.get('@pageErrors').should('have.length', 0)
    })
})
