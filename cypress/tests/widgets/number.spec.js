describe('Node-RED Dashboard 2.0 - Number Input Widget', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-number-input')
        cy.visit('/dashboard/page1')
    })

    // Test case: Renders the Number Input widget correctly
    it('renders the Number Input widget correctly', () => {
        cy.get('.nrdb-ui-number-field input[type="text"]').should('exist')
    })

    // Test case: Updates the value correctly
    it('updates the value correctly', () => {
        cy.get('.nrdb-ui-number-field input[type="text"]').clear()
        cy.get('.nrdb-ui-number-field input[type="text"]').type('4')
        cy.get('.nrdb-ui-number-field input[type="text"]').should('have.value', '4')
    })

    // Test case: Displays the tooltip correctly
    it('displays the tooltip correctly', () => {
        cy.get('.nrdb-ui-number-field').trigger('mouseover')
        cy.get('.v-tooltip').should('contain', 'Tooltip Text')
    })

    // Test case: Emits onClear event correctly
    it('reset field on onClear event correctly', () => {
        cy.get('.nrdb-ui-number-field input[type="text"]').clear()
        cy.get('.nrdb-ui-number-field input[type="text"]').type('2')
        cy.get('.nrdb-ui-number-field .v-field__clearable').click()
        cy.get('.nrdb-ui-number-field input[type="text"]').should('have.value', '')
    })
})
