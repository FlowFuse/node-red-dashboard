/* eslint-disable cypress/no-unnecessary-waiting */
// test admin rights & access in FlowFuse

describe('Node-RED Dashboard 2.0 - Layout: Grid', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-layouts')
        cy.visit('/dashboard/grid')
    })

    it('should render groups in the correct order', () => {
        cy.get('.nrdb-ui-group').should('have.length', 3)
        cy.get('.nrdb-ui-group').eq(0).find('.v-card-title').should('have.text', 'Order 1')
        cy.get('.nrdb-ui-group').eq(1).find('.v-card-title').should('have.text', 'Order 2')
        cy.get('.nrdb-ui-group').eq(2).find('.v-card-title').should('have.text', 'Order 3')
    })
})

describe('Node-RED Dashboard 2.0 - Layout: Fixed', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-layouts')
        cy.visit('/dashboard/fixed')
    })

    it('should render groups in the correct order', () => {
        cy.get('.nrdb-ui-group').should('have.length', 3)
        cy.get('.nrdb-ui-group').eq(0).find('.v-card-title').should('have.text', 'Order 1')
        cy.get('.nrdb-ui-group').eq(1).find('.v-card-title').should('have.text', 'Order 2')
        cy.get('.nrdb-ui-group').eq(2).find('.v-card-title').should('have.text', 'Order 3')
    })
})

describe('Node-RED Dashboard 2.0 - Layout: Notebook', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-layouts')
        cy.visit('/dashboard/notebook')
    })

    it('should render groups in the correct order', () => {
        cy.get('.nrdb-ui-group').should('have.length', 3)
        cy.get('.nrdb-ui-group').eq(0).find('.v-card-title').should('have.text', 'Order 1')
        cy.get('.nrdb-ui-group').eq(1).find('.v-card-title').should('have.text', 'Order 2')
        cy.get('.nrdb-ui-group').eq(2).find('.v-card-title').should('have.text', 'Order 3')
    })
})

describe('Node-RED Dashboard 2.0 - Layout: Tabs', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-layouts')
        cy.visit('/dashboard/tabs')
    })

    it('should render page tabs in list order, followed by untabbed groups', () => {
        cy.get('.nrdb-layout--tabs .v-tab').should('have.length', 3)
        cy.get('.nrdb-layout--tabs .v-tab').eq(0).should('contain.text', 'Compose')
        cy.get('.nrdb-layout--tabs .v-tab').eq(1).should('contain.text', 'Inbox')
        cy.get('.nrdb-layout--tabs .v-tab').eq(2).should('contain.text', 'Loose')
    })

    it('should render every group assigned to the active tab, in group order', () => {
        cy.get('.v-window-item--active .nrdb-ui-group').should('have.length', 2)
        cy.get('.v-window-item--active .nrdb-ui-group').eq(0).find('.v-card-title').should('have.text', 'Compose')
        cy.get('.v-window-item--active .nrdb-ui-group').eq(1).find('.v-card-title').should('have.text', 'Attachments')
    })

    it('should switch to the groups of the selected tab', () => {
        cy.get('.nrdb-layout--tabs .v-tab').eq(1).click()
        cy.get('.v-window-item--active .nrdb-ui-group').should('have.length', 1)
        cy.get('.v-window-item--active #nrdb-ui-group-dashboard-ui-group-tabs-inbox').should('exist')
    })

    it('should render a single-group tab without a group title, matching group-per-tab tabs', () => {
        cy.get('.nrdb-layout--tabs .v-tab').eq(1).click()
        cy.get('.v-window-item--active #nrdb-ui-group-dashboard-ui-group-tabs-inbox .v-card').should('be.visible')
            .find('.v-card-title').should('not.exist')
    })

    it('should fall back when the active tab is hidden, without jumping back when it reappears', () => {
        cy.wait(1000)
        cy.reloadDashboard()
        cy.get('.nrdb-layout--tabs .v-tab').eq(1).click()
        cy.get('.v-window-item--active #nrdb-ui-widget-dashboard-ui-button-tabs-hide-inbox').should('be.visible')
        cy.wait(500)
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-tabs-hide-inbox'))
        cy.get('.nrdb-layout--tabs .v-tab').should('have.length', 2)
        cy.get('.nrdb-layout--tabs .v-tab--selected').should('have.length', 1)
        cy.get('.v-window-item--active .nrdb-ui-group').should('have.length.at.least', 1)

        cy.request('POST', '/inject/dashboard-inject-tabs-show-inbox')
        cy.get('.nrdb-layout--tabs .v-tab').should('have.length', 3)
        cy.wait(500)
        cy.get('.nrdb-layout--tabs .v-tab--selected').should('have.length', 1).and('not.contain.text', 'Inbox')
    })
})

