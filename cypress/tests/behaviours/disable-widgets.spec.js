describe('Node-RED Dashboard 2.0 - Can enable/disable widgets with msg.enabled for', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-dynamic-enabled')
        cy.visit('/dashboard/page1')
    })

    it('UI Buttons', () => {
        // Emitting strings
        cy.get('button').contains('Send Disabled (ui-button)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-dashboard-ui-button-enabled-test').find('button').should('be.disabled')

        // refresh the page
        cy.reloadDashboard()

        // ensure state is still there and data has persisted
        cy.get('#nrdb-ui-widget-dashboard-ui-button-enabled-test').find('button').should('be.disabled')
    })

    it('UI Switch', () => {
        // Emitting strings
        cy.clickAndWait(cy.get('button').contains('Send Disabled (ui-switch)'))

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-enabled-test').find('.v-input').should('have.class', 'v-input--disabled')

        cy.reloadDashboard()

        // ensure state is still there and data has persisted
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-enabled-test').find('.v-input').should('have.class', 'v-input--disabled')
    })

    it('UI Text Input', () => {
        // Emitting strings
        cy.get('button').contains('Send Disabled (ui-text-input)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-dashboard-ui-text-input-enabled-test').find('.v-input').should('have.class', 'v-input--disabled')

        cy.reloadDashboard()

        // ensure state is still there and data has persisted
        cy.get('#nrdb-ui-widget-dashboard-ui-text-input-enabled-test').find('.v-input').should('have.class', 'v-input--disabled')
    })

    it('UI Slider', () => {
        // Emitting strings
        cy.get('button').contains('Send Disabled (ui-slider)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-dashboard-ui-slider-enabled-test').find('.v-input').should('have.class', 'v-input--disabled')

        cy.reloadDashboard()

        // ensure state is still there and data has persisted
        cy.get('#nrdb-ui-widget-dashboard-ui-slider-enabled-test').find('.v-input').should('have.class', 'v-input--disabled')
    })

    it('UI Dropdown', () => {
        // Emitting strings
        cy.get('button').contains('Send Disabled (ui-dropdown)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-dashboard-ui-dropdown-enabled-test').find('.v-input').should('have.class', 'v-input--disabled')

        cy.reloadDashboard()

        // ensure state is still there and data has persisted
        cy.get('#nrdb-ui-widget-dashboard-ui-dropdown-enabled-test').find('.v-input').should('have.class', 'v-input--disabled')
    })

    it('UI Radio Group', () => {
        // Emitting strings
        cy.get('button').contains('Send Disabled (ui-radio-group)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-dashboard-ui-radio-group-enabled-test').find('.v-input').should('have.class', 'v-input--disabled')

        cy.reloadDashboard()

        // ensure state is still there and data has persisted
        cy.get('#nrdb-ui-widget-dashboard-ui-radio-group-enabled-test').find('.v-input').should('have.class', 'v-input--disabled')
    })
})
