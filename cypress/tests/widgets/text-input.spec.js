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

    // Test case: Renders the textarea (multiline) mode correctly
    it('renders the Text Input widget in textarea mode', () => {
        cy.get('#nrdb-ui-widget-c1d2e3f4a5b60718 textarea').should('exist')
        cy.get('#nrdb-ui-widget-c1d2e3f4a5b60718 .v-field__field label').should('contain', 'Marking Notes')
    })

    // Regression test for #2008: textarea must keep its top padding so the
    // floating label doesn't overlap the text (not collapsed to the global 2px).
    it('keeps top padding in textarea mode so the label does not overlap the text', () => {
        cy.get('#nrdb-ui-widget-c1d2e3f4a5b60718 textarea')
            .parents('.v-field').first()
            .find('.v-field__input')
            .should('have.css', 'padding-top', '12px')
    })
})
