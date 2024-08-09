describe('Node-RED Dashboard 2.0 - Number Input Widget', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-number-input')
        cy.visit('/dashboard/page1')
    })

    const numberInputOne = '.number-input-1 input[type="text"]'

    // Test case: Renders the Number Input widget correctly
    it('renders the Number Input widget correctly', () => {
        cy.get(numberInputOne).should('exist')
    })

    // Test case: Updates the value correctly
    it('updates the value correctly and outputs the correct payload', () => {
        cy.get(numberInputOne).should('exist')
        cy.get(numberInputOne).clear()
        cy.get(numberInputOne).type('4')
        cy.get(numberInputOne).should('have.value', '4')
        cy.checkOutput('msg.payload', 4)
    })

    // Test case: Displays the tooltip correctly
    it('displays the tooltip correctly', () => {
        cy.get('.number-input-1 .nrdb-ui-number-field').trigger('mouseover')
        cy.get('.v-tooltip').should('contain', 'Tooltip Text')
    })

    // Test case: Emits onClear event correctly
    it('reset field on onClear event correctly and outputs the correct payload', () => {
        cy.get(numberInputOne).clear()
        cy.get(numberInputOne).type('2')
        cy.get('.number-input-1 .nrdb-ui-number-field .v-field__clearable').click()
        cy.get(numberInputOne).should('have.value', '')
        cy.checkOutput('msg.payload', null)
        cy.get('.number-input-1 .nrdb-ui-number-field').trigger('blur')
    })
})

describe('Node-RED Dashboard 2.0 - Number Input (Dynamic Properties)', () => {
    const buttonSetIcon = '.set-icon-button button[type="button"]'
    const buttonSetIconPosition = '.set-icon-position button[type="button"]'
    const buttonSetIconOutside = '.set-icon-to-outside button[type="button"]'

    beforeEach(() => {
        cy.deployFixture('dashboard-number-input')
        cy.visit('/dashboard/page1')
    })

    it('Set the dynnamic properties of the input by change the properties of the "icon"', () => {
        cy.clickAndWait(cy.get(buttonSetIcon))
        cy.get('.number-input-2 .v-field').find('i.mdi-numeric').should('exist')
        cy.clickAndWait(cy.get(buttonSetIconPosition))
        cy.get('.number-input-2 > .v-input > .v-input__control > .v-field > .v-field__append-inner').find('i.v-icon').should('exist')
        cy.clickAndWait(cy.get(buttonSetIconOutside))
        cy.get('.number-input-2 .v-input .v-input__append').find('i.v-icon').should('exist')
    })
})
