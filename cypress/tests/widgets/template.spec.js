describe('Node-RED Dashboard 2.0 - Templates', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-templates')
        cy.visit('/dashboard/page1')
    })

    it('passes messages through, when "passthru" is enabled', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-to-enabled'))
        cy.checkOutput('msg.payload', 'payload 1')
    })

    it('does not pass messages through, when "passthru" is disabled', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-to-disabled'))
        cy.checkOutput('msg.payload', 'payload 1')
    })
})
