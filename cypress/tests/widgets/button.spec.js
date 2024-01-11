// test admin rights & access in FlowForge

describe('Node-RED Dashboard 2.0 - Buttons', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-buttons')
        cy.visit('/dashboard/page1')
    })

    it('can be clicked and outputs the correct payload & topic are emitted', () => {
        // Emitting strings
        cy.get('button').contains('Button 1 (str)').click()
        cy.checkOutput('payload', 'button 1 clicked')
        cy.checkOutput('topic', 'button-str-topic')

        // Emitting JSON
        cy.get('button').contains('Button 1 (json)').click()
        cy.checkOutput('payload.hello', 'world')
        cy.checkOutput('topic', 'button-json-topic')
    })
})
