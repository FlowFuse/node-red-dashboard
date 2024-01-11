describe('Node-RED Dashboard 2.0', () => {
    beforeEach(() => {
        let rev = null
        cy.loadFlows()
            .then((_rev) => {
                rev = _rev
                return cy.fixture('flows/dashboard-basic')
            })
            .then((flow) => {
                return cy.deployFlow(rev, flow)
            })
            .catch(() => {
                console.error('Failed to load flows')
            })
    })

    it('will spin up an Express Server if a ui-base is provided', () => {
        cy.url().should('include', '/dashboard/')
    })

    it('will load a placeholder message if no nodes are found', () => {
        cy.contains('Please add some Dashboard 2.0 nodes to your flow and re-deploy.').should('exist')
    })
})
