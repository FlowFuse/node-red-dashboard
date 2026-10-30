describe('Node-RED Dashboard 2.0 - Group: Dialog "Receive messages while closed"', () => {
    before(() => {
        cy.deployFixture('dashboard-dialog-keep-loaded')
    })

    beforeEach(() => {
        cy.resetContext()
        cy.visit('/dashboard/page1')
        cy.checkOutput('connectTopic', 'change')
    })

    it('loads the dialog\'s widgets while it is closed, hidden from view', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-table-keep').should('exist').and('not.be.visible')
        cy.get('.nrdb-dialog--keep-loaded').should('have.css', 'visibility', 'hidden')
        cy.get('#nrdb-ui-widget-dashboard-ui-table-keep .v-table').invoke('outerWidth').should('be.greaterThan', 300)
        cy.get('#nrdb-ui-widget-dashboard-ui-table-default').should('not.exist')
    })

    it('shows client-scoped data sent while the dialog was closed', () => {
        cy.clickAndWait(cy.get('button').contains('Send Keep'), 500)
        cy.clickAndWait(cy.get('button').contains('Open Keep'), 500)

        cy.get('#nrdb-ui-widget-dashboard-ui-table-keep').should('be.visible')
        cy.get('#nrdb-ui-widget-dashboard-ui-table-keep').find('tbody tr').should('have.length', 3)
    })

    it('renders size-dependent widgets at their open size', () => {
        cy.clickAndWait(cy.get('button').contains('Open Keep'), 500)

        cy.get('#nrdb-ui-widget-dashboard-ui-table-keep .nrdb-table').should('not.have.class', 'nrdb-table--mobile')
        cy.get('#nrdb-ui-widget-dashboard-ui-markdown-keep .mermaid svg').invoke('outerWidth').should('be.greaterThan', 100)
    })

    it('keeps the dialog\'s widgets loaded and hidden after it is closed', () => {
        cy.clickAndWait(cy.get('button').contains('Open Keep'), 500)
        cy.get('#nrdb-ui-widget-dashboard-ui-table-keep').should('be.visible')

        cy.get('body').type('{esc}')

        cy.get('.nrdb-dialog--keep-loaded').should('have.css', 'visibility', 'hidden')
        cy.get('#nrdb-ui-widget-dashboard-ui-table-keep').should('exist').and('not.be.visible')
    })

    it('lets clicks pass through the closed dialog to the page behind it', () => {
        cy.get('.nrdb-dialog--keep-loaded .v-overlay__content').should(($content) => {
            const rect = $content[0].getBoundingClientRect()
            const el = $content[0].ownerDocument.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
            expect(el.closest('.nrdb-dialog--keep-loaded')).to.equal(null)
        })
    })

    it('does not load a dialog without the setting until it is opened', () => {
        cy.clickAndWait(cy.get('button').contains('Send Default'), 500)
        cy.get('#nrdb-ui-widget-dashboard-ui-table-default').should('not.exist')

        cy.clickAndWait(cy.get('button').contains('Open Default'), 500)

        cy.get('#nrdb-ui-widget-dashboard-ui-table-default').should('be.visible')
    })
})
