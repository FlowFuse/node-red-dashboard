/// <reference types="cypress" />
import should from 'should'

/* eslint-disable cypress/no-unnecessary-waiting */
describe('FlowFuse Dashboard - Chart - Type: Histogram', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-chart-histogram')
        cy.visit('/dashboard/page1')
    })

    it('renders charts with correct data with a "Categorical" x-axis type', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-histogram-1 > div > canvas').should('exist')

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then((win) => {
            should(win.uiCharts).is.not.empty()
            const histogram = win.uiCharts['dashboard-ui-chart-histogram-1']
            should(histogram).is.not.empty()
        })

        // clear chart first
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-clear-chart')) // Clear Chart
        // Add data - Series 1 - 3 x A, 1 x B, 2 x C
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-series1-A')) // A - Series 1
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-series1-A')) // A - Series 1
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-series1-A')) // A - Series 1
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-series1-B')) // B - Series 1
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-series1-C')) // C - Series 1
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-series1-C')) // C - Series 1

        // Add data - Series 2 - 2 x A, 3 x B, 1 x C
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-series2-A')) // C - Series 2
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-series2-A')) // C - Series 2
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-series2-B')) // C - Series 2
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-series2-B')) // C - Series 2
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-series2-B')) // C - Series 2
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-series2-C')) // C - Series 2

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const histogram = win.uiCharts['dashboard-ui-chart-histogram-1']

            // Check Data for Histogram
            should(histogram.chart.config.data).be.an.Object()
            should(histogram.chart.config.data.datasets).be.an.Array()

            cy.log('Histogram 1 Data')
            cy.log(histogram.chart.config.data)

            // 3 categories on the x-axis
            should(histogram.chart.config.data.labels).be.an.Array().and.have.length(3)
            should(histogram.chart.config.data.labels[0]).be.equal('A')
            should(histogram.chart.config.data.labels[1]).be.equal('B')
            should(histogram.chart.config.data.labels[2]).be.equal('C')

            // Two Series of Data
            should(histogram.chart.config.data.datasets).be.an.Array().and.have.length(2)
            should(histogram.chart.config.data.datasets[0].label).be.equal('Series 1')
            should(histogram.chart.config.data.datasets[1].label).be.equal('Series 2')

            // Check Series 1
            should(histogram.chart.config.data.datasets[0].data).be.an.Array().and.have.length(3)
            should(histogram.chart.config.data.datasets[0].data[0]).be.equal(3)
            should(histogram.chart.config.data.datasets[0].data[1]).be.equal(1)
            should(histogram.chart.config.data.datasets[0].data[2]).be.equal(2)

            // Check Series 2
            should(histogram.chart.config.data.datasets[1].data).be.an.Array().and.have.length(3)
            should(histogram.chart.config.data.datasets[1].data[0]).be.equal(2)
            should(histogram.chart.config.data.datasets[1].data[1]).be.equal(3)
            should(histogram.chart.config.data.datasets[1].data[2]).be.equal(1)
        })
    })

    it('renders charts with correct data with a "Bins" x-axis type', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-histogram-2 > div > canvas').should('exist')

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then((win) => {
            should(win.uiCharts).is.not.empty()
            const histogram = win.uiCharts['dashboard-ui-chart-histogram-2']
            should(histogram).is.not.empty()
        })

        // Load the data
        cy.clickAndWait(cy.get('#nrdb-ui-widget-dashboard-ui-button-load-bins'))

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const histogram = win.uiCharts['dashboard-ui-chart-histogram-2']

            // Check Data for Histogram
            should(histogram.chart.config.data).be.an.Object()
            should(histogram.chart.config.data.datasets).be.an.Array()

            // 10 bins on the x-axis
            should(histogram.chart.config.data.labels).be.an.Array().and.have.length(10)

            // 4 Datasets
            should(histogram.chart.config.data.datasets).be.an.Array().and.have.length(4)

            function checkArray (array, values) {
                should(array).be.an.Array().and.have.length(values.length)
                for (let i = 0; i < array.length; i++) {
                    should(array[i]).be.equal(values[i])
                }
            }

            // Check all datasets
            should(histogram.chart.config.data.datasets[0].label).be.equal('2.1.3')
            checkArray(histogram.chart.config.data.datasets[0].data, [0, 0, 0, 0, 0, 1, 0, 0, 0, 4])

            should(histogram.chart.config.data.datasets[1].label).be.equal('2.4.5')
            checkArray(histogram.chart.config.data.datasets[1].data, [0, 0, 1, 1, 0, 0, 1, 0, 0, 2])

            should(histogram.chart.config.data.datasets[2].label).be.equal('2.6.7')
            checkArray(histogram.chart.config.data.datasets[2].data, [0, 1, 1, 1, 0, 0, 1, 0, 0, 1])

            should(histogram.chart.config.data.datasets[3].label).be.equal('2.8.9')
            checkArray(histogram.chart.config.data.datasets[3].data, [0, 0, 0, 0, 0, 1, 0, 1, 1, 2])
        })
    })
})
