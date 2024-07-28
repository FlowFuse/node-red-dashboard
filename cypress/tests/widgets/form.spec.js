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

        cy.get('#nrdb-ui-group-dashboard-ui-group').within(() => {
            cy.get('[data-action="form-submit"]').should('not.be.disabled')
        })
    })
})

describe('Node-RED Dashboard 2.0 - Forms', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-forms')
        cy.visit('/dashboard/page1')
    })

    it('permits users to set default values via msg.payload', () => {
        // check that the form is empty
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-name0"]').find('input[type="text"]').should('have.value', '')
        cy.clickAndWait(cy.get('button').contains('Set Defaults'))
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-name0"]').find('input[type="text"]').should('have.value', 'Overridden Default Name')
    })

    it('can have their content defined by msg.ui_update.options', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-name"]').should('not.exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-multiline"]').should('not.exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-password"]').should('not.exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-email"]').should('not.exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-age"]').should('not.exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-newsletter"]').should('not.exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-notifications"]').should('not.exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-dob"]').should('not.exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-tob"]').should('not.exist')

        cy.clickAndWait(cy.get('button').contains('Override Form Options'))

        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-name"]').find('input[type="text"]').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-multiline"]').find('textarea').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-password"]').find('input[type="password"]').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-email"]').find('input[type="email"]').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-age"]').find('input[type="number"]').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-newsletter"]').find('input[type="checkbox"]').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-notifications"]').find('input[type="checkbox"]').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-dob"]').find('input[type="date"]').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-tob"]').find('input[type="time"]').should('exist')
    })
})
