describe('Node-RED Dashboard 2.0 - Forms', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-forms')
        cy.visit('/dashboard/page1')
    })

    it('are disabled by default if a field has been marked required', () => {
        cy.get('[data-action="form-submit"]').should('be.disabled')
    })

    it('blurring a required field runs validation', () => {
        cy.contains('Name: is required').should('not.exist')
        cy.get('[data-form="form-row-name"] input[type="text"]').focus()
        // blur the text input
        cy.get('[data-form="form-row-name"] input[type="text"]').blur()

        cy.contains('Name: is required').should('be.visible')
    })

    it('enables the submit button once required fields are completed', () => {
        cy.contains('Name: is required').should('not.exist')
        cy.get('[data-form="form-row-name"] input[type="text"]').focus()
        cy.get('[data-form="form-row-name"] input[type="text"]').type('John Smith')

        // blur the text input to trigger validation
        cy.get('[data-form="form-row-name"] input[type="text"]').blur()

        cy.get('[data-action="form-submit"]').should('not.be.disabled')
    })
})
