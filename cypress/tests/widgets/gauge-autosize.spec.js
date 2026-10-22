describe('Node-RED Dashboard 2.0 - Gauge auto-height (#1875)', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-gauge-autosize')
        cy.visit('/dashboard/page1')
    })

    it('gives an auto-height gauge the default height instead of collapsing to one row', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-auto').children().eq(0).should('have.css', 'grid-row-end', 'span 3')
    })

    it('leaves a fixed-height gauge unchanged', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-fixed').children().eq(0).should('have.css', 'grid-row-end', 'span 4')
    })

    it('does not force a default height on an auto half-gauge (fix is scoped to gauge-34)', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-half-auto').children().eq(0).should('not.have.css', 'grid-row-end', 'span 3')
    })
})
