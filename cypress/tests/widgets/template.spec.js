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

    it('permits the sending of a full msg object', () => {
        cy.clickAndWait(cy.get('[data-action="ui-button-full-msg"]'))
        cy.checkOutput('msg.payload', 20)
        cy.checkOutput('msg.topic', 'full-msg')
    })

    it('permits the sending a payload value and will auto-wrap into a msg structure', () => {
        cy.clickAndWait(cy.get('[data-action="ui-button-payload-only"]'))
        cy.checkOutput('msg.payload', 30)
    })
})

describe.only('Node-RED Dashboard 2.0 - Templates (Single Page CSS)', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-templates')
    })

    it('loads on the correctly configured page', () => {
        cy.visit('/dashboard/page1')
        cy.get('body').should('have.css', 'background-color', 'rgb(0, 0, 0)')
    })

    it('does not persist in SPA navigation', () => {
        cy.visit('/dashboard/page1')
        cy.get('body').should('have.css', 'background-color', 'rgb(0, 0, 0)')

        cy.clickAndWait(cy.get('[data-nav="dashboard-ui-page-2"]'))
        cy.url().should('include', '/dashboard/page2')
        cy.get('body').should('not.have.css', 'background-color', 'rgb(0, 0, 0)')
    })

    it('does not load the CSS on other pages if we navigate directly', () => {
        cy.visit('/dashboard/page2')
        cy.get('body').should('not.have.css', 'background-color', 'rgb(0, 0, 0)')
    })
})
