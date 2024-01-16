describe('Node-RED Dashboard 2.0 - Slider', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-slider')
        cy.visit('/dashboard/page1')
    })

    it('is labelled correctly', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').contains('My Slider')
    })

    it('allows for value injection on load and does not pass the value is passthru is set to false', () => {
        cy.resetContext()
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').find('.v-slider-thumb').should('have.attr', 'aria-valuenow', 25)
        cy.checkOutput('msg', undefined)
    })

    it('emits a value, and updates, when clicked', () => {
        cy.resetContext()
        cy.get('.v-slider__container').click()
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').find('.v-slider-thumb').should('have.attr', 'aria-valuenow', 50)
        cy.checkOutput('msg.payload', 50)
    })
})
