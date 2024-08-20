/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node/-RED Dashboard 2.0 - Number Input Widget', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-number-input')
        cy.visit('/dashboard/page1')
    })

    // Test case: Renders the Number Input widget correctly
    it('renders the Number Input widget correctly', () => {
        cy.get('#nrdb-ui-widget-2f48e919876213cc input[type="text"]').should('exist')
    })

    // Test case: Displays the tooltip correctly
    it('displays the tooltip correctly', () => {
        cy.get('#nrdb-ui-widget-2f48e919876213cc .nrdb-ui-number-field').trigger('mouseover')
        cy.get('.v-tooltip').should('contain', 'Tooltip Text')
    })

    // Test case: Emits onClear event correctly
    it('reset field on onClear event correctly and outputs the correct payload', () => {
        cy.get('#nrdb-ui-widget-2f48e919876213cc input[type="text"]').clear()
        cy.get('#nrdb-ui-widget-2f48e919876213cc input[type="text"]').type('2')
        cy.get('#nrdb-ui-widget-2f48e919876213cc input[type="text"]').trigger('keydown', { key: 'Enter' })
        cy.clickAndWait(cy.get('#nrdb-ui-widget-2f48e919876213cc .nrdb-ui-number-field .v-field__clearable'))
        cy.get('#nrdb-ui-widget-2f48e919876213cc input[type="text"]').should('have.value', '')
        cy.checkOutput('msg.payload', null)
    })
})

describe('Node-RED Dashboard 2.0 - Number Input (Dynamic Properties)', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-number-input')
        cy.visit('/dashboard/page1')
    })

    it('Set the dynamic properties: set input "label"', () => {
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f').should('exist')
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Label'))
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f .v-input .v-field .v-field__field').find('.v-field-label').should('exist')
    })

    it('Set the dynamic properties: set input "clearable"', () => {
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f').should('exist')
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Clearable'))
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f').type('4')
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f .v-input .v-field .v-field__field').find('.v-field-label').should('exist')
    })
})
