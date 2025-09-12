/// <reference types="cypress" />
import should from 'should'

/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node-RED Dashboard 2.0 - Chart - Type: Interpolation', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-chart-interpolation')
        cy.visit('/dashboard/page1')
    })

    it('renders charts with correct data', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-linear > div > div').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-step > div > div').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-bezier > div > div').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-cubic > div > div').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-mono > div > div').should('exist')

        // Add data points 4, 8, 3 and 1
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-clear'))
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-4'))
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-8'))
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-3'))
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-1'))

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const linear = win.uiCharts['dashboard-ui-chart-linear']
            const step = win.uiCharts['dashboard-ui-chart-step']
            const bezier = win.uiCharts['dashboard-ui-chart-bezier']
            const cubic = win.uiCharts['dashboard-ui-chart-cubic']
            const mono = win.uiCharts['dashboard-ui-chart-mono']

            // Check Data for Interpolation - eCharts structure
            const linearOptions = linear.chart.getOption()
            should(linearOptions.series).be.an.Array()

            // Check data point values
            should(linearOptions.series[0].data).be.an.Array().and.have.length(4)
            should(step.chart.getOption().series[0].data).be.an.Array().and.have.length(4)
            should(bezier.chart.getOption().series[0].data).be.an.Array().and.have.length(4)
            should(cubic.chart.getOption().series[0].data).be.an.Array().and.have.length(4)
            should(mono.chart.getOption().series[0].data).be.an.Array().and.have.length(4)

            // Check interpolation config for linear (smooth: false)
            should(linearOptions.series[0].smooth).be.equal(false)

            // Check interpolation config for step
            should(step.chart.getOption().series[0].step).be.equal('end')

            // eCharts only supports setting a "smooth" variable

            // Check interpolation config for bezier (smooth: true)
            should(bezier.chart.getOption().series[0].smooth).be.equal(true)
            // Check interpolation config for cubic (smooth: true)
            should(cubic.chart.getOption().series[0].smooth).be.equal(true)
            // Check interpolation config for monotone (smooth: true)
            should(mono.chart.getOption().series[0].smooth).be.equal(true)
        })
    })
})
