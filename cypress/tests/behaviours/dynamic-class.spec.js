describe('FlowFuse Dashboard - Allow for dynamic class assignments through msg.class for', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-dynamic-class')
        cy.visit('/dashboard/page1')
    })

    it('UI Buttons (msg.class)', () => {
        // Emitting strings
        cy.get('button').contains('Send Class (ui-button)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-d506363d3f2c88cd').should('have.class', 'test-class')

        // refresh the page
        cy.reloadDashboard()

        // ensure class is still there and data has persisted
        cy.get('#nrdb-ui-widget-d506363d3f2c88cd').should('have.class', 'test-class')
    })

    it('UI Buttons (msg.ui_update.class)', () => {
        // Emitting strings
        cy.clickAndWait(cy.get('button').contains('Send Class (ui-button) - UI Update'))

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-d506363d3f2c88cd').should('have.class', 'test-class-ui-update')

        // refresh the page
        cy.reloadDashboard()

        // ensure class is still there and data has persisted
        cy.get('#nrdb-ui-widget-d506363d3f2c88cd').should('have.class', 'test-class-ui-update')
    })

    it('UI Switch', () => {
        // Emitting strings
        cy.clickAndWait(cy.get('button').contains('Send Class (ui-switch)'))

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-3e1b4259b0170b6f').should('have.class', 'test-class')

        cy.reloadDashboard()

        // ensure class is still there and data has persisted
        cy.get('#nrdb-ui-widget-3e1b4259b0170b6f').should('have.class', 'test-class')
    })

    it('UI Chart', () => {
        // Emitting strings
        cy.get('button').contains('Send Class (ui-chart)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-0199063df3611ec6').should('have.class', 'test-class')

        cy.reloadDashboard()

        // ensure class is still there and data has persisted
        cy.get('#nrdb-ui-widget-0199063df3611ec6').should('have.class', 'test-class')
    })

    it('UI Text', () => {
        // Emitting strings
        cy.get('button').contains('Send Class (ui-text)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-1ae7b1574d0c8d63').should('have.class', 'test-class')

        cy.reloadDashboard()

        // ensure class is still there and data has persisted
        cy.get('#nrdb-ui-widget-1ae7b1574d0c8d63').should('have.class', 'test-class')
    })

    it('UI Text Input', () => {
        // Emitting strings
        cy.get('button').contains('Send Class (ui-text-input)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-9dc05f63a29525f0').should('have.class', 'test-class')

        cy.reloadDashboard()

        // ensure class is still there and data has persisted
        cy.get('#nrdb-ui-widget-9dc05f63a29525f0').should('have.class', 'test-class')
    })

    it('UI Table', () => {
        // Emitting strings
        cy.get('button').contains('Send Class (ui-table)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-47c8ab23d9b81c61').should('have.class', 'test-class')

        cy.reloadDashboard()

        // ensure class is still there and data has persisted
        cy.get('#nrdb-ui-widget-47c8ab23d9b81c61').should('have.class', 'test-class')
    })

    it('UI Markdown', () => {
        // Emitting strings
        cy.get('button').contains('Send Class (ui-markdown)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-13d50f316ddcd8e1').should('have.class', 'test-class')

        cy.reloadDashboard()

        // ensure class is still there and data has persisted
        cy.get('#nrdb-ui-widget-13d50f316ddcd8e1').should('have.class', 'test-class')
    })

    it('UI Slider', () => {
        // Emitting strings
        cy.get('button').contains('Send Class (ui-slider)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-d73f9684aaa85402').should('have.class', 'test-class')

        cy.reloadDashboard()

        // ensure class is still there and data has persisted
        cy.get('#nrdb-ui-widget-d73f9684aaa85402').should('have.class', 'test-class')
    })

    it('UI Dropdown', () => {
        // Emitting strings
        cy.get('button').contains('Send Class (ui-dropdown)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-be97900acbbd38cd').should('have.class', 'test-class')
    })

    it('UI Radio Group', () => {
        // Emitting strings
        cy.get('button').contains('Send Class (ui-radio-group)').click()

        // check in our Dashboard that the class has been applied
        cy.get('#nrdb-ui-widget-dce954ccc4b2d3df').should('have.class', 'test-class')

        cy.reloadDashboard()

        // ensure class is still there and data has persisted
        cy.get('#nrdb-ui-widget-dce954ccc4b2d3df').should('have.class', 'test-class')
    })
})
