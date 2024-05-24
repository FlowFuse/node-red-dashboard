// test admin rights & access in FlowForge

describe('Node-RED Dashboard 2.0 - Layout: Grid', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-layouts')
        cy.visit('/dashboard/grid')
    })

    it('should render groups in the correct order', () => {
        cy.get('.nrdb-ui-group').should('have.length', 3)
        cy.get('.nrdb-ui-group').eq(0).should('have.text', 'Order 1')
        cy.get('.nrdb-ui-group').eq(1).should('have.text', 'Order 2')
        cy.get('.nrdb-ui-group').eq(2).should('have.text', 'Order 3')
    })
})
describe('Node-RED Dashboard 2.0 - Layout: Fixed', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-layouts')
        cy.visit('/dashboard/fixed')
    })

    it('should render groups in the correct order', () => {
        cy.get('.nrdb-ui-group').should('have.length', 3)
        cy.get('.nrdb-ui-group').eq(0).should('have.text', 'Order 1')
        cy.get('.nrdb-ui-group').eq(1).should('have.text', 'Order 2')
        cy.get('.nrdb-ui-group').eq(2).should('have.text', 'Order 3')
    })
})
describe('Node-RED Dashboard 2.0 - Layout: Notebook', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-layouts')
        cy.visit('/dashboard/notebook')
    })

    it('should render groups in the correct order', () => {
        cy.get('.nrdb-ui-group').should('have.length', 3)
        cy.get('.nrdb-ui-group').eq(0).should('have.text', 'Order 1')
        cy.get('.nrdb-ui-group').eq(1).should('have.text', 'Order 2')
        cy.get('.nrdb-ui-group').eq(2).should('have.text', 'Order 3')
    })
})
