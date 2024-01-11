// test admin rights & access in FlowForge

describe('Node-RED Dashboard 2.0', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-pages')
    })

    it('will redirect to the default page', () => {
        cy.visit('/dashboard')
        cy.url().should('include', '/dashboard/page1')
    })
})
