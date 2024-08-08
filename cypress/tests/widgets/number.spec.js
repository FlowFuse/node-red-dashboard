describe('Node-RED Dashboard 2.0 - Number Input Widget', () => {
    beforeEach(() => {
        cy.visit('/dashboard/page1')
    })

    // Test case: Renders the Number Input widget correctly
    it('renders the Number Input widget correctly', () => {
        cy.get('.nrdb-ui-number-field input[type="text"]').should('exist')
    })

    // Test case: Updates the value correctly
    it('updates the value correctly', () => {
        cy.get('.nrdb-ui-number-field input[type="text"]').type('42')
        cy.get('.nrdb-ui-number-field input[type="text"]').should('have.value', '42')
    })

    // Test case: Displays the tooltip correctly
    it('displays the tooltip correctly', () => {
        cy.get('.nrdb-ui-number-field').trigger('mouseover')
        cy.get('.v-tooltip').should('contain', 'Expected Tooltip Text')
    })

    // Test case: Disables the Number Input widget when state.enabled is false
    it('disables the Number Input widget when state.enabled is false', () => {
        cy.get('.nrdb-ui-number-field input[type="text"]').should('be.disabled')
    })

    // Test case: Validates the input correctly
    it('validates the input correctly', () => {
        cy.get('.nrdb-ui-number-field input[type="text"]').clear()
        cy.get('.nrdb-ui-number-field input[type="text"]').type('-1')
        cy.get('.nrdb-ui-number-field .v-messages__message').should('contain', 'Validation Error Message')
    })

    // Test case: Emits onClear event correctly
    it('emits onClear event correctly', () => {
        cy.get('.nrdb-ui-number-field .v-input__clearable').click()
        cy.get('@click:clear').should('have.been.called')
    })
})
