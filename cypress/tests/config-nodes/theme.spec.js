describe('Node-RED Dashboard 2.0 - Theme', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-themes')
    })

    it('applies a light theme — the page renders on the light background', () => {
        cy.visit('/dashboard/page1')
        cy.get('.nrdb-app').should('have.css', 'background-color', 'rgb(249, 249, 251)')
    })

    it('applies a dark theme — the page renders on the dark background', () => {
        cy.visit('/dashboard/page2')
        cy.get('.nrdb-app').should('have.css', 'background-color', 'rgb(17, 17, 19)')
    })
})
