// test admin rights & access in FlowForge

describe('Node-RED', () => {
    beforeEach(() => {
        cy.loadFlows()
            .then((rev) => {
                return cy.fixture('flows/test')
                    .then((flow) => {
                        return cy.deployFlow(rev, flow)
                    })
            })
            .catch(() => {
                console.error('Failed to load flows')
            })
    })

    it('can load a flows.json', () => {
        cy.url().should('include', '/#flow/')
    })
})
