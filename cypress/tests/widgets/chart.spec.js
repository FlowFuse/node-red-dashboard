/// <reference types="cypress" />
import should from 'should'

/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node/-RED Dashboard 2.0 - Chart Widget', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-charts')
        cy.visit('/dashboard/page1')
    })

    it('renders bar charts with correct data', () => {
        cy.get('#nrdb-ui-widget-bar-chart-1 > div > canvas').should('exist')
        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const barChart = win.uiCharts['bar-chart-1']
            should(barChart).is.not.empty()
        })

        cy.clickAndWait(cy.get('button').contains('Button 1 (json)')) // bar chart

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then((win) => {
            const barChart = win.uiCharts['bar-chart-1']
            // Bar chart
            should(barChart.chart.config.data).be.an.Object()
            should(barChart.chart.config.data.datasets).be.an.Array()
            const checkBarElement = (index, data) => {
                should(barChart.chart.config.data.datasets[index].data[0]).have.property('x')
                should(barChart.chart.config.data.datasets[index].data[0]).have.property('location', data.location)
                should(barChart.chart.config.data.datasets[index].data[0]).have.property('sales_millions', data.sales_millions)
            }
            should(barChart.chart.config.data.datasets).be.an.Array().and.have.length(5)
            checkBarElement(0, { category: 'New York', location: 'New York', sales_millions: 3.2 })
            checkBarElement(1, { category: 'Los Angeles', location: 'Los Angeles', sales_millions: 2.5 })
            checkBarElement(2, { category: 'Chicago', location: 'Chicago', sales_millions: 1.8 })
            checkBarElement(3, { category: 'Houston', location: 'Houston', sales_millions: 2.9 })
            checkBarElement(4, { category: 'Miami', location: 'Miami', sales_millions: 2.1 })
        })
    })

    it('renders line charts with correct data', () => {
        cy.get('#nrdb-ui-widget-line-chart-1 > div > canvas').should('exist')
        cy.get('#nrdb-ui-widget-line-chart-2 > div > canvas').should('exist')

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const simpleLineChart = win.uiCharts['line-chart-1']
            const multiLineChart = win.uiCharts['line-chart-2']
            should(simpleLineChart).is.not.empty()
            should(multiLineChart).is.not.empty()
        })
        // simple line chart (inject 3 times)
        cy.clickAndWait(cy.get('button').contains('Button 3 (number)'))
        cy.wait(100)
        cy.clickAndWait(cy.get('button').contains('Button 3 (number)'))
        cy.wait(100)
        cy.clickAndWait(cy.get('button').contains('Button 3 (number)'))
        // multi-line chart
        cy.clickAndWait(cy.get('button').contains('Button 4 (json)'))

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            const simpleLineChart = win.uiCharts['line-chart-1']
            const multiLineChart = win.uiCharts['line-chart-2']
            // simple line chart
            should(simpleLineChart.chart.config.data.datasets).be.an.Array().and.have.length(1)
            should(simpleLineChart.chart.config.data.datasets[0].data).be.an.Array().and.have.length(3)
            should(simpleLineChart.chart.config.data.datasets[0].data[0]).have.property('x')
            should(simpleLineChart.chart.config.data.datasets[0].data[0].x).be.approximately(Date.now(), 5000) // x is a timestamp. following should be greater than previous
            should(simpleLineChart.chart.config.data.datasets[0].data[0]).have.property('y', 3)
            should(simpleLineChart.chart.config.data.datasets[0].data[1].x).be.greaterThan(simpleLineChart.chart.config.data.datasets[0].data[0].x)
            should(simpleLineChart.chart.config.data.datasets[0].data[1]).have.property('y', 3)
            should(simpleLineChart.chart.config.data.datasets[0].data[2].x).be.greaterThan(simpleLineChart.chart.config.data.datasets[0].data[1].x)
            should(simpleLineChart.chart.config.data.datasets[0].data[2]).have.property('y', 3)

            // multi line chart: uses a copy of the data from the chart fixture for the test
            // eslint-disable-next-line comma-spacing, quote-props, key-spacing, quotes, object-curly-spacing
            const data = [{"location":"New York","temp":56,"datestamp":1643784000000},{"location":"Los Angeles","temp":67,"datestamp":1643784000000},{"location":"Chicago","temp":44,"datestamp":1643784000000},{"location":"New York","temp":60,"datestamp":1643798400000},{"location":"Los Angeles","temp":71,"datestamp":1643798400000},{"location":"Chicago","temp":48,"datestamp":1643798400000},{"location":"New York","temp":65,"datestamp":1643812800000},{"location":"Los Angeles","temp":74,"datestamp":1643812800000},{"location":"Chicago","temp":52,"datestamp":1643812800000},{"location":"New York","temp":69,"datestamp":1643827200000},{"location":"Los Angeles","temp":77,"datestamp":1643827200000},{"location":"Chicago","temp":56,"datestamp":1643827200000},{"location":"New York","temp":73,"datestamp":1643841600000},{"location":"Los Angeles","temp":80,"datestamp":1643841600000},{"location":"Chicago","temp":60,"datestamp":1643841600000},{"location":"New York","temp":77,"datestamp":1643856000000},{"location":"Los Angeles","temp":82,"datestamp":1643856000000},{"location":"Chicago","temp":64,"datestamp":1643856000000},{"location":"New York","temp":80,"datestamp":1643870400000},{"location":"Los Angeles","temp":84,"datestamp":1643870400000},{"location":"Chicago","temp":68,"datestamp":1643870400},{"location":"New York","temp":83,"datestamp":1643884800000},{"location":"Los Angeles","temp":86,"datestamp":1643884800000},{"location":"Chicago","temp":72,"datestamp":1643884800000},{"location":"New York","temp":86,"datestamp":1643899200000},{"location":"Los Angeles","temp":88,"datestamp":1643899200000},{"location":"Chicago","temp":76,"datestamp":1643899200000},{"location":"New York","temp":89,"datestamp":16439136000000},{"location":"Los Angeles","temp":89,"datestamp":1643913600000},{"location":"Chicago","temp":80,"datestamp":1643913600000},{"location":"New York","temp":89,"datestamp":1643928000000},{"location":"Los Angeles","temp":88,"datestamp":1643928000000},{"location":"Chicago","temp":84,"datestamp":1643928000000},{"location":"New York","temp":86,"datestamp":1643942400000},{"location":"Los Angeles","temp":86,"datestamp":1643942400000},{"location":"Chicago","temp":88,"datestamp":1643942400000},{"location":"New York","temp":83,"datestamp":1643956800000},{"location":"Los Angeles","temp":84,"datestamp":1643956800000},{"location":"Chicago","temp":92,"datestamp":1643956800000},{"location":"New York","temp":79,"datestamp":1643971200000},{"location":"Los Angeles","temp":82,"datestamp":1643971200000},{"location":"Chicago","temp":96,"datestamp":1643971200000},{"location":"New York","temp":73,"datestamp":1643985600000},{"location":"Los Angeles","temp":80,"datestamp":1643985600000},{"location":"Chicago","temp":100,"datestamp":1643985600000},{"location":"New York","temp":66,"datestamp":1644000000000000},{"location":"Los Angeles","temp":78,"datestamp":1644000000000},{"location":"Chicago","temp":96,"datestamp":1644000000000},{"location":"New York","temp":59,"datestamp":1644014400000},{"location":"Los Angeles","temp":76,"datestamp":1644014400000},{"location":"Chicago","temp":92,"datestamp":1644014400000},{"location":"New York","temp":53,"datestamp":1644028800000},{"location":"Los Angeles","temp":74,"datestamp":1644028800000},{"location":"Chicago","temp":88,"datestamp":1644028800000},{"location":"New York","temp":47,"datestamp":1644043200000},{"location":"Los Angeles","temp":72,"datestamp":1644043200000},{"location":"Chicago","temp":84,"datestamp":1644043200000},{"location":"New York","temp":42,"datestamp":1644057600000},{"location":"Los Angeles","temp":70,"datestamp":1644057600000},{"location":"Chicago","temp":80,"datestamp":1644057600000},{"location":"New York","temp":39,"datestamp":1644072000000},{"location":"Los Angeles","temp":68,"datestamp":1644072000000},{"location":"Chicago","temp":76,"datestamp":1644072000000},{"location":"New York","temp":37,"datestamp":1644086400000},{"location":"Los Angeles","temp":66,"datestamp":1644086400000},{"location":"Chicago","temp":72,"datestamp":1644086400000},{"location":"New York","temp":36,"datestamp":1644100800000},{"location":"Los Angeles","temp":64,"datestamp":1644100800000},{"location":"Chicago","temp":68,"datestamp":1644100800000},{"location":"New York","temp":37,"datestamp":1644115200000},{"location":"Los Angeles","temp":62,"datestamp":1644115200000},{"location":"Chicago","temp":64,"datestamp":1644115200000}]
            const locNY = data.filter((d) => d.location === 'New York')
            const locLA = data.filter((d) => d.location === 'Los Angeles')
            const locCH = data.filter((d) => d.location === 'Chicago')
            should(multiLineChart.chart.config.data.datasets).be.an.Array().and.have.length(3) // 3 locations
            const dataSetNY = multiLineChart.chart.config.data.datasets.find((d) => d.label === 'New York')
            const dataSetLA = multiLineChart.chart.config.data.datasets.find((d) => d.label === 'Los Angeles')
            const dataSetCH = multiLineChart.chart.config.data.datasets.find((d) => d.label === 'Chicago')
            should(dataSetNY).be.an.Object()
            should(dataSetLA).be.an.Object()
            should(dataSetCH).be.an.Object()
            should(dataSetNY.data).be.an.Array().and.have.length(locNY.length)
            should(dataSetLA.data).be.an.Array().and.have.length(locLA.length)
            should(dataSetCH.data).be.an.Array().and.have.length(locCH.length)
            // check data
            const checkMultiLineElement = (dataSet, locationData) => {
                locationData.forEach((d, i) => {
                    should(dataSet.data[i]).have.property('category', d.location) // as the chart is configured to use category as location
                    should(dataSet.data[i]).have.property('location', d.location)
                    should(dataSet.data[i]).have.property('temp', d.temp)
                    should(dataSet.data[i]).have.property('x', d.datestamp)
                })
            }
            checkMultiLineElement(dataSetNY, locNY)
            checkMultiLineElement(dataSetLA, locLA)
            checkMultiLineElement(dataSetCH, locCH)
        })
    })

    it('renders scatter charts with correct data', () => {
        cy.get('#nrdb-ui-widget-scatter-chart-1 > div > canvas').should('exist')

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const scatterChart = win.uiCharts['scatter-chart-1']
            should(scatterChart).is.not.empty()
        })

        cy.clickAndWait(cy.get('button').contains('Button 2 (json)')) // scatter chart

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            // Scatter chart
            const scatterChart = win.uiCharts['scatter-chart-1']
            // scatter data [{"x":1,"y":2},{"x":3,"y":4},{"x":5.5,"y":6.6}]
            should(scatterChart.chart.config.data.datasets).be.an.Array().and.have.length(1)
            should(scatterChart.chart.config.data.datasets[0].data).be.an.Array().and.have.length(3)
            should(scatterChart.chart.config.data.datasets[0].data[0]).have.property('x', 1)
            should(scatterChart.chart.config.data.datasets[0].data[0]).have.property('y', 2)
            should(scatterChart.chart.config.data.datasets[0].data[1]).have.property('x', 3)
            should(scatterChart.chart.config.data.datasets[0].data[1]).have.property('y', 4)
            should(scatterChart.chart.config.data.datasets[0].data[2]).have.property('x', 5.5)
            should(scatterChart.chart.config.data.datasets[0].data[2]).have.property('y', 6.6)
        })
    })
})
