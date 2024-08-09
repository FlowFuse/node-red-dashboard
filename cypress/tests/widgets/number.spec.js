/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node/-RED Dashboard 2.0 - Number Input Widget', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-number-input')
        cy.visit('/dashboard/page1')
    })

    const numberInputOne = '#nrdb-ui-widget-5b751bff9a6c7439 input[type="text"]'

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
        cy.get('#nrdb-ui-widget-5b751bff9a6c7439 .nrdb-ui-number-field').trigger('mouseover')
        cy.get('.v-tooltip').should('contain', 'Tooltip Text')
    })

    // Test case: Emits onClear event correctly
    it('reset field on onClear event correctly and outputs the correct payload', () => {
        cy.get(numberInputOne).clear()
        cy.get(numberInputOne).type('2')
        cy.get('#nrdb-ui-widget-5b751bff9a6c7439 .nrdb-ui-number-field .v-field__clearable').click()
        cy.get(numberInputOne).should('have.value', '')
        cy.checkOutput('msg.payload', null)
        cy.get('#nrdb-ui-widget-5b751bff9a6c7439 .nrdb-ui-number-field').trigger('blur')
    })
})

describe('Node-RED Dashboard 2.0 - Number Input (Dynamic Properties)', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-number-input')
        cy.visit('/dashboard/page1')
    })

    it('Set the dynnamic properties: set input "icon"', () => {
        cy.get('#nrdb-ui-widget-3616bf2d05dc6b68').should('exist')
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Icon'))
        cy.get('#nrdb-ui-widget-3616bf2d05dc6b68 .v-field__prepend-inner').find('i.mdi-numeric').should('exist')
    })

    it('Set the dynnamic properties: change input "icon" position', () => {
        cy.get('#nrdb-ui-widget-c7a86c799d34c234').should('exist')
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Icon Position'))
        cy.get('#nrdb-ui-widget-c7a86c799d34c234 .v-field .v-field__append-inner').find('i.mdi-numeric').should('exist')
    })

    it('Set the dynnamic properties: move input "icon" to', () => {
        cy.get('#nrdb-ui-widget-df1f392297c5e2b1').should('exist')
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Icon Inner Position'))
        cy.get('#nrdb-ui-widget-df1f392297c5e2b1 .v-input .v-input__prepend').find('i.mdi-numeric').should('exist')
    })
})
