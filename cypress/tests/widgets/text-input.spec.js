/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node/-RED Dashboard 2.0 - Text Input Widget', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-text-input')
        cy.visit('/dashboard/page1')
    })

    // Test case: Renders the Text Input widget correctly
    it('renders the Text Input widget correctly', () => {
        cy.get('#nrdb-ui-widget-ab3346b81a7cf742 input[type="text"]').should('exist')
    })

    // Test case: Displays the tooltip correctly
    it('displays the tooltip correctly', () => {
        cy.get('#nrdb-ui-widget-ab3346b81a7cf742 .nrdb-ui-text-field').trigger('mouseover')
        cy.get('.v-tooltip').should('contain', 'Tooltip Text')
    })

    // Test case: Emits onClear event correctly
    it('reset field on onClear event correctly and outputs the correct payload', () => {
        cy.get('#nrdb-ui-widget-ab3346b81a7cf742 input[type="text"]').clear()
        cy.get('#nrdb-ui-widget-ab3346b81a7cf742 input[type="text"]').type('New text')
        cy.get('#nrdb-ui-widget-ab3346b81a7cf742 .nrdb-ui-text-field .v-field__clearable').click()
        cy.get('#nrdb-ui-widget-ab3346b81a7cf742 input[type="text"]').should('have.value', '')
        cy.checkOutput('msg.payload', null)
    })
})

describe('Node-RED Dashboard 2.0 - Text Input (Dynamic Properties)', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-text-input')
        cy.visit('/dashboard/page1')
    })

    it('Set the dynamic properties: set input "label"', () => {
        cy.get('#nrdb-ui-widget-8b7d7031372e4275').should('exist')
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Label'))
        cy.get('#nrdb-ui-widget-8b7d7031372e4275 .v-input .v-field .v-field__field').find('.v-field-label').should('exist')
    })

    it('Set the dynamic properties: set input "clearable"', () => {
        cy.get('#nrdb-ui-widget-8b7d7031372e4275').should('exist')
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Clearable'))
        cy.get('#nrdb-ui-widget-8b7d7031372e4275').type('New text')
        cy.get('#nrdb-ui-widget-8b7d7031372e4275 .v-input .v-field .v-field__field').find('.v-field-label').should('exist')
    })
})
