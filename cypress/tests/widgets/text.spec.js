describe('Node-RED Dashboard 2.0 - Text', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-text')
        cy.visit('/dashboard/page1')
    })

    it('displays the default label, and no value by default', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-text-left').contains('Label')
        cy.get('#nrdb-ui-widget-dashboard-ui-text-left').should('not.contain', 'injected text')
    })

    it('displays any payloads injected into the node', () => {
        cy.get('button').contains('Inject Text').click()
        cy.get('#nrdb-ui-widget-dashboard-ui-text-left').contains('injected text')
    })

    it('assigns the correct CSS class depending on the layout chosen', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-text-left').children().eq(0).should('have.class', 'nrdb-ui-text--row-left')
        cy.get('#nrdb-ui-widget-dashboard-ui-text-center').children().eq(0).should('have.class', 'nrdb-ui-text--row-center')
    })

    it('sets the correct custom CSS styling if defined', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-text-center').children().eq(0).should('have.css', 'color')
        cy.get('#nrdb-ui-widget-dashboard-ui-text-center').children().eq(0).should('have.css', 'font-size')
        cy.get('#nrdb-ui-widget-dashboard-ui-text-center').children().eq(0).should('have.css', 'line-height')
        cy.get('#nrdb-ui-widget-dashboard-ui-text-center').children().eq(0).should('have.css', 'font-family', 'Courier, monospace')
    })
})
