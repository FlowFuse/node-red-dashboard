describe('Node-RED Dashboard 2.0 - Gauges', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-gauges')
        cy.visit('/dashboard/page1')
    })

    it('render the correct "type"', () => {
        // Emitting strings
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile').find('.nrdb-ui-gauge-tile').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-dial-half').find('.nrdb-ui-gauge-dial').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-dial-34').find('.nrdb-ui-gauge-dial').should('exist')
    })
})
