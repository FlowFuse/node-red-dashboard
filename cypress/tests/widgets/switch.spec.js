describe('Node-RED Dashboard 2.0 - Switches', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-switches')
        cy.visit('/dashboard/page1')
    })

    it('shows the correct label', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-bool').find('label').contains('Standard')
    })

    it('can be set to the off state via incoming boolean payload', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-button-bool-off').click()
        // Emitting strings
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-bool').find('.v-input.v-input--horizontal').should('have.class', 'v-switch')
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-bool').find('.v-input.v-input--horizontal').should('not.have.class', 'active')
    })

    it('can be set to the on state via incoming payload & passes the value through', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-button-bool-on').click()
        // Emitting strings
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-bool').find('.v-input.v-input--horizontal').should('have.class', 'v-switch')
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-bool').find('.v-input.v-input--horizontal').should('have.class', 'active')

        // check passthruy worked
        cy.checkOutput('msg.payload', 'on')
    })

    it('does send a msg if the switch in Dashboard is clicked', () => {
        // set to on
        cy.get('#nrdb-ui-widget-dashboard-ui-button-bool-on').click()
        // click the switch directly
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-bool').find('input').click()
        // should now be off
        cy.checkOutput('msg.payload', 'off')
    })
})

describe('Node-RED Dashboard 2.0 - Switches with Icons', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-switches')
        cy.visit('/dashboard/page1')
    })

    it('shows the correct label', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-str').find('label').contains('Custom Icon (string)')
    })

    it('can be set to the off state via incoming configured payload', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-button-str-off').click()
        // Emitting strings
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-str').find('button').should('have.class', 'text-red')
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-str').find('button').find('i').should('have.class', 'mdi-wifi-off')
    })

    it('can be set to the on state via incoming payload', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-button-str-on').click()
        // Emitting strings
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-str').find('button').should('have.class', 'text-green')
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-str').find('button').find('i').should('have.class', 'mdi-wifi')
    })

    it('does not pass on a value is passthru is set to false', () => {
        cy.resetContext()
        cy.get('#nrdb-ui-widget-dashboard-ui-button-str-on').click()
        cy.checkOutput('msg', undefined)
    })

    it('does send a msg if the switch in Dashboard is clicked', () => {
        // set to on
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-str-on'))
        // click the switch directly
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-str').find('button').click()
        // should now be off
        cy.checkOutput('msg.payload', 'off')
    })
})
