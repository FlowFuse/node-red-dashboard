describe('FlowFuse Dashboard - Button Groups', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-button-groups')
        cy.visit('/dashboard/page1')
    })

    it('Loads with expected elements', () => {
        // #nrdb-ui-widget-dashboard-ui-button-group-1 is a button group with 4 buttons
        // labelled Option 1, Option 2, Option 3, Option 4
        // with the botton widget having classes class1 and class2
        cy.get('#nrdb-ui-widget-dashboard-ui-button-group-1').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-button-group-1').should('have.class', 'class1') // static class entered in node flow
        cy.get('#nrdb-ui-widget-dashboard-ui-button-group-1').should('have.class', 'class2') // static class entered in node flow
        // should be 4 buttons
        cy.get('#nrdb-ui-widget-dashboard-ui-button-group-1').find('button').should('have.length', 4)
        cy.get('#nrdb-ui-widget-dashboard-ui-button-group-1 button').contains('Option 1')
        cy.get('#nrdb-ui-widget-dashboard-ui-button-group-1 button').contains('Option 2')
        cy.get('#nrdb-ui-widget-dashboard-ui-button-group-1 button').contains('Option 3')
        cy.get('#nrdb-ui-widget-dashboard-ui-button-group-1 button').contains('Option 4')
    })

    it('can be clicked and emit a string value representing the option', () => {
        // Emitting strings
        cy.clickAndWait(cy.get('button').contains('Option 3'))
        cy.checkOutput('msg.topic', 'first-row')
        cy.checkOutput('msg.payload', 'option_3')
    })

    it('can be clicked and emit a numerical value representing the option', () => {
        // Emitting Number
        cy.clickAndWait(cy.get('button').contains('Left'))
        cy.checkOutput('msg.topic', 'second-row')
        cy.checkOutput('msg.payload', 0)
    })

    it('can have a selection made via msg.payload', () => {
        // Emitting Number
        cy.clickAndWait(cy.get('button').contains('Inject Index 1'))
        cy.checkOutput('msg.topic', 'second-row')
        cy.checkOutput('msg.payload', 1)
    })

    it('allows for definition of custom colouring for options', () => {
        // Emitting Number
        cy.clickAndWait(cy.get('#nrdb-ui-widget-ui-button-group-colors button').last())

        cy.get('#nrdb-ui-widget-ui-button-group-colors button').last()
            .should('have.css', 'background-color', 'rgb(217, 255, 209)')
    })
})

describe('FlowFuse Dashboard - Button Groups', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-button-groups')
        cy.visit('/dashboard/page1')
    })

    it('supports "options", "label" and "class" as a dynamic property', () => {
        cy.get('#nrdb-ui-widget-ui-button-group-dynamic').contains('Static 1')
        cy.get('#nrdb-ui-widget-ui-button-group-dynamic').contains('Static 2')
        cy.get('#nrdb-ui-widget-ui-button-group-dynamic').should('not.have.class', 'dynamic-class')
        cy.clickAndWait(cy.get('button').contains('Dynamic Options & Label'))
        cy.get('#nrdb-ui-widget-ui-button-group-dynamic').contains('Dynamic Label')
        cy.get('#nrdb-ui-widget-ui-button-group-dynamic').contains('Dynamic 1')
        cy.get('#nrdb-ui-widget-ui-button-group-dynamic').contains('Dynamic 2')
        cy.get('#nrdb-ui-widget-ui-button-group-dynamic').should('have.class', 'dynamic-class')
    })
})
