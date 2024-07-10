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
        cy.clickAndWait(cy.get('.v-slider__container'))
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').find('.v-slider-thumb').should('have.attr', 'aria-valuenow', 50)
        cy.checkOutput('msg.payload', 50)
    })
})

describe('Node-RED Dashboard 2.0 - Slider (Dynamic Properties)', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-slider')
        cy.visit('/dashboard/page1')
    })

    it('include "labels"', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-dynamic-label'))
        // check the label is updated
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').contains('Dynamic Slider Label')
        // shouldn't have changed hte value as we're only setting label
        cy.checkOutput('msg.payload', 50)
    })

    it('include "min"', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-dynamic-min'))
        // check the min value is updated
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').find('.v-slider-thumb').should('have.attr', 'aria-valuemin', '10')
    })

    it('include "max"', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-dynamic-max'))
        // check the min value is updated
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').find('.v-slider-thumb').should('have.attr', 'aria-valuemax', '50')
    })
})
