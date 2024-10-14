/// <reference types="cypress" />
import should from 'should'

/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node-RED Dashboard 2.0 - Chart - Type: Interpolation', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-chart-interpolation')
        cy.visit('/dashboard/page1')
    })

    it('renders charts with correct data', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-linear > div > canvas').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-step > div > canvas').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-bezier > div > canvas').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-cubic > div > canvas').should('exist')
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-mono > div > canvas').should('exist')

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

            // Check Data for Interpolation
            should(linear.chart.config.data).be.an.Object()
            should(linear.chart.config.data.datasets).be.an.Array()

            // // Check data point values
            should(linear.chart.config.data.datasets[0].data).be.an.Array().and.have.length(4)
            should(step.chart.config.data.datasets[0].data).be.an.Array().and.have.length(4)
            should(bezier.chart.config.data.datasets[0].data).be.an.Array().and.have.length(4)
            should(cubic.chart.config.data.datasets[0].data).be.an.Array().and.have.length(4)
            should(mono.chart.config.data.datasets[0].data).be.an.Array().and.have.length(4)

            // Check interpolation config for linear
            should(linear.chart.config.data.datasets[0].tension).be.equal(0)

            // Check interpolation config for step
            should(step.chart.config.data.datasets[0].stepped).be.equal(true)

            // Check interpolation config for bezier
            should(bezier.chart.config.data.datasets[0].tension).be.equal(0.4)

            // Check interpolation config for cubic
            should(cubic.chart.config.data.datasets[0].cubicInterpolationMode).be.equal('default')
            should(cubic.chart.config.data.datasets[0].tension).be.equal(0.4)

            // Check interpolation config for monotone
            should(mono.chart.config.data.datasets[0].cubicInterpolationMode).be.equal('monotone')
            should(mono.chart.config.data.datasets[0].tension).be.equal(0.4)
        })
    })
})
