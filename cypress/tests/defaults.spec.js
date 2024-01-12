// test admin rights & access in FlowForge

describe('Node-RED', () => {
    beforeEach(() => {
        cy.deployFixture('test')
    })

    it('can load a flows.json', () => {
        cy.url().should('include', '/#flow/')
    })
})
