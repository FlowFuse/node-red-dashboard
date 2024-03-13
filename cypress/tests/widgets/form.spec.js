describe('Node-RED Dashboard 2.0 - Forms', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-forms')
        cy.visit('/dashboard/page1')
    })

    it('are disabled by default if a field has been marked required', () => {
        cy.get('[data-action="form-submit"]').should('be.disabled')
    })

    it('blurring a required field runs validation', () => {
        cy.contains('Name is required').should('not.exist')
        cy.clickAndWait(cy.get('[data-form="form-row-name"]'), 200)
        cy.get('[data-form="form-row-name"]').find('input[type="text"]').focus()

        // blur the text input
        cy.focused().blur()

        cy.contains('Name is required').should('be.visible')
    })

    it('enables the submit button once required fields are completed', () => {
        cy.contains('Name is required').should('not.exist')

        // need to click first to allow for Vuetify's animation of label
        // cy.get('[data-form="form-row-name"]').click()
        // cy.wait(200)
        cy.clickAndWait(cy.get('[data-form="form-row-name"]'), 200)
        // then we can type into the input
        cy.get('[data-form="form-row-name"]').find('input[type="text"]').type('John Smith', { force: true })
        cy.focused().blur()

        cy.get('[data-action="form-submit"]').should('not.be.disabled')
    })
})
