/// <reference types="cypress" />
import should from 'should'

/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node/-RED Dashboard 2.0 - Chart Widget - bar - stacked', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-chart-bar-stacked')
        cy.visit('/dashboard/page1')
    })

    it('renders charts with correct data', () => {
        cy.get('#nrdb-ui-widget-stacked-bar-chart > div > canvas').should('exist')
        cy.clickAndWait(cy.get('button').contains('stack 2023'))
        cy.wait(10)
        cy.clickAndWait(cy.get('button').contains('stack 2024'))
        cy.wait(10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const barChart = win.uiCharts['stacked-bar-chart']
            should(barChart).is.not.empty()
            should(barChart.chart.config.data).be.an.Object()
            should(barChart.chart.config.data.datasets).be.an.Array()

            should(barChart.chart.config.data.datasets).be.an.Array().and.have.length(2)
            should(barChart.chart.config.data.datasets[0].data).be.an.Array().and.have.length(2)
            should(barChart.chart.config.data.datasets[1].data).be.an.Array().and.have.length(2)

            should(barChart.chart.config.data.datasets[0].data[0]).be.an.Object()
            should(barChart.chart.config.data.datasets[0].data[0].x).equal(2023)
            should(barChart.chart.config.data.datasets[0].data[0].year).equal(2023)
            should(barChart.chart.config.data.datasets[0].data[0].sales_millions).equal(2.31)
            should(barChart.chart.config.data.datasets[0].data[0].category).equal('New York')
            should(barChart.chart.config.data.datasets[0].data[0].location).equal('New York')

            should(barChart.chart.config.data.datasets[0].data[1]).be.an.Object()
            should(barChart.chart.config.data.datasets[0].data[1].x).equal(2024)
            should(barChart.chart.config.data.datasets[0].data[1].year).equal(2024)
            should(barChart.chart.config.data.datasets[0].data[1].sales_millions).equal(2.41)
            should(barChart.chart.config.data.datasets[0].data[1].category).equal('New York')
            should(barChart.chart.config.data.datasets[0].data[1].location).equal('New York')

            should(barChart.chart.config.data.datasets[1].data[0]).be.an.Object()
            should(barChart.chart.config.data.datasets[1].data[0].x).equal(2023)
            should(barChart.chart.config.data.datasets[1].data[0].year).equal(2023)
            should(barChart.chart.config.data.datasets[1].data[0].sales_millions).equal(2.32)
            should(barChart.chart.config.data.datasets[1].data[0].category).equal('Los Angeles')
            should(barChart.chart.config.data.datasets[1].data[0].location).equal('Los Angeles')

            should(barChart.chart.config.data.datasets[1].data[1]).be.an.Object()
            should(barChart.chart.config.data.datasets[1].data[1].x).equal(2024)
            should(barChart.chart.config.data.datasets[1].data[1].year).equal(2024)
            should(barChart.chart.config.data.datasets[1].data[1].sales_millions).equal(2.42)
            should(barChart.chart.config.data.datasets[1].data[1].category).equal('Los Angeles')
            should(barChart.chart.config.data.datasets[1].data[1].location).equal('Los Angeles')
        })
    })
})
