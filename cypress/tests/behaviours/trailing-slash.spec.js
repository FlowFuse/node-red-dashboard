/// <reference types="cypress" />
describe('Trailing Slash Handling', () => {
    beforeEach(() => {
        cy.deployFixture('trailing-slashes-redirect')
        cy.visit('/dashboard/page1')
    })
    it('should redirect URLs with trailing slashes', () => {
        cy.visit('/dashboard/page1/')
        cy.contains('just a group')
    })

    it('should load the page without trailing slashes', () => {
        cy.visit('/dashboard/page1')
        cy.contains('just a group')
    })
    it('should load the page with parameters without trailing slashes', () => {
        cy.visit('/dashboard/page1?key=value')
        cy.contains('just a group')
    })
})
