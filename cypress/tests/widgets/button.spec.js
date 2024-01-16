describe('Node-RED Dashboard 2.0 - Buttons', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-buttons')
        cy.visit('/dashboard/page1')
    })

    it('can be clicked and outputs the correct payload & topic are emitted', () => {
        // Emitting strings
        cy.get('button').contains('Button 1 (str)').click()
        cy.checkOutput('msg.payload', 'button 1 clicked')
        cy.checkOutput('msg.topic', 'button-str-topic')

        // Emitting JSON
        cy.get('button').contains('Button 1 (json)').click()
        cy.checkOutput('msg.payload.hello', 'world')
        cy.checkOutput('msg.topic', 'button-json-topic')
    })

    it('can retrieve global variables when clicked', () => {
        // set global. var via helper API
        cy.setGlobalVar('test', 'global-var')
        cy.checkOutput('test', 'global-var')

        // Emitting global var
        cy.clickAndWait(cy.get('button').contains('Button 2 (global)'))
        cy.checkOutput('msg.payload', 'global-var')
    })
})
