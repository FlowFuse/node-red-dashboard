// test admin rights & access in FlowForge

describe('Node-RED Dashboard 2.0 - Buttons', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-buttons')
        cy.visit('/dashboard/page1')
    })

    it('can be clicked and outputs the correct payload', () => {
        cy.get('button').contains('Button 1 (str)').click()
        cy.checkOutput('payload', 'button 1 clicked')
        cy.get('button').contains('Button 1 (json)').click()
        cy.checkOutput('payload.hello', 'world')
    })

    it('can be clicked and outputs the correct topic', () => {
        cy.get('button').contains('Button 1 (str)').click()
        cy.checkOutput('topic', 'button-topic')
        cy.get('button').contains('Button 1 (json)').click()
        cy.checkOutput('topic', '')
    })
})
