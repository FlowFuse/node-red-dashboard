describe('FlowFuse Dashboard - Tables', () => {
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

    it('uses table value for button text', () => {
        // this one will render the 5 buttons text using the key "name" from the payload
        cy.get('#nrdb-ui-widget-dashboard-ui-table-buttons-text-from-payload').find('button').should('have.length', 5)
        cy.get('#nrdb-ui-widget-dashboard-ui-table-buttons-text-from-payload').find('button').eq(0).should('have.text', 'Name 1')
        cy.get('#nrdb-ui-widget-dashboard-ui-table-buttons-text-from-payload').find('button').eq(1).should('have.text', 'Name 2')
        cy.get('#nrdb-ui-widget-dashboard-ui-table-buttons-text-from-payload').find('button').eq(2).should('have.text', 'Name 3')
        cy.get('#nrdb-ui-widget-dashboard-ui-table-buttons-text-from-payload').find('button').eq(3).should('have.text', 'Name 4')
        cy.get('#nrdb-ui-widget-dashboard-ui-table-buttons-text-from-payload').find('button').eq(4).should('have.text', 'Name 5')
    })
    it('uses fixed value for button text', () => {
        // this one uses a `str` value for the button text
        const fixedString = 'Button Text Is String Value'
        cy.get('#nrdb-ui-widget-dashboard-ui-table-table-buttons-string-value').find('button').should('have.length', 5)
        cy.get('#nrdb-ui-widget-dashboard-ui-table-table-buttons-string-value').find('button').eq(0).should('have.text', fixedString)
        cy.get('#nrdb-ui-widget-dashboard-ui-table-table-buttons-string-value').find('button').eq(1).should('have.text', fixedString)
        cy.get('#nrdb-ui-widget-dashboard-ui-table-table-buttons-string-value').find('button').eq(2).should('have.text', fixedString)
        cy.get('#nrdb-ui-widget-dashboard-ui-table-table-buttons-string-value').find('button').eq(3).should('have.text', fixedString)
        cy.get('#nrdb-ui-widget-dashboard-ui-table-table-buttons-string-value').find('button').eq(4).should('have.text', fixedString)
    })
})
