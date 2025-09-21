/// <reference types="cypress" />
import should from 'should'

/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node/-RED Dashboard 2.0 - Chart Widget - chart options', () => {
    it('sets tooltip `trigger` to "axis" for line charts', () => {
        const chartName = 'line-chart-1'
        const overrides = [
            {
                id: 'chart-1', // the ID in the base flow fixture (required)
                mode: 'merge',
                data: {
                    label: chartName, // set the label
                    chartType: 'line' // change the chart type
                }
            }
        ]
        cy.deployFixture('dashboard-chart-options', overrides)
        cy.visit('/dashboard/page1')
        cy.reload()

        cy.get('#nrdb-ui-widget-chart-1 > div > div').should('exist')
        cy.clickAndWait(cy.get('button').contains('random'), 10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const chartObject = win.uiCharts['chart-1']
            should(chartObject).is.not.empty()
            const options = chartObject.chart.getOption()
            should(options.series[0].type).be.equal('line')
            should(options.tooltip).be.an.Array()
            should(options.tooltip[0]).be.an.Object()
            should(options.tooltip[0].trigger).be.equal('axis')
        })
    })

    it('sets tooltip `trigger` to "item" for scatter charts', () => {
        const chartName = 'scatter-chart-1'
        const overrides = [
            {
                id: 'chart-1', // the ID in the base flow fixture (required)
                mode: 'merge',
                data: {
                    label: chartName, // set the label
                    chartType: 'scatter' // change the chart type
                }
            }
        ]
        cy.deployFixture('dashboard-chart-options', overrides)
        cy.visit('/dashboard/page1')
        cy.reload()

        cy.get('#nrdb-ui-widget-chart-1 > div > div').should('exist')
        cy.clickAndWait(cy.get('button').contains('random'), 10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const chartObject = win.uiCharts['chart-1']
            should(chartObject).is.not.empty()
            const options = chartObject.chart.getOption()
            should(options.series[0].type).be.equal('scatter')
            should(options.tooltip).be.an.Array()
            should(options.tooltip[0]).be.an.Object()
            should(options.tooltip[0].trigger).be.equal('item')
        })
    })

    it('sets tooltip `trigger` to "axis" for bar charts', () => {
        const chartName = 'bar-chart-1'
        const overrides = [
            {
                id: 'chart-1', // the ID in the base flow fixture (required)
                mode: 'merge',
                data: {
                    label: chartName, // set the label
                    chartType: 'bar' // change the chart type
                }
            }
        ]
        cy.deployFixture('dashboard-chart-options', overrides)
        cy.visit('/dashboard/page1')
        cy.reload()

        cy.get('#nrdb-ui-widget-chart-1 > div > div').should('exist')
        cy.clickAndWait(cy.get('button').contains('random'), 10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const chartObject = win.uiCharts['chart-1']
            should(chartObject).is.not.empty()
            const options = chartObject.chart.getOption()
            should(options.series[0].type).be.equal('bar')
            should(options.tooltip).be.an.Array()
            should(options.tooltip[0]).be.an.Object()
            should(options.tooltip[0].trigger).be.equal('axis')
        })
    })

    it('sets tooltip `trigger` to "item" for doughnut charts', () => {
        const chartName = 'doughnut-chart-1'
        const overrides = [
            {
                id: 'chart-1', // the ID in the base flow fixture (required)
                mode: 'merge',
                data: {
                    label: chartName, // set the label
                    chartType: 'doughnut', // change the chart type
                    xAxisType: 'radial'
                }
            }
        ]
        cy.deployFixture('dashboard-chart-options', overrides)
        cy.visit('/dashboard/page1')
        cy.reload()

        cy.get('#nrdb-ui-widget-chart-1 > div > div').should('exist')
        cy.clickAndWait(cy.get('button').contains('random'), 10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const chartObject = win.uiCharts['chart-1']
            should(chartObject).is.not.empty()
            const options = chartObject.chart.getOption()
            should(options.series[0].type).be.equal('pie')
            should(options.tooltip).be.an.Array()
            should(options.tooltip[0]).be.an.Object()
            should(options.tooltip[0].trigger).be.equal('item')
        })
    })

    it('hides legend when option is unchecked, and there is a category', () => {
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

        cy.get('#nrdb-ui-widget-chart-1 > div > div').should('exist')
        cy.clickAndWait(cy.get('button').contains('random'), 10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const scatterChart = win.uiCharts['chart-1']
            should(scatterChart).is.not.empty()
            const options = scatterChart.chart.getOption()
            should(options.legend[0].show).be.false()
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

        cy.get('#nrdb-ui-widget-chart-1 > div > div').should('exist')
        cy.clickAndWait(cy.get('button').contains('random'), 10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const barChart = win.uiCharts['chart-1']
            should(barChart).is.not.empty()
            const options = barChart.chart.getOption()
            should(options.legend[0].show).be.true()
        })
    })
})
