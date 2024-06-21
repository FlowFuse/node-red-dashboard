describe('Node-RED Dashboard 2.0 - Button Groups', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-button-groups')
        cy.visit('/dashboard/page1')
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

describe('Node-RED Dashboard 2.0 - Button Groups', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-button-groups')
        cy.visit('/dashboard/page1')
    })

    it('supports "options" and "label" as a dynamic property', () => {
        // Emitting strings
        cy.get('#nrdb-ui-widget-ui-button-group-dynamic').contains('Static 1')
        cy.get('#nrdb-ui-widget-ui-button-group-dynamic').contains('Static 2')
        cy.clickAndWait(cy.get('button').contains('Dynamic Options & Label'))
        cy.get('#nrdb-ui-widget-ui-button-group-dynamic').contains('Dynamic Label')
        cy.get('#nrdb-ui-widget-ui-button-group-dynamic').contains('Dynamic 1')
        cy.get('#nrdb-ui-widget-ui-button-group-dynamic').contains('Dynamic 2')
    })
})
