describe('Node-RED Dashboard 2.0 - Spacer', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-spacer')
        cy.visit('/dashboard/page1')
    })

    it('Is rendered', () => {
        // should have one child
        cy.get('#nrdb-ui-widget-dashboard-ui-spacer').children().should('have.length', 1)
        // and that child should be a div
        cy.get('#nrdb-ui-widget-dashboard-ui-spacer').children().eq(0).should('have.prop', 'tagName', 'DIV')

        // inner div should have no content and no children
        cy.get('#nrdb-ui-widget-dashboard-ui-spacer').children().eq(0).should('not.have.text')
        cy.get('#nrdb-ui-widget-dashboard-ui-spacer > div').children().should('not.exist')
    })

    it('Has correct class names and styling', () => {
        // default classes are applied to main widget
        cy.get('#nrdb-ui-widget-dashboard-ui-spacer').should('have.class', 'nrdb-ui-widget')
        cy.get('#nrdb-ui-widget-dashboard-ui-spacer').should('have.class', 'nrdb-ui-spacer')
        // custom classes .class1 and .class2 are applied to main widget div
        cy.get('#nrdb-ui-widget-dashboard-ui-spacer').should('have.class', 'class1')
        cy.get('#nrdb-ui-widget-dashboard-ui-spacer').should('have.class', 'class2')
        // check widget styling
        cy.get('#nrdb-ui-widget-dashboard-ui-spacer').children().eq(0).should('have.css', 'grid-row-end', 'span 3')
        // check inner div classes
        cy.get('#nrdb-ui-widget-dashboard-ui-spacer > div').should('have.class', 'nrdb-spacer')
        cy.get('#nrdb-ui-widget-dashboard-ui-spacer > div').should('have.class', 'v-spacer') // vuetify class
    })
})
