/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node/-RED Dashboard 2.0 - Number Input Widget', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-number-input')
        cy.visit('/dashboard/page1')
    })

    // Test case: Renders the Number Input widget correctly
    it('renders the Number Input widget correctly', () => {
        cy.get('#nrdb-ui-widget-2f48e919876213cc input[type="text"]').should('exist')
    })

    // Test case: Updates the value correctly
    it('updates the value correctly and outputs the correct payload', () => {
        cy.get('#nrdb-ui-widget-2f48e919876213cc input[type="text"]').should('exist')
        cy.get('#nrdb-ui-widget-2f48e919876213cc input[type="text"]').focus()
        cy.get('#nrdb-ui-widget-2f48e919876213cc input[type="text"]').type('123')
        cy.get('#nrdb-ui-widget-2f48e919876213cc input[type="text"]').blur()
        cy.get('#nrdb-ui-widget-2f48e919876213cc input[type="text"]').should('have.value', '123')
        cy.checkOutput('msg.payload', 123)
    })

    // Test case: Displays the tooltip correctly
    it('displays the tooltip correctly', () => {
        cy.get('#nrdb-ui-widget-2f48e919876213cc .nrdb-ui-number-field').trigger('mouseover')
        cy.get('.v-tooltip').should('contain', 'Tooltip Text')
    })

    // Test case: Emits onClear event correctly
    it('reset field on onClear event correctly and outputs the correct payload', () => {
        cy.get('#nrdb-ui-widget-2f48e919876213cc input[type="text"]').clear()
        cy.get('#nrdb-ui-widget-2f48e919876213cc input[type="text"]').type('2')
        cy.get('#nrdb-ui-widget-2f48e919876213cc input[type="text"]').blur()
        cy.get('#nrdb-ui-widget-2f48e919876213cc .nrdb-ui-number-field .v-field__clearable').click()
        cy.get('#nrdb-ui-widget-2f48e919876213cc input[type="text"]').should('have.value', '')
        cy.checkOutput('msg.payload', null)
        cy.get('#nrdb-ui-widget-2f48e919876213cc .nrdb-ui-number-field').trigger('blur')
    })
})

describe('Node-RED Dashboard 2.0 - Number Input (Dynamic Properties)', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-number-input')
        cy.visit('/dashboard/page1')
    })

    it('Set the dynnamic properties: set input "label"', () => {
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f').should('exist')
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Label'))
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f .v-input .v-field .v-field__field').find('.v-field-label').should('exist')
    })

    it('Set the dynnamic properties: set input "clearable"', () => {
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f').should('exist')
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Clearable'))
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f').type('4')
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f .v-input .v-field .v-field__field').find('.v-field-label').should('exist')
    })

    it('Set the dynnamic properties: set input "icon"', () => {
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f').should('exist')
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Icon'))
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Icon'))
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f .v-field__prepend-inner i').should('exist')
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f .v-field__prepend-inner').find('i').should('exist')
    })

    it('Set the dynnamic properties: change input "icon" position', () => {
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f').should('exist')
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Icon'))
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Icon Position'))
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f .v-field .v-field__append-inner').should('exist')
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f .v-field .v-field__append-inner').find('i').should('exist')
    })

    it('Set the dynnamic properties: move input "icon" position to outside', () => {
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f').should('exist')
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Icon'))
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Icon'))
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Icon Position'))
        cy.clickAndWait(cy.get('button').contains('Dynamic Property: Icon Inner Position'))
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f .v-input .v-input__append').should('exist')
        cy.get('#nrdb-ui-widget-bc2a346d36830a3f .v-input .v-input__append').find('i').should('exist')
    })
})
