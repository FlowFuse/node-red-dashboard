/// <reference types="cypress" />
import should from 'should'

/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node-RED Dashboard 2.0 - Chart - Type: Histogram', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-chart-histogram')
        cy.visit('/dashboard/page1')
    })

    it('renders charts with correct data with a "Categorical" x-axis type', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-histogram-1 > div > div').should('exist')

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

            // Check Data for Histogram - eCharts structure
            const options = histogram.chart.getOption()
            should(options.series).be.an.Array()

            cy.log('Histogram 1 Data')
            cy.log(options)

            // 3 categories on the x-axis
            should(options.xAxis[0].data).be.an.Array().and.have.length(3)
            should(options.xAxis[0].data[0]).be.equal('A')
            should(options.xAxis[0].data[1]).be.equal('B')
            should(options.xAxis[0].data[2]).be.equal('C')

            // Two Series of Data
            should(options.series).be.an.Array().and.have.length(2)
            should(options.series[0].name).be.equal('Series 1')
            should(options.series[1].name).be.equal('Series 2')

            // Check Series 1
            should(options.series[0].data).be.an.Array().and.have.length(3)
            should(options.series[0].data[0]).be.equal(3)
            should(options.series[0].data[1]).be.equal(1)
            should(options.series[0].data[2]).be.equal(2)

            // Check Series 2
            should(options.series[1].data).be.an.Array().and.have.length(3)
            should(options.series[1].data[0]).be.equal(2)
            should(options.series[1].data[1]).be.equal(3)
            should(options.series[1].data[2]).be.equal(1)
        })
    })

    it('renders charts with correct data with a "Bins" x-axis type', () => {
        cy.get('#nrdb-ui-widget-dashboard-ui-chart-histogram-2 > div > div').should('exist')

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

            // Check Data for Histogram - eCharts structure
            const options = histogram.chart.getOption()
            should(options.series).be.an.Array()

            // 10 bins on the x-axis
            should(options.xAxis[0].data).be.an.Array().and.have.length(10)

            // 4 Datasets
            should(options.series).be.an.Array().and.have.length(4)

            function checkArray (array, values) {
                should(array).be.an.Array().and.have.length(values.length)
                for (let i = 0; i < array.length; i++) {
                    should(array[i]).be.equal(values[i])
                }
            }

            // Check all datasets
            should(options.series[0].name).be.equal('2.1.3')
            checkArray(options.series[0].data, [0, 0, 0, 0, 0, 1, 0, 0, 0, 4])

            should(options.series[1].name).be.equal('2.4.5')
            checkArray(options.series[1].data, [0, 0, 1, 1, 0, 0, 1, 0, 0, 2])

            should(options.series[2].name).be.equal('2.6.7')
            checkArray(options.series[2].data, [0, 1, 1, 1, 0, 0, 1, 0, 0, 1])

            should(options.series[3].name).be.equal('2.8.9')
            checkArray(options.series[3].data, [0, 0, 0, 0, 0, 1, 0, 1, 1, 2])
        })
    })
})