describe('Node-RED Dashboard 2.0 - Layout: Tabs across redeploys', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-layouts')
        cy.visit('/dashboard/tabs')
    })

    it('should keep the selected tab when flows are redeployed', () => {
        cy.wait(1000)
        cy.reloadDashboard()
        cy.get('.nrdb-layout--tabs .v-tab').eq(1).click()
        cy.get('.nrdb-layout--tabs .v-tab').eq(1).should('have.class', 'v-tab--selected')
        // eslint-disable-next-line promise/catch-or-return
        cy.request({ url: '/flows', headers: { 'Node-RED-API-Version': 'v2' } }).then((res) => {
            return cy.deployFlow(res.body.rev, res.body.flows)
        })
        cy.wait(3000)
        cy.get('.nrdb-layout--tabs .v-tab').should('have.length', 3)
        cy.get('.nrdb-layout--tabs .v-tab').eq(1).should('have.class', 'v-tab--selected')
    })

    it('should keep the first tab when flows are redeployed before any tab is clicked', () => {
        cy.wait(1000)
        cy.reloadDashboard()
        cy.get('.nrdb-layout--tabs .v-tab').eq(0).should('have.class', 'v-tab--selected')
        // eslint-disable-next-line promise/catch-or-return
        cy.request({ url: '/flows', headers: { 'Node-RED-API-Version': 'v2' } }).then((res) => {
            return cy.deployFlow(res.body.rev, res.body.flows)
        })
        cy.wait(3000)
        cy.get('.nrdb-layout--tabs .v-tab').should('have.length', 3)
        cy.get('.nrdb-layout--tabs .v-tab').eq(0).should('have.class', 'v-tab--selected')
    })
})

describe('Node-RED Dashboard 2.0 - Layout: Tabs wizard', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-layouts')
        cy.visit('/dashboard/tabs-wizard')
    })

    it('should select the revealed tab when the active tab is hidden and another shown together', () => {
        cy.wait(1000)
        cy.reloadDashboard()
        cy.get('.nrdb-layout--tabs .v-tab').should('have.length', 1)
        cy.request('POST', '/inject/dashboard-inject-tabs-wizard-next')
        cy.wait(1000)
        cy.get('.nrdb-layout--tabs .v-tab').should('have.length', 1).and('contain.text', 'Step 2')
        cy.get('.nrdb-layout--tabs .v-tab--selected').should('have.length', 1)
        cy.get('.v-window-item--active #nrdb-ui-group-dashboard-ui-group-wizard-step2').should('be.visible')
    })
})

describe('Node-RED Dashboard 2.0 - Layout: Tabs without page tabs', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-layouts')
        cy.visit('/dashboard/tabs-legacy')
    })

    it('should render each visible, non-dialog group as its own tab, in group order', () => {
        cy.get('.nrdb-layout--tabs .v-tab').should('have.length', 2)
        cy.get('.nrdb-layout--tabs .v-tab').eq(0).should('contain.text', 'Legacy A')
        cy.get('.nrdb-layout--tabs .v-tab').eq(1).should('contain.text', 'Legacy B')
    })

    it('should render the group full width without a title', () => {
        cy.get('.v-window-item--active #nrdb-ui-group-dashboard-ui-group-legacy-a .v-card').should('be.visible')
            .find('.v-card-title').should('not.exist')
        cy.get('.v-window-item--active .nrdb-layout--tabs-grid').should('not.exist')
    })
})

describe('Node-RED Dashboard 2.0 - Groups', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-layouts')
        cy.visit('/dashboard/grid')
    })

    it('order widgets correctly', () => {
        cy.get('.nrdb-ui-widget').should('have.length', 3)
        cy.get('.nrdb-ui-widget').eq(0).should('have.attr', 'id', 'nrdb-ui-widget-dashboard-ui-button')
        cy.get('.nrdb-ui-widget').eq(1).should('have.attr', 'id', 'nrdb-ui-widget-dashboard-ui-text')
        cy.get('.nrdb-ui-widget').eq(2).should('have.attr', 'id', 'nrdb-ui-widget-dashboard-ui-slider')
    })
})
