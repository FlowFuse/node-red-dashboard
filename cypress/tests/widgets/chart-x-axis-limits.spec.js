/// <reference types="cypress" />
import should from 'should'

describe('Node-RED Dashboard 2.0 - Chart - X-Axis Limits', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-chart-x-axis-limits')
        cy.visit('/dashboard/page1')
    })

    it('applies the configured x-axis min/max to a linear x-axis', () => {
        cy.get('#nrdb-ui-widget-chart-scatter-limits > div > div').should('exist')

        cy.clickAndWait(cy.get('button').contains('xy data'))

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            const chart = win.uiCharts['chart-scatter-limits']
            const options = chart.chart.getOption()
            should(options.series[0].data).be.an.Array().and.have.length(2)
            should(options.xAxis[0].type).equal('value')
            should(options.xAxis[0].min).equal(0)
            should(options.xAxis[0].max).equal(50)
        })
    })

    it('scales a linear x-axis to the data when no min/max are configured', () => {
        cy.get('#nrdb-ui-widget-chart-scatter-auto > div > div').should('exist')

        cy.clickAndWait(cy.get('button').contains('xy data'))

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            const chart = win.uiCharts['chart-scatter-auto']
            const options = chart.chart.getOption()
            should(options.series[0].data).be.an.Array().and.have.length(2)
            should(options.xAxis[0].min).equal('dataMin')
            should(options.xAxis[0].max).be.undefined()
        })
    })

    it('ignores x-axis min/max on a timescale x-axis', () => {
        cy.get('#nrdb-ui-widget-chart-line-time > div > div').should('exist')

        cy.clickAndWait(cy.get('button').contains('xy data'))

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            const chart = win.uiCharts['chart-line-time']
            const options = chart.chart.getOption()
            should(options.series[0].data).be.an.Array().and.have.length(2)
            should(options.xAxis[0].type).equal('time')
            should(options.xAxis[0].min).equal('dataMin')
            should(options.xAxis[0].max).be.undefined()
        })
    })
})
