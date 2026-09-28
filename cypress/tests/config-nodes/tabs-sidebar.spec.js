function openEditor () {
    cy.loadFlows()
    cy.window().its('RED.nodes').invoke('node', 'dashboard-ui-page-tabs').should('exist')
    // eslint-disable-next-line promise/catch-or-return
    cy.get('body').then(($body) => {
        const notifications = $body.find('button:contains("No, do not enable notifications")')
        return notifications.length ? cy.wrap(notifications).click() : null
    })
}

describe('Node-RED Dashboard 2.0 - Editor: Sidebar tabs', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-layouts')
        openEditor()
        cy.window().its('RED.sidebar').invoke('show', 'dashboard-2.0')
    })

    it('renders page tabs in order, followed by a No tab row holding untabbed groups', () => {
        cy.contains('.nrdb2-sb-pages-list-header .nrdb2-sb-title', /^Layout: Tabs$/).closest('li').within(() => {
            cy.get('.nrdb2-sb-tabs-list-header .nrdb2-sb-title').should((titles) => {
                expect([...titles].map((t) => t.textContent)).to.deep.equal(['Compose', 'Inbox', 'No tab'])
            })
            cy.get('.nrdb2-sb-untabbed-groups .nrdb2-sb-groups-list-header .nrdb2-sb-title').should('have.text', 'Loose')
        })
    })

    it('renders groups directly under pages without page tabs', () => {
        cy.contains('.nrdb2-sb-pages-list-header .nrdb2-sb-title', 'Layout: Tabs (no page tabs)').closest('li').within(() => {
            cy.get('.nrdb2-sb-tabs-list-header').should('not.exist')
            cy.get('.nrdb2-sb-groups-list-header').should('have.length', 4)
        })
        cy.contains('.nrdb2-sb-pages-list-header .nrdb2-sb-title', 'Layout: Grid').closest('li').within(() => {
            cy.get('.nrdb2-sb-tabs-list-header').should('not.exist')
        })
    })
})
