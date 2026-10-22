describe('Node-RED Dashboard 2.0 - Chart auto-height (#1829)', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-chart-autosize')
        cy.visit('/dashboard/page1')
    })

    it('gives an auto-height chart the default height instead of collapsing to one row', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-auto').children().eq(0).should('have.css', 'grid-row-end', 'span 8')
    })

    it('leaves a fixed-height chart unchanged', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-fixed').children().eq(0).should('have.css', 'grid-row-end', 'span 5')
    })
})
