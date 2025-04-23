describe('Node-RED Dashboard 2.0 - Markdown', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-markdown')
        cy.visit('/dashboard/page1')
    })

    it('will render static markdown', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-markdown-static').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-markdown-static').find('h1').should('have.text', 'Static Markdown')
    })

    // this markdown node has dynamic markdown, with static mermaid
    it('allow for dynamic markdown content and static mermaid charts', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-markdown-1').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-markdown-1').find('h1').should('have.text', 'Injected Payload Value')

        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-str'))
        cy.get('#nrdb-ui-widget-dashboard-ui-markdown-1').should('contain.text', 'Injected content: Hello World')

        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-num'))
        cy.get('#nrdb-ui-widget-dashboard-ui-markdown-1').should('contain.text', 'Injected content: 5')

        cy.reloadDashboard()

        cy.get('#nrdb-ui-widget-dashboard-ui-markdown-1').should('contain.text', 'Injected content: 5')
    })

    // this markdown node has a full mermaid chart defined on msg.payload
    it('allow for full mermaid charts to be defined by msg', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-graph-E'))
        cy.get('#nrdb-ui-widget-dashboard-ui-markdown-2').find('.nodes .node').should('have.length', 5)
        cy.get('#nrdb-ui-widget-dashboard-ui-markdown-2').find('.nodes .node').eq(4).should('have.text', 'E')

        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-graph-F'))
        cy.get('#nrdb-ui-widget-dashboard-ui-markdown-2').find('.nodes .node').should('have.length', 5)
        cy.get('#nrdb-ui-widget-dashboard-ui-markdown-2').find('.nodes .node').eq(4).should('have.text', 'F')

        cy.reloadDashboard()

        cy.get('#nrdb-ui-widget-dashboard-ui-markdown-2').find('.nodes .node').should('have.length', 5)
        cy.get('#nrdb-ui-widget-dashboard-ui-markdown-2').find('.nodes .node').eq(4).should('have.text', 'F')
    })
})
