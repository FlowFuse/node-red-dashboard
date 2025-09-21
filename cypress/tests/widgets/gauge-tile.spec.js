describe('Node-RED Dashboard 2.0 - Gauges - Tile', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-gauge-tile')
        cy.visit('/dashboard/page1')
    })

    it('render the correct "type"', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile').find('.nrdb-ui-gauge-tile').should('exist')
    })

    it('inject 0 should display Segment 1 (default label, red)', () => {
        cy.clickAndWait(cy.get('button').contains('button0'))
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile > div > label').should('have.text', 'Tile') // tile is the default label
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile > div').should('have.css', 'background-color', 'rgb(255, 0, 0)') // red
    })
    it('inject 5 should still display Segment 1 (default label, red)', () => {
        cy.clickAndWait(cy.get('button').contains('button5'))
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile > div > label').should('have.text', 'Tile') // tile is the default label
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile > div').should('have.css', 'background-color', 'rgb(255, 0, 0)') // red
    })
    it('inject 35 should display Segment 2 (value label, green)', () => {
        cy.clickAndWait(cy.get('button').contains('button35'))
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile > div > label').should('have.text', '35') // 35 is the value label
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile > div').should('have.css', 'background-color', 'rgb(0, 255, 0)') // green
    })
    it('inject 65 should display Segment 3 (fixed label, blue)', () => {
        cy.clickAndWait(cy.get('button').contains('button65'))
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile > div > label').should('have.text', 'sixty+') // sixty+ is the fixed label
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile > div').should('have.css', 'background-color', 'rgb(0, 0, 255)') // blue
    })
    it.skip('inject 85 should display Segment 4 (env label, yellow)', () => {
        // TODO: enable this test once we figure out why node-red-helper doesnt seem to set env var values!
        cy.clickAndWait(cy.get('button').contains('button85'))
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile > div > label').should('have.text', '80-something') // env var value
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile > div').should('have.css', 'background-color', 'rgb(255, 255, 0)') // yellow
    })
    it('inject 100 should display Segment 5 (no label, white)', () => {
        cy.clickAndWait(cy.get('button').contains('button100'))
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile > div > label').should('have.text', '') // no label is displayed
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile > div').should('have.css', 'background-color', 'rgb(255, 255, 255)') // white
    })
})
