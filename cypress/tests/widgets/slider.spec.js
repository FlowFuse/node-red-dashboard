describe('Node-RED Dashboard 2.0 - Slider', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-slider')
        cy.visit('/dashboard/page1')
    })

    it('is loaded correctly', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').contains('My Slider')
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').find('.v-slider-thumb').should('have.attr', 'aria-valuemin', '20')
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').find('.v-slider-thumb').should('have.attr', 'aria-valuemax', '100')
        // upon first load, the slider should be at its minimum value
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').find('.v-slider-thumb').should('have.attr', 'aria-valuenow', '20')
        // to verify the slider orientation, with the slider being horizontal, the thumb should be on the left side
        // which is denoted by style="--v-slider-thumb-position: 0%""
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').find('.v-slider-thumb').should('have.attr', 'style', '--v-slider-thumb-position: 0%; --v-slider-thumb-size: 20px;')
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
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').find('.v-slider-thumb').should('have.attr', 'aria-valuenow', 60) // halfway between 20 and 100
        cy.checkOutput('msg.payload', 60)
    })
})

describe('Node-RED Dashboard 2.0 - Slider (Dynamic Properties)', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-slider')
        cy.visit('/dashboard/page1')
    })

    it('include "labels"', () => {
        // first set the slider to a known value
        cy.clickAndWait(cy.get('.v-slider__container'))
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').find('.v-slider-thumb').should('have.attr', 'aria-valuenow', 60) // halfway between 20 and 100
        cy.checkOutput('msg.payload', 60)
        // now change the label only
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-dynamic-label'))
        // check the label is updated
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').contains('Dynamic Slider Label')
        // shouldn't have changed the value as we're only setting label
        cy.checkOutput('msg.payload', 60)
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
    it('include "showTextField"', () => {
        // First, check that the text field does not exist
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').within(() => { cy.get('#nrdb-ui-widget-dashboard-ui-slider-text-field').should('not.exist') })
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-dynamic-textfield'))
        // Check if the text field is present when showTextField is true
        cy.get('#nrdb-ui-widget-dashboard-ui-slider').within(() => { cy.get('#nrdb-ui-widget-dashboard-ui-slider-text-field').should('exist') })
    })
})

describe('Node-RED Dashboard 2.0 - Slider (Text Field Input)', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-slider')
        cy.visit('/dashboard/page1')
    })

    it('text field emits a value on blur', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-slider-text-field'), 200)
        // then we can type into the input
        cy.get('#nrdb-ui-widget-dashboard-ui-slider-text-field').type('{selectall}{del}40')
        cy.focused().blur()
        cy.checkOutput('msg.payload', 40)
    })

    it('text field validation for max value', () => {
        // Extract the max value from the slider thumb and store it in a variable
        // eslint-disable-next-line promise/always-return, promise/catch-or-return
        cy.get('#nrdb-ui-widget-dashboard-ui-slider-text-field').invoke('attr', 'max').then((maxValue) => {
            const greaterThanMaxValue = parseInt(maxValue) + 10
            cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-slider-text-field'), 200)
            // then we can type into the input
            cy.get('#nrdb-ui-widget-dashboard-ui-slider-text-field').type(`{selectall}{del}${greaterThanMaxValue}`)
            cy.focused().blur()
            cy.get('#nrdb-ui-widget-dashboard-ui-slider-text-field').should('have.value', maxValue)
        })
    })
    it('text field validation for min value', () => {
        // Extract the min value from the slider thumb and store it in a variable
        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.get('#nrdb-ui-widget-dashboard-ui-slider-text-field').invoke('attr', 'min').then((minValue) => {
            const lessThanMinValue = parseInt(minValue) - 20
            cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-slider-text-field'), 200)
            // then we can type into the input
            cy.get('#nrdb-ui-widget-dashboard-ui-slider-text-field').type(`{selectall}{del}${lessThanMinValue}`)
            cy.focused().blur()
            cy.get('#nrdb-ui-widget-dashboard-ui-slider-text-field').should('have.value', minValue)
        })
    })

    it('text field rounds input to nearest step', () => {
        // eslint-disable-next-line promise/catch-or-return, promise/always-return

        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-dynamic-step'))

        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-slider-text-field'), 200)
        // then we can type into the input
        cy.get('#nrdb-ui-widget-dashboard-ui-slider-text-field').type('{selectall}{del}27')
        cy.focused().blur()
        cy.get('#nrdb-ui-widget-dashboard-ui-slider-text-field').should('have.value', 28)
    })
})
