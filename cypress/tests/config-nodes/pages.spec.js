// test admin rights & access in FlowForge

describe('Node-RED Dashboard 2.0', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-pages')
        cy.visit('/dashboard')
    })

    it('will redirect to the default page when an unrecognised URL is given', () => {
        cy.url().should('include', '/dashboard/page1')
    })

    it('will have a navigation drawer, accessible via the top-left button, and can switch between pages here', () => {
        // Check we can open the Navigation Drawer
        cy.get('[data-el="nav-drawer"]').should('not.exist')
        cy.get('.v-app-bar-nav-icon').click()
        cy.get('[data-el="nav-drawer"]').should('be.visible')

        // Check we have the pages listed
        cy.get('[data-nav="dashboard-ui-page-1"]').should('be.visible')
        cy.get('[data-nav="dashboard-ui-page-2"]').should('be.visible')

        // Click page 2
        cy.get('[data-nav="dashboard-ui-page-2"]').click({ force: true }) // for some reason Cypress thinks this element is off the screen - it isn't

        // Check we've changed to Page 2
        cy.url().should('include', '/dashboard/page2')
    })
})
