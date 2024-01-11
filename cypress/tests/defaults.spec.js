// test admin rights & access in FlowForge

describe('Node-RED', () => {
    beforeEach(() => {
        cy.loadFlows()
            .then((rev) => {
                cy.fixture('flows/test')
                    .then((flow) => {
                        return cy.deployFlow(rev, flow)
                    })
            })
    })

    it('can load a flows.json', () => {
        cy.url().should('include', '/#flow/')
    })
})