/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node/-RED Dashboard 2.0 - Text Input Widget', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-text-input')
        cy.visit('/dashboard/page1')
    })

    // Test case: Renders the Text Input widget correctly
    it('renders the Text Input widget correctly', () => {
        cy.get('#nrdb-ui-widget-ab3346b81a7cf742 input[type="text"]').should('exist')
    })

    // Test case: Displays the tooltip correctly
    it('displays the tooltip correctly', () => {
        cy.get('#nrdb-ui-widget-ab3346b81a7cf742 .nrdb-ui-text-field').trigger('mouseover')
        cy.get('.v-tooltip').should('contain', 'Tooltip Text')
    })

    // Test case: Emits onClear event correctly
    it('reset field on olear event correctly and outputs the correct payload', () => {
        cy.get('#nrdb-ui-widget-ab3346b81a7cf742 input[type="text"]').clear()
        cy.get('#nrdb-ui-widget-ab3346b81a7cf742 input[type="text"]').type('New text')
        cy.get('#nrdb-ui-widget-ab3346b81a7cf742 input[type="text"]').clear()
        cy.checkOutput('msg.payload', '')
    })
})
