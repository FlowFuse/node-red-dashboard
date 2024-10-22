/// <reference types="cypress" />
import should from 'should'

/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node/-RED Dashboard 2.0 - Chart Widget - line', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-chart-mulitline')
        cy.visit('/dashboard/page1')
    })

    it('should limit the chart data to 3 points', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-multiline > div > canvas').should('exist')

        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-clear'))
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-add'))

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const chart = win.uiCharts['dashboard-ui-chart-multiline']
            should(chart).is.not.empty()
            should(chart.chart.config.data).be.an.Object()
            should(chart.chart.config.data.datasets).be.an.Array()

            should(chart.chart.config.data.datasets).be.an.Array().and.have.length(2)
            should(chart.chart.config.data.datasets[0].data).be.an.Array().and.have.length(3)
            // check the first data data point of the first series is drawn at x=2
            should(chart.chart.config.data.datasets[0].data[0].x).be.equal(2)
            // check the first data data point of the second series is drawn at x=2
            should(chart.chart.config.data.datasets[1].data[0].x).be.equal(2)
        })
    })
})
