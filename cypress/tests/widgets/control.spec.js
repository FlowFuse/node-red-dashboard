// test admin rights & access in FlowForge

describe('Node-RED Dashboard 2.0 - Control - Navigation', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-controls')
        cy.visit('/dashboard/controls')
    })

    it('can navigate to a page directly if passing the name of a page as a str payload', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-button-nav-page1').click()
        cy.url().should('include', '/dashboard/page1')
    })

    it('can navigate to a page directly is passing a page name nested in an object under the .page key', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-button-nav-page2').click()
        cy.url().should('include', '/dashboard/page2')
    })

    it('can navigate to the previous page by passing "-1"', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-button-nav-prev').click()
        cy.url().should('include', '/dashboard/page2')
    })

    it('can navigate to the next page by passing "+1"', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-button-nav-next').click()
        cy.url().should('include', '/dashboard/page1')
    })

    it('can navigate to a specific index by passing a number', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-button-nav-next').click()
        cy.url().should('include', '/dashboard/page1')
    })

    it('refreshes the page when passing in an empty string', () => {
        cy.url().should('include', '/dashboard/controls')

        // eslint-disable-next-line promise/catch-or-return
        cy.window()
            .then(win => {
                win.test = 'hello world'
                return win
            })

        cy.window().should('have.property', 'test', 'hello world')
        cy.get('#nrdb-ui-widget-dashboard-ui-button-nav-refresh').click()
        // our windows var should be cleared due to refresh
        cy.url().should('include', '/dashboard/controls')
        cy.window().should('not.have.property', 'test')
    })
})
