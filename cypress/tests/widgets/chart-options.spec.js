/// <reference types="cypress" />
import should from 'should'

/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node/-RED Dashboard 2.0 - Chart Widget - chart options', () => {
    it('sets tooltip `mode` to "nearest" for line charts', () => {
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

        cy.get('#nrdb-ui-widget-chart-1 > div > canvas').should('exist')
        cy.clickAndWait(cy.get('button').contains('random'), 10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const chartObject = win.uiCharts['chart-1']
            should(chartObject).is.not.empty()
            should(chartObject.chart.options.type).be.equal('line')
            should(chartObject.chart.options.interaction).be.an.Object()
            should(chartObject.chart.options.interaction.mode).be.equal('x')
            should(chartObject.chart.options.interaction).not.have.property('axis')
        })
    })

    it('sets tooltip `mode` to "nearest" and `axis` to "x" for scatter charts', () => {
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

        cy.get('#nrdb-ui-widget-chart-1 > div > canvas').should('exist')
        cy.clickAndWait(cy.get('button').contains('random'), 10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const chartObject = win.uiCharts['chart-1']
            should(chartObject).is.not.empty()
            should(chartObject.chart.options.type).be.equal('scatter')
            should(chartObject.chart.options.interaction).be.an.Object()
            should(chartObject.chart.options.interaction.mode).be.equal('nearest')
            should(chartObject.chart.options.interaction.axis).be.equal('x')
        })
    })

    it('sets tooltip `mode` to "index" for bar charts', () => {
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

        cy.get('#nrdb-ui-widget-chart-1 > div > canvas').should('exist')
        cy.clickAndWait(cy.get('button').contains('random'), 10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const chartObject = win.uiCharts['chart-1']
            should(chartObject).is.not.empty()
            should(chartObject.chart.options.type).be.equal('bar')
            should(chartObject.chart.options.interaction).be.an.Object()
            should(chartObject.chart.options.interaction.mode).be.equal('index')
            should(chartObject.chart.options.interaction).not.have.property('axis')
        })
    })

    it('sets tooltip `mode` to "index" for doughnut charts', () => {
        const chartName = 'doughnut-chart-1'
        const overrides = [
            {
                id: 'chart-1', // the ID in the base flow fixture (required)
                mode: 'merge',
                data: {
                    label: chartName, // set the label
                    chartType: 'doughnut' // change the chart type
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
            const chartObject = win.uiCharts['chart-1']
            should(chartObject).is.not.empty()
            should(chartObject.chart.options.type).be.equal('doughnut')
            should(chartObject.chart.options.interaction).be.an.Object()
            should(chartObject.chart.options.interaction.mode).be.equal('index')
            should(chartObject.chart.options.interaction).not.have.property('axis')
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
