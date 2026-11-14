/// <reference types="cypress" />
import should from 'should'

describe('Node/-RED Dashboard 2.0 - Chart Widget - JSON series', () => {
    function checkSeries (series, name, values) {
        should(series).have.property('name', name)
        should(series.data).be.an.Array().and.have.length(values.length)
        for (let i = 0; i < values.length; i++) {
            // eCharts uses [x, y] format for data points
            should(series.data[i][0]).equal(values[i][0]) // x value
            should(series.data[i][1]).equal(values[i][1]) // y value
        }
    }

    function loadDashboard (overrides) {
        cy.deployFixture('dashboard-chart-series-json', overrides)
        // chart history is retained across deploys, so clear any data plotted by a previous test
        cy.request('POST', '/dashboard/chart/bar-chart-finance/clear')
        cy.visit('/dashboard/page1')
    }

    it('plots a series named after each key when "series" is a JSON array', () => {
        loadDashboard()

        cy.get('#nrdb-ui-widget-bar-chart-finance > div > div').should('exist')
        cy.clickAndWait(cy.get('button').contains('Load Finance Data'))

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const barChart = win.uiCharts['bar-chart-finance']
            should(barChart).is.not.empty()
            const options = barChart.chart.getOption()

            should(options.series).be.an.Array().and.have.length(4)
            checkSeries(options.series[0], 'Q1', [[2021, 115], [2022, 170], [2023, 86]])
            checkSeries(options.series[1], 'Q2', [[2021, 207], [2022, 200], [2023, 140]])
            checkSeries(options.series[2], 'Q3', [[2021, 198], [2022, 230], [2023, 180]])
            checkSeries(options.series[3], 'Q4', [[2021, 163], [2022, 210], [2023, 138]])
        })
    })

    it('plots a series with the given label for each key when "series" is a JSON object', () => {
        loadDashboard([
            {
                mode: 'merge',
                id: 'bar-chart-finance',
                data: {
                    category: '{ "Q1": "Quarter 1", "Q2": "Quarter 2", "Q3": "", "Q4": "Quarter 4" }'
                }
            }
        ])

        cy.get('#nrdb-ui-widget-bar-chart-finance > div > div').should('exist')
        cy.clickAndWait(cy.get('button').contains('Load Finance Data'))

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const barChart = win.uiCharts['bar-chart-finance']
            should(barChart).is.not.empty()
            const options = barChart.chart.getOption()

            should(options.series).be.an.Array().and.have.length(4)
            checkSeries(options.series[0], 'Quarter 1', [[2021, 115], [2022, 170], [2023, 86]])
            checkSeries(options.series[1], 'Quarter 2', [[2021, 207], [2022, 200], [2023, 140]])
            // no label provided, so the key is used as the series name
            checkSeries(options.series[2], 'Q3', [[2021, 198], [2022, 230], [2023, 180]])
            checkSeries(options.series[3], 'Quarter 4', [[2021, 163], [2022, 210], [2023, 138]])
        })
    })
})
