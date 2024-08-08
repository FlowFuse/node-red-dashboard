describe('Node-RED Dashboard 2.0 - Switches', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-switches')
        cy.visit('/dashboard/page1')
    })

    it('shows the correct label', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-bool').find('label').contains('Standard')
    })

    it('can be set to the off state via incoming boolean payload', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-bool-off'))
        // Emitting strings
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-bool').find('.v-input.v-input--horizontal').should('have.class', 'v-switch')
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-bool').find('.v-input.v-input--horizontal').should('not.have.class', 'active')
    })

    it('can be set to the on state via incoming payload & passes the value through', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-bool-on'))
        // Emitting strings
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-bool').find('.v-input.v-input--horizontal').should('have.class', 'v-switch')
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-bool').find('.v-input.v-input--horizontal').should('have.class', 'active')

        // check passthruy worked
        cy.checkOutput('msg.payload', 'on')
    })

    it('does send a msg if the switch in Dashboard is clicked', () => {
        // set to on
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-bool-on'))
        // click the switch directly
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-bool').find('input').click()
        // should now be off
        cy.checkOutput('msg.payload', 'off')
    })

    it('maintains state on page refresh', () => {
        // set to on
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-bool-on'))
        // click the switch directly
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-switch-bool').find('input'))
        // should now be off
        cy.checkOutput('msg.payload', 'off')

        // refresh page
        cy.reload()
        // should still be off
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-bool').find('.v-input.v-input--horizontal').should('have.class', 'v-switch')
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-bool').find('.v-input.v-input--horizontal').should('not.have.class', 'active')
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
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-str-off'))
        // Emitting strings
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-str').find('button').should('have.class', 'text-red')
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-str').find('button').find('i').should('have.class', 'mdi-wifi-off')
    })

    it('can be set to the on state via incoming payload', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-str-on'))
        // Emitting strings
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-str').find('button').should('have.class', 'text-green')
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-str').find('button').find('i').should('have.class', 'mdi-wifi')
    })

    it('does not pass on a value is passthru is set to false', () => {
        cy.resetContext()
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-str-on'))
        cy.checkOutput('msg', undefined)
    })

    it('does send a msg if the switch in Dashboard is clicked', () => {
        // set to on
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-str-on'))
        // click the switch directly
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-switch-str').find('button'))
        // should now be off
        cy.checkOutput('msg.payload', 'off')
    })
})

describe('Node-RED Dashboard 2.0 - Switches in "Show Input" mode', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-switches')
        cy.visit('/dashboard/page1')
    })

    it('can be set to the on state via incoming payload and does not pass on the value', () => {
        cy.resetContext()
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-show-input-on'))

        // Emitting strings
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-show-input').find('.v-input.v-input--horizontal').should('have.class', 'v-switch')
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-show-input').find('.v-input.v-input--horizontal').should('have.class', 'active')

        cy.checkOutput('msg', undefined)
    })

    it('is put into loading state when clicked, and resets to pre-click state on a page refresh', () => {
        // set to off
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-show-input-on'))

        // click the switch directly
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-show-input').find('input').click()

        // put into loading state
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-show-input').find('.v-input.v-input--horizontal').should('have.class', 'v-switch--loading')

        // should now be off
        cy.checkOutput('msg.payload', 'off')

        cy.reload()

        // on refresh, status is reset to pre-click state
        cy.get('#nrdb-ui-widget-dashboard-ui-switch-show-input').find('.v-input.v-input--horizontal').should('have.class', 'active')
    })
})
