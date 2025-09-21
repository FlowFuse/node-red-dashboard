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
    it('permits users to set default values via msg.payload', () => {
        // check that the form is empty
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-name0"] input[type="text"]').should('have.value', '')
        cy.clickAndWait(cy.get('button').contains('Set Defaults'), 200)
        cy.clickAndWait(cy.get('button').contains('Set Defaults'), 200)
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-name0"] input[type="text"]').should('have.value', 'Overridden Default Name')
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

        cy.clickAndWait(cy.get('button').contains('Override Form Options'), 200)

        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-name"] input[type="text"]').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-multiline"] textarea').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-password"] input[type="password"]').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-email"] input[type="email"]').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-age"] input[type="number"]').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-newsletter"] input[type="checkbox"]').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-notifications"] input[type="checkbox"]').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-dob"] input[type="date"]').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-form-dynamic').find('[data-form="form-row-tob"] input[type="time"]').should('exist')
    })

    const payloadElId = '#nrdb-ui-widget-74cbdedad6183c40'
    const topicElId = '#nrdb-ui-widget-d31f09b33f18c5db'

    it('Delivers topic from msg.topic', () => {
        const formElId = '#nrdb-ui-widget-3cd8df20415c4c04'
        // wait for the input to be actionable
        cy.get(formElId).find('[data-form="form-row-name1"] input[type="text"]').should('not.be.disabled')
        // enter a value into the text input field
        cy.get(formElId).find('[data-form="form-row-name1"] input[type="text"]').clear()
        cy.get(formElId).find('[data-form="form-row-name1"] input[type="text"]').should('have.value', '')
        cy.get(formElId).find('[data-form="form-row-name1"] input[type="text"]').type('payload for msg.topic test')
        // submit the form
        cy.clickAndWait(cy.get(formElId).find('[data-action="form-submit"]'), 200)
        // check the output for the topic
        cy.get(payloadElId).find('.nrdb-ui-text-value').contains('{"name1":"payload for msg.topic test"}')
        cy.get(topicElId).find('.nrdb-ui-text-value').contains('topic from msg.topic')
    })

    it('Delivers topic from flow.f1', () => {
        const formElId = '#nrdb-ui-widget-ddb5a30c677e5e0b'
        // wait for the input to be actionable
        cy.get(formElId).find('[data-form="form-row-name2"] input[type="text"]').should('not.be.disabled')
        // enter a value into the text input field
        cy.get(formElId).find('[data-form="form-row-name2"] input[type="text"]').clear()
        cy.get(formElId).find('[data-form="form-row-name2"] input[type="text"]').should('have.value', '')
        cy.get(formElId).find('[data-form="form-row-name2"] input[type="text"]').should('not.be.disabled')
        cy.get(formElId).find('[data-form="form-row-name2"] input[type="text"]').type('flow.f1 test')
        // submit the form
        cy.clickAndWait(cy.get(formElId).find('[data-action="form-submit"]'), 200)
        // check the output for the topic
        cy.get(payloadElId).find('.nrdb-ui-text-value').contains('{"name2":"flow.f1 test"}')
        cy.get(topicElId).find('.nrdb-ui-text-value').contains('topic from flow.f1')
    })

    it('Delivers topic from global.g1', () => {
        const formElId = '#nrdb-ui-widget-cf0774a3c2e9edd4'
        // wait for the input to be actionable
        cy.get(formElId).find('[data-form="form-row-name3"] input[type="text"]').should('not.be.disabled')
        // enter a value into the text input field
        cy.get(formElId).find('[data-form="form-row-name3"] input[type="text"]').type('global.g1 test')
        // submit the form
        cy.clickAndWait(cy.get(formElId).find('[data-action="form-submit"]'), 200)
        // check the output for the topic
        cy.get(payloadElId).find('.nrdb-ui-text-value').contains('{"name3":"global.g1 test"}')
        cy.get(topicElId).find('.nrdb-ui-text-value').contains('topic from global.g1')
    })
})
