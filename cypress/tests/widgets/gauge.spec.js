describe('Node-RED Dashboard 2.0 - Gauges', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-gauges')
        cy.visit('/dashboard/page1')
    })

    it('render the correct "type"', () => {
        // Emitting strings
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile').find('.nrdb-ui-gauge-tile').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-dial-half').find('.nrdb-ui-gauge-dial').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-dial-34').find('.nrdb-ui-gauge-dial').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-battery').find('.nrdb-ui-gauge-battery').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tank').find('.nrdb-ui-gauge-tank').should('exist')
    })

    it('renders the configured icon on the tile gauge', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile').find('i.v-icon').should('have.class', 'mdi-home')
    })

    it('applies the configured iconPosition class on the tile gauge', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile')
            .find('.nrdb-ui-gauge-tile')
            .should('have.class', 'nrdb-ui-gauge-tile--icon-top')
    })
})

describe('Node-RED Dashboard 2.0 - Gauges (Dynamic Properties)', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-gauges')
        cy.visit('/dashboard/page1')
    })

    it('updates the tile gauge "icon" via msg.ui_update', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile').find('i.v-icon').should('have.class', 'mdi-home')
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile-update-icon'))
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile').find('i.v-icon').should('have.class', 'mdi-earth')
    })

    it('updates the tile gauge "iconPosition" via msg.ui_update', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile')
            .find('.nrdb-ui-gauge-tile')
            .should('have.class', 'nrdb-ui-gauge-tile--icon-top')
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile-update-icon-pos'))
        cy.get('#nrdb-ui-widget-dashboard-ui-gauge-tile')
            .find('.nrdb-ui-gauge-tile')
            .should('have.class', 'nrdb-ui-gauge-tile--icon-left')
    })
})
