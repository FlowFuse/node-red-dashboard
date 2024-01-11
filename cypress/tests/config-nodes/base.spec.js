
describe('Node-RED Dashboard 2.0', () => {
    beforeEach(() => {
        cy.loadFlows()
            .then((rev) => {
                cy.fixture('flows/dashboard-basic')
                    .then((flow) => {
                        return cy.deployFlow(rev, flow)
                    })
            })
    })

    it('will spin up an Express Server if a ui-base is provided', () => {
        cy.url().should('include', '/dashboard/')
    })

    it('will load a placeholder message if no nodes are found', () => {
        cy.contains("Please add some Dashboard 2.0 nodes to your flow and re-deploy.").should('exist')
    })
})
