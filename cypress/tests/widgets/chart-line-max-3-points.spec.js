/// <reference types="cypress" />
import should from 'should'

/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node/-RED Dashboard 2.0 - Chart Widget - bar - stacked', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-chart-line-max-3-points')
        cy.visit('/dashboard/page1')
    })

    it('should limit the chart data to 3 points', () => {
        cy.get('#nrdb-ui-widget-chart-1 > div > canvas').should('exist')
        // operate input button 5 times
        cy.clickAndWait(cy.get('button').contains('random'))
        cy.wait(10)
        cy.clickAndWait(cy.get('button').contains('random'))
        cy.wait(10)
        cy.clickAndWait(cy.get('button').contains('random'))
        cy.wait(10)
        cy.clickAndWait(cy.get('button').contains('random'))
        cy.wait(10)
        cy.clickAndWait(cy.get('button').contains('random'))
        cy.wait(10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const chart = win.uiCharts['chart-1']
            should(chart).is.not.empty()
            should(chart.chart.config.data).be.an.Object()
            should(chart.chart.config.data.datasets).be.an.Array()

            should(chart.chart.config.data.datasets).be.an.Array().and.have.length(1)
            should(chart.chart.config.data.datasets[0].data).be.an.Array().and.have.length(3)
        })
    })
})
