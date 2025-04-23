describe('Node-RED Dashboard 2.0 - Control - Navigation', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-controls')
        cy.visit('/dashboard/controls')
    })

    it('can navigate to a page directly if passing the name of a page as a str payload', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-nav-page1'))
        cy.url().should('include', '/dashboard/page1')
    })

    it('can navigate to a page directly is passing a page name nested in an object under the .page key, and with the relevant query params when using .query', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-nav-page2'))
        cy.url().should('include', '/dashboard/page2')
        cy.url().should('include', '?key=value')
    })

    it('can navigate to the previous page by passing "-1"', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-nav-prev'))
        cy.url().should('include', '/dashboard/page2')
    })

    it('can navigate to the next page by passing "+1"', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-nav-next'))
        cy.url().should('include', '/dashboard/page1')
    })

    it('can navigate to a specific index by passing a number', () => {
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-nav-index'))
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
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-nav-refresh'))
        // our windows var should be cleared due to refresh
        cy.url().should('include', '/dashboard/controls')
        cy.window().should('not.have.property', 'test')
    })

    it('navigates to an external website with msg.payload.url defined', () => {
        cy.url().should('include', '/dashboard/controls')
        cy.get('#nrdb-ui-widget-dashboard-ui-button-nav-external').click()
        // our windows var should be cleared due to refresh
        cy.origin('https://nodered.org', () => {
            cy.url().should('eq', 'https://nodered.org/')
        })
    })
})

describe('Node-RED Dashboard 2.0 - Control - Show/Hide', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-controls')
        cy.visit('/dashboard/controls')
    })

    it('can hide and show a particular group', () => {
        cy.get('#nrdb-ui-group-dashboard-ui-group').should('exist')
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-vis-group-hide'))
        cy.get('#nrdb-ui-group-dashboard-ui-group').should('not.exist')
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-vis-group-show'))
        cy.get('#nrdb-ui-group-dashboard-ui-group').should('exist')
    })

    // skipping due to unreliable nature of Vuetify's Nav Draw with Cypress
    // will re-implement once we have option to render a fixed navigation drawer
    it('can hide and show a particular page from the navigation options', () => {
        cy.reloadDashboard()

        cy.get('[data-el="nav-drawer"]').should('be.visible')

        // check length
        cy.get('.v-list.v-list--nav').find('a').should('have.length', 3)
        cy.get('[data-nav="dashboard-ui-page-controls"]').should('be.visible')
        cy.get('[data-nav="dashboard-ui-page-1"]').should('be.visible')
        cy.get('[data-nav="dashboard-ui-page-2"]').should('be.visible')

        // hide page
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-vis-page-hide'))

        // check length
        cy.get('.v-list.v-list--nav').find('a').should('have.length', 2)

        // show page again
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-vis-page-show'))

        cy.get('[data-el="nav-drawer"]').should('be.visible')
        // check length
        cy.get('.v-list.v-list--nav').find('a').should('have.length', 3)
        cy.get('[data-nav="dashboard-ui-page-controls"]').should('be.visible')
        cy.get('[data-nav="dashboard-ui-page-1"]').should('be.visible')
        cy.get('[data-nav="dashboard-ui-page-2"]').should('be.visible')
    })
})

describe('Node-RED Dashboard 2.0 - Control - Enable/Disable', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-controls')
        cy.visit('/dashboard/controls')
    })

    it('can disable and enable a particular group', () => {
        cy.get('#nrdb-ui-group-dashboard-ui-group').should('not.have.attr', 'disabled')
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-int-group-disable'))
        cy.get('#nrdb-ui-group-dashboard-ui-group').should('have.attr', 'disabled')
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-int-group-enable'))
        cy.get('#nrdb-ui-group-dashboard-ui-group').should('not.have.attr', 'disabled')
    })

    // skipping due to unreliable nature of Vuetify's Nav Draw with Cypress
    // will re-implement once we have option to render a fixed navigation drawer
    it('can enable/disable a particular page from the navigation options', () => {
        cy.get('[data-el="nav-drawer"]').should('be.visible')

        // check length
        cy.get('.v-list.v-list--nav').find('a').should('have.length', 3)

        // check all enabled
        cy.get('[data-nav="dashboard-ui-page-controls"]').should('not.have.class', 'v-list-item--disabled')
        cy.get('[data-nav="dashboard-ui-page-1"]').should('not.have.class', 'v-list-item--disabled')
        cy.get('[data-nav="dashboard-ui-page-2"]').should('not.have.class', 'v-list-item--disabled')

        // disable an entry
        cy.get('#nrdb-ui-widget-dashboard-ui-button-int-page-disable').click()

        // check length
        cy.get('.v-list.v-list--nav').find('a').should('have.length', 3)
        cy.get('[data-nav="dashboard-ui-page-1"]').should('have.class', 'v-list-item--disabled')
        cy.get('[data-nav="dashboard-ui-page-controls"]').should('not.have.class', 'v-list-item--disabled')
        cy.get('[data-nav="dashboard-ui-page-2"]').should('not.have.class', 'v-list-item--disabled')

        // enable an entry
        cy.get('#nrdb-ui-widget-dashboard-ui-button-int-page-enable').click()

        // check length
        cy.get('.v-list.v-list--nav').find('a').should('have.length', 3)
        cy.get('[data-nav="dashboard-ui-page-controls"]').should('not.have.class', 'v-list-item--disabled')
        cy.get('[data-nav="dashboard-ui-page-1"]').should('not.have.class', 'v-list-item--disabled')
        cy.get('[data-nav="dashboard-ui-page-2"]').should('not.have.class', 'v-list-item--disabled')
    })
})
