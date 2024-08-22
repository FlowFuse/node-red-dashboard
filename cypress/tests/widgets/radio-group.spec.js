describe('Node/-RED Dashboard 2.0 - Radio Group Widget', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-radio-group')
        cy.visit('/dashboard/page1')
    })

    // Test case: Renders the Radio Group widget correctly
    it('renders the Radio Group widget correctly', () => {
        cy.get('#nrdb-ui-widget-c39496d2b6c5b35f > .v-input > .v-input__control > .v-selection-control-group').should('exist')
    })

    // Test case: Emits onClear event correctly
    it('reset field on onClear event correctly and outputs the correct payload', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-c39496d2b6c5b35f .v-selection-control:nth-child(1) > .v-label--clickable'))
        cy.get('#nrdb-ui-widget-c39496d2b6c5b35f .v-selection-control:nth-child(1) input[type="radio"]').should('have.value', 'option1')
        cy.checkOutput('msg.payload', 'option1')
    })
})
