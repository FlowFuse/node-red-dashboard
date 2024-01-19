describe('Node-RED Dashboard 2.0 - Templates', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-templates')
        cy.visit('/dashboard/page1')
    })

    it('passes messages through, when "passthru" is enabled', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-button-to-enabled').click()
        cy.checkOutput('msg.payload', 'payload 1')
    })

    it('does not pass messages through, when "passthru" is disabled', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-button-to-disabled').click()
        cy.checkOutput('msg.payload', 'payload 1')
    })
})
