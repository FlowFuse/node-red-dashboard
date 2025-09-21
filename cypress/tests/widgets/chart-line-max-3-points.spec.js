/// <reference types="cypress" />
import should from 'should'

/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node/-RED Dashboard 2.0 - Chart Widget - bar - stacked', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-chart-line-max-3-points')
        cy.visit('/dashboard/page1')
    })

    it('should limit the chart data to 3 points', () => {
        cy.get('#nrdb-ui-widget-chart-1 > div > div').should('exist')
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
            const options = chart.chart.getOption()
            should(options.series).be.an.Array()

            should(options.series).be.an.Array().and.have.length(1)
            should(options.series[0].data).be.an.Array().and.have.length(3)
        })
    })
})
