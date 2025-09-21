describe('Node-RED Dashboard 2.0 - Text', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-text')
        cy.visit('/dashboard/page1')
    })

    it('displays the default label, and no value by default', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-text-left').contains('Label')
        cy.get('#nrdb-ui-widget-dashboard-ui-text-left').should('not.contain', 'injected text')
    })

    it('displays any payloads injected into the node', () => {
        cy.get('button').contains('Inject Text').click()
        cy.get('#nrdb-ui-widget-dashboard-ui-text-left').contains('injected text')
    })

    it('assigns the correct CSS class depending on the layout chosen', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-text-left').children().eq(0).should('have.class', 'nrdb-ui-text--row-left')
        cy.get('#nrdb-ui-widget-dashboard-ui-text-center').children().eq(0).should('have.class', 'nrdb-ui-text--row-center')
    })

    it('sets the correct custom CSS styling if defined', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-text-center').children().eq(0).should('have.css', 'color')
        cy.get('#nrdb-ui-widget-dashboard-ui-text-center').children().eq(0).should('have.css', 'font-size')
        cy.get('#nrdb-ui-widget-dashboard-ui-text-center').children().eq(0).should('have.css', 'line-height')
        cy.get('#nrdb-ui-widget-dashboard-ui-text-center').children().eq(0).should('have.css', 'font-family', 'Courier, monospace')
    })

    it('modifies the output based on the value parameter using a msg attribute', () => {
        cy.get('button').contains('Inject Text 3').click()
        cy.get('#nrdb-ui-widget-dashboard-ui-text-msg-attribute-value').contains('INJECTED TEXT')
    })

    it('modifies the output based on the value parameter using an expression', () => {
        cy.get('button').contains('Inject Text 3').click()
        cy.get('#nrdb-ui-widget-dashboard-ui-text-expression-value').contains('injected-text')
    })
})

describe('Node-RED Dashboard 2.0 - Text - Dynamic Properties', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-text')
        cy.visit('/dashboard/page1')
    })

    it('includes "label"', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-text-dynamic').contains('Static Label')
        cy.clickAndWait(cy.get('#nrdb-ui-widget-button-dynamic-label'))
        cy.get('#nrdb-ui-widget-dashboard-ui-text-dynamic').contains('Dynamic Label')
    })

    it('includes "layout"', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-text-dynamic').children('.nrdb-ui-text--row-left').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-text-dynamic').children('.nrdb-ui-text--col-center').should('not.exist')
        cy.clickAndWait(cy.get('#nrdb-ui-widget-button-dynamic-layout'))
        cy.get('#nrdb-ui-widget-dashboard-ui-text-dynamic').children('.nrdb-ui-text--row-left').should('not.exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-text-dynamic').children('.nrdb-ui-text--col-center').should('exist')
    })

    it('includes "font"', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-text-dynamic .nrdb-ui-text').should('not.have.css', 'font-family', 'Helvetica')
        cy.clickAndWait(cy.get('#nrdb-ui-widget-button-dynamic-font'))
        cy.get('#nrdb-ui-widget-dashboard-ui-text-dynamic .nrdb-ui-text').should('have.css', 'font-family', 'Helvetica')
    })

    it('includes "fontSize"', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-text-dynamic .nrdb-ui-text').should('not.have.css', 'font-size', '28px')
        cy.clickAndWait(cy.get('#nrdb-ui-widget-button-dynamic-fontSize'))
        cy.get('#nrdb-ui-widget-dashboard-ui-text-dynamic .nrdb-ui-text').should('have.css', 'font-size', '28px')
    })

    it('includes "color"', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-text-dynamic .nrdb-ui-text').should('not.have.css', 'color', 'rgb(255, 0, 0)')
        cy.clickAndWait(cy.get('#nrdb-ui-widget-button-dynamic-color'))
        cy.get('#nrdb-ui-widget-dashboard-ui-text-dynamic .nrdb-ui-text').should('have.css', 'color', 'rgb(255, 0, 0)')
    })

    it('retains previous value on dynamic input without payload', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-text-left').should('not.contain', 'injected text')
        cy.clickAndWait(cy.get('#nrdb-ui-widget-button-inject-text-2'))
        cy.get('#nrdb-ui-widget-dashboard-ui-text-dynamic').contains('injected text')
        cy.get('#nrdb-ui-widget-dashboard-ui-text-dynamic').contains('Dynamic Label')
        cy.clickAndWait(cy.get('#nrdb-ui-widget-button-dynamic-label-no-payload'))
        cy.get('#nrdb-ui-widget-dashboard-ui-text-dynamic').contains('Dynamic Label-No Payload')
        cy.get('#nrdb-ui-widget-dashboard-ui-text-dynamic').contains('injected text')
    })
})
