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

    it.skip('UI Chart', () => {
        // Emitting strings
        cy.get('button').contains('Send Disabled (ui-chart)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-0199063df3611ec6').should('have.class', 'test-class')

        cy.reloadDashboard()

        // ensure state is still there and data has persisted
        cy.get('#nrdb-ui-widget-0199063df3611ec6').should('have.class', 'test-class')
    })

    it.skip('UI Text', () => {
        // Emitting strings
        cy.get('button').contains('Send Disabled (ui-text)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-1ae7b1574d0c8d63').should('have.class', 'test-class')

        cy.reloadDashboard()

        // ensure state is still there and data has persisted
        cy.get('#nrdb-ui-widget-1ae7b1574d0c8d63').should('have.class', 'test-class')
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

    it.skip('UI Table', () => {
        // Emitting strings
        cy.get('button').contains('Send Disabled (ui-table)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-47c8ab23d9b81c61').should('have.class', 'test-class')

        cy.reloadDashboard()

        // ensure state is still there and data has persisted
        cy.get('#nrdb-ui-widget-47c8ab23d9b81c61').should('have.class', 'test-class')
    })

    it.skip('UI Markdown', () => {
        // Emitting strings
        cy.get('button').contains('Send Disabled (ui-markdown)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-13d50f316ddcd8e1').should('have.class', 'test-class')

        cy.reloadDashboard()

        // ensure state is still there and data has persisted
        cy.get('#nrdb-ui-widget-13d50f316ddcd8e1').should('have.class', 'test-class')
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

    it.skip('UI Dropdown', () => {
        // Emitting strings
        cy.get('button').contains('Send Disabled (ui-dropdown)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-be97900acbbd38cd').should('have.class', 'test-class')
    })

    it.skip('UI Radio Group', () => {
        // Emitting strings
        cy.get('button').contains('Send Disabled (ui-radio-group)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-dce954ccc4b2d3df').should('have.class', 'test-class')

        cy.reloadDashboard()

        // ensure state is still there and data has persisted
        cy.get('#nrdb-ui-widget-dce954ccc4b2d3df').should('have.class', 'test-class')
    })
})
