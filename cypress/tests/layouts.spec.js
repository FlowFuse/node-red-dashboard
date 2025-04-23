// test admin rights & access in FlowForge

describe('FlowFuse Dashboard - Layout: Grid', () => {
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

describe('FlowFuse Dashboard - Layout: Fixed', () => {
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

describe('FlowFuse Dashboard - Layout: Notebook', () => {
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

describe('FlowFuse Dashboard - Groups', () => {
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
