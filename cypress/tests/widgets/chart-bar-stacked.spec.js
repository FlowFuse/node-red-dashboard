/// <reference types="cypress" />
import should from 'should'

/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node/-RED Dashboard 2.0 - Chart Widget - bar - stacked', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-chart-bar-stacked')
        cy.visit('/dashboard/page1')
    })

    it('renders charts with correct data', () => {
        cy.get('#nrdb-ui-widget-stacked-bar-chart > div > div').should('exist')
        cy.clickAndWait(cy.get('button').contains('stack 2023'))
        cy.wait(10)
        cy.clickAndWait(cy.get('button').contains('stack 2024'))
        cy.wait(10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const barChart = win.uiCharts['stacked-bar-chart']
            should(barChart).is.not.empty()
            const options = barChart.chart.getOption()
            should(options.series).be.an.Array()

            should(options.series).be.an.Array().and.have.length(2)
            should(options.series[0].data).be.an.Array().and.have.length(2)
            should(options.series[1].data).be.an.Array().and.have.length(2)

            // eCharts uses [x, y] format for data points
            should(options.series[0].data[0]).be.an.Array().and.have.length(2)
            should(options.series[0].data[0][0]).equal(2023) // x value
            should(options.series[0].data[0][1]).equal(2.31) // y value
            should(options.series[0].name).equal('New York')
            should(options.series[0].stack).equal('total') // stacked series should have stack property

            should(options.series[0].data[1]).be.an.Array().and.have.length(2)
            should(options.series[0].data[1][0]).equal(2024)
            should(options.series[0].data[1][1]).equal(2.41)

            should(options.series[1].data[0]).be.an.Array().and.have.length(2)
            should(options.series[1].data[0][0]).equal(2023)
            should(options.series[1].data[0][1]).equal(2.32)
            should(options.series[1].name).equal('Los Angeles')
            should(options.series[1].stack).equal('total') // stacked series should have stack property

            should(options.series[1].data[1]).be.an.Array().and.have.length(2)
            should(options.series[1].data[1][0]).equal(2024)
            should(options.series[1].data[1][1]).equal(2.42)
        })
    })
})
