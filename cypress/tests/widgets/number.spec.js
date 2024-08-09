/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node-RED Dashboard 2.0 - Number Input Widget', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-number-input')
        cy.visit('/dashboard/page1')
    })

    const numberInputOne = '.number-input-1 input[type="text"]'

    // Test case: Renders the Number Input widget correctly
    it('renders the Number Input widget correctly', () => {
        cy.get(numberInputOne).should('exist')
    })

    // Test case: Updates the value correctly
    it('updates the value correctly and outputs the correct payload', () => {
        cy.get(numberInputOne).should('exist')
        cy.get(numberInputOne).clear()
        cy.get(numberInputOne).type('4')
        cy.get(numberInputOne).should('have.value', '4')
        cy.checkOutput('msg.payload', 4)
    })

    // Test case: Displays the tooltip correctly
    it('displays the tooltip correctly', () => {
        cy.get('.number-input-1 .nrdb-ui-number-field').trigger('mouseover')
        cy.get('.v-tooltip').should('contain', 'Tooltip Text')
    })

    // Test case: Emits onClear event correctly
    it('reset field on onClear event correctly and outputs the correct payload', () => {
        cy.get(numberInputOne).clear()
        cy.get(numberInputOne).type('2')
        cy.get('.number-input-1 .nrdb-ui-number-field .v-field__clearable').click()
        cy.get(numberInputOne).should('have.value', '')
        cy.checkOutput('msg.payload', null)
        cy.get('.number-input-1 .nrdb-ui-number-field').trigger('blur')
    })
})

describe('Node-RED Dashboard 2.0 - Number Input (Dynamic Properties)', () => {
    const buttonSetIcon = '.set-icon-button button'
    const buttonSetIconPosition = '.set-icon-position button'
    const buttonSetIconOutside = '.set-icon-to-outside button'

    beforeEach(() => {
        cy.deployFixture('dashboard-number-input')
        cy.visit('/dashboard/page1')
    })

    it('Set the dynnamic properties: set input "icon"', () => {
        cy.get(buttonSetIcon).trigger('click')
        cy.wait(100)
        cy.get('.nrdb-ui-number-input.number-input-2 .v-field i.mdi-numeric').should('exist')
    })

    it('Set the dynnamic properties: change input "icon" position', () => {
        cy.get(buttonSetIcon).trigger('click')
        cy.wait(100)
        cy.get(buttonSetIconPosition).trigger('click')
        cy.wait(100)
        cy.get('.nrdb-ui-number-input.number-input-2 .v-field .v-field__append-inner i.mdi-numeric').should('exist')
    })

    it('Set the dynnamic properties: move input "icon" to outside', () => {
        cy.get(buttonSetIcon).trigger('click')
        cy.wait(100)
        cy.get(buttonSetIconPosition).trigger('click')
        cy.wait(100)
        cy.get(buttonSetIconOutside).trigger('click')
        cy.wait(100)
        cy.get('.v-input__prepend').find('i.mdi-numeric').should('exist')
    })
})
