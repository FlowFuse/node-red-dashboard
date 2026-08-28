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

    // Textarea padding is derived from the row height so the label clears the text
    // without growing the row, scaling across densities (32/38/48px).
    const densities = [
        { name: 'compact (32px row)', cls: 'nrdb-view-density--compact', top: '4px', bottom: '0px' },
        { name: 'comfortable (38px row)', cls: 'nrdb-view-density--comfortable', top: '7px', bottom: '3px' },
        { name: 'default (48px row)', cls: 'nrdb-view-density--default', top: '12px', bottom: '8px' }
    ]
    densities.forEach(({ name, cls, top, bottom }) => {
        it(`derives textarea padding from the row height at ${name}`, () => {
            cy.get('.nrdb-app')
                .invoke('removeClass', 'nrdb-view-density--compact nrdb-view-density--comfortable nrdb-view-density--default')
                .invoke('addClass', cls)
            cy.get('#nrdb-ui-widget-c1d2e3f4a5b60718 textarea')
                .parents('.v-field').first()
                .find('.v-field__input')
                .should('have.css', 'padding-top', top)
                .and('have.css', 'padding-bottom', bottom)
        })
    })
})
