describe('Node-RED Dashboard 2.0 - Tables', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-tables')
        cy.visit('/dashboard/page1')
    })

    it('render the provided data, without limits if no pagination limit is defined', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-table-default').find('tbody tr').should('have.length', 5)
        cy.get('#nrdb-ui-widget-dashboard-ui-table-default').find('tbody .v-selection-control').should('have.length', 0)
        cy.get('#nrdb-ui-widget-dashboard-ui-table-default').find('.v-data-table-footer').should('not.exist')
    })

    it('render the provided data, with a pagination limit if defined', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-table-max-rows').find('tbody tr').should('have.length', 2)
        cy.get('#nrdb-ui-widget-dashboard-ui-table-max-rows').find('tbody .v-selection-control').should('have.length', 0)
        cy.get('#nrdb-ui-widget-dashboard-ui-table-max-rows').get('.v-data-table-footer').should('exist')
    })

    it('emits a row\'s data when clicked, if "selectionType" is "click"', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-table-single-row-click').find('tbody tr').should('have.length', 5)
        cy.get('#nrdb-ui-widget-dashboard-ui-table-single-row-click').find('tbody .v-selection-control').should('have.length', 0)

        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-table-single-row-click').find('tbody tr').eq(1))
        cy.checkOutput('msg.payload.id', 'id2')
        cy.checkOutput('msg.payload.value', 2)
    })

    it('renders each row with a checkbox if "selectionType" is "checkbox"', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-table-multi-select').find('tbody .v-selection-control').should('have.length', 5)
    })

    it('emits a multiple row\'s of data when checked, if "selectionType" is "checkbox"', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-table-multi-select').find('tbody .v-selection-control').eq(3))

        cy.checkOutput('msg.payload[0].value', 4)
    })
})
