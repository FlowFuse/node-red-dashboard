/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node/-RED Dashboard 2.0 - Number Input Widget', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-number-input')
        cy.visit('/dashboard/page1')
    })

    const numberInputOne = '#nrdb-ui-widget-696f064e3552fe7d input[type="text"]'

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
        // Wait for the output to be updated as the default delay is 300ms
        cy.wait(300)
        cy.checkOutput('msg.payload', 4)
    })

    // Test case: Displays the tooltip correctly
    it('displays the tooltip correctly', () => {
        cy.get('#nrdb-ui-widget-696f064e3552fe7d .nrdb-ui-number-field').trigger('mouseover')
        cy.get('.v-tooltip').should('contain', 'Tooltip Text')
    })

    // Test case: Emits onClear event correctly
    it('reset field on onClear event correctly and outputs the correct payload', () => {
        cy.get(numberInputOne).clear()
        cy.get(numberInputOne).type('2')
        cy.get('#nrdb-ui-widget-696f064e3552fe7d .nrdb-ui-number-field .v-field__clearable').click()
        cy.get(numberInputOne).should('have.value', '')
        cy.checkOutput('msg.payload', null)
        cy.get('#nrdb-ui-widget-696f064e3552fe7d .nrdb-ui-number-field').trigger('blur')
    })
})

describe('Node-RED Dashboard 2.0 - Number Input (Dynamic Properties)', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-number-input')
        cy.visit('/dashboard/page1')
    })

    it('Set the dynnamic properties: set input "icon"', () => {
        cy.get('#nrdb-ui-widget-91363b41f01492e8').should('exist')
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Icon'))
        cy.get('#nrdb-ui-widget-91363b41f01492e8 .v-field__prepend-inner').find('i.mdi-numeric').should('exist')
    })

    it('Set the dynnamic properties: change input "icon" position', () => {
        cy.get('#nrdb-ui-widget-2f5451b0216e7dd4').should('exist')
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Icon Position'))
        cy.get('#nrdb-ui-widget-2f5451b0216e7dd4 .v-field .v-field__append-inner').find('i.mdi-numeric').should('exist')
    })

    it('Set the dynnamic properties: move input "icon" to', () => {
        cy.get('#nrdb-ui-widget-605d4a5fb8802bf4').should('exist')
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Icon Inner Position'))
        cy.get('#nrdb-ui-widget-605d4a5fb8802bf4 .v-input .v-input__prepend').find('i.mdi-numeric').should('exist')
    })
})
