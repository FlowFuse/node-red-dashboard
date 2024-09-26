/// <reference types="cypress" />
import should from 'should'

/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node/-RED Dashboard 2.0 - Chart Widget - chart options', () => {
    it('resets tooltip mode to "nearest" for bar charts', () => {
        const chartName = 'bar-chart-1'
        const overrides = [
            {
                id: 'chart-1', // the ID in the base flow fixture (required)
                mode: 'merge',
                data: {
                    label: chartName, // set the label
                    chartType: 'bar' // change the chart type to bar
                }
            }
        ]
        cy.deployFixture('dashboard-chart-options', overrides)
        cy.visit('/dashboard/page1')
        cy.reload()

        cy.get('#nrdb-ui-widget-chart-1 > div > canvas').should('exist')
        cy.clickAndWait(cy.get('button').contains('random'), 10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const barChart = win.uiCharts['chart-1']
            should(barChart).is.not.empty()
            should(barChart.chart.options.interaction).be.an.Object()
            should(barChart.chart.options.interaction.mode).be.equal('nearest')
            should(barChart.chart.options.interaction.axis).not.equal('x')
        })
    })

    it('sets tooltip mode to "index" and axis x for line charts', () => {
        const chartName = 'line-chart-1'
        const overrides = [
            {
                id: 'chart-1', // the ID in the base flow fixture (required)
                mode: 'merge',
                data: {
                    label: chartName, // set the label
                    chartType: 'line' // change the chart type to line
                }
            }
        ]
        cy.deployFixture('dashboard-chart-options', overrides)
        cy.visit('/dashboard/page1')
        cy.reload()

        cy.get('#nrdb-ui-widget-chart-1 > div > canvas').should('exist')
        cy.clickAndWait(cy.get('button').contains('random'), 10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const lineChart = win.uiCharts['chart-1']
            should(lineChart).is.not.empty()
            should(lineChart.chart.options.interaction).be.an.Object()
            should(lineChart.chart.options.interaction.mode).be.equal('index')
            should(lineChart.chart.options.interaction.axis).be.equal('x')
        })
    })

    it('hides legend when option is unchecked', () => {
        const overrides = [
            {
                id: 'chart-1', // the ID in the base flow fixture (required)
                mode: 'merge',
                data: {
                    label: 'scatter-without-legend', // set the label
                    chartType: 'scatter', // change the chart type to scatter
                    showLegend: false // hide the legend
                }
            }
        ]
        cy.deployFixture('dashboard-chart-options', overrides)
        cy.visit('/dashboard/page1')
        cy.reload()

        cy.get('#nrdb-ui-widget-chart-1 > div > canvas').should('exist')
        cy.clickAndWait(cy.get('button').contains('random'), 10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const barChart = win.uiCharts['chart-1']
            should(barChart).is.not.empty()
            should(barChart.chart.options.plugins.legend.display).be.false()
        })
    })

    it('Shows legend when option is checked', () => {
        const overrides = [
            {
                id: 'chart-1', // the ID in the base flow fixture (required)
                mode: 'merge',
                data: {
                    label: 'scatter-chart-with-legend', // set the label
                    chartType: 'scatter', // change the chart type to scatter
                    showLegend: true // show the legend
                }
            }
        ]
        cy.deployFixture('dashboard-chart-options', overrides)
        cy.visit('/dashboard/page1')
        cy.reload()

        cy.get('#nrdb-ui-widget-chart-1 > div > canvas').should('exist')
        cy.clickAndWait(cy.get('button').contains('random'), 10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const barChart = win.uiCharts['chart-1']
            should(barChart).is.not.empty()
            should(barChart.chart.options.plugins.legend.display).be.true()
        })
    })
})
