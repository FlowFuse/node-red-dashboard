/// <reference types="cypress" />
import should from 'should'

/* eslint-disable cypress/no-unnecessary-waiting */
describe('Node/-RED Dashboard 2.0 - Chart Widget - line - max limits', () => {
    it('should limit the chart data to 3 points', () => {
        const overrides = [
            {
                id: 'chart-1', // the ID in the base flow fixture (required)
                mode: 'merge',
                data: {
                    name: 'line-append-max-3-points',
                    label: 'line-append-max-3-points',
                    removeOlder: 1, // 1 of unit (e.g. 1 x 3600 seconds == 1 hour)
                    removeOlderUnit: '3600', // seconds
                    removeOlderPoints: '3' // maximum of 3 points
                }
            }
        ]
        cy.deployFixture('dashboard-chart-line-max-limits', overrides)
        cy.visit('/dashboard/page1')
        cy.reload()

        cy.get('#nrdb-ui-widget-chart-1 > div > div').should('exist')
        // operate input button 5 times
        cy.clickAndWait(cy.get('button').contains('random'))
        cy.wait(10)
        cy.clickAndWait(cy.get('button').contains('random'))
        cy.wait(10)
        cy.clickAndWait(cy.get('button').contains('random'))
        cy.wait(10)
        cy.clickAndWait(cy.get('button').contains('random'))
        cy.wait(10)
        cy.clickAndWait(cy.get('button').contains('random'))
        cy.wait(10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const chart = win.uiCharts['chart-1']
            should(chart).is.not.empty()
            const options = chart.chart.getOption()
            should(options.series).be.an.Array()

            should(options.series).be.an.Array().and.have.length(1)
            should(options.series[0].data).be.an.Array().and.have.length(3)
        })
    })
    it('should limit the chart data to 3 seconds', () => {
        const overrides = [
            {
                id: 'chart-1', // the ID in the base flow fixture (required)
                mode: 'merge',
                data: {
                    name: 'line-append-max-3-seconds',
                    label: 'line-append-max-3-seconds',
                    removeOlder: '3', // 3 of unit (e.g. 3 x 1 seconds == 3 seconds)
                    removeOlderUnit: '1', // seconds
                    removeOlderPoints: ''
                }
            }
        ]
        cy.deployFixture('dashboard-chart-line-max-limits', overrides)
        cy.visit('/dashboard/page1')
        cy.reload()

        cy.get('#nrdb-ui-widget-chart-1 > div > div').should('exist')
        // operate input button (add 3 points)
        cy.clickAndWait(cy.get('button').contains('random'))
        cy.wait(10)
        cy.clickAndWait(cy.get('button').contains('random'))
        cy.wait(10)
        cy.clickAndWait(cy.get('button').contains('random'))

        // wait some time to allow data pruning to occur
        cy.wait(3500)

        // add 2 more points
        cy.clickAndWait(cy.get('button').contains('random'))
        cy.wait(10)
        cy.clickAndWait(cy.get('button').contains('random'))
        cy.wait(10)

        // eslint-disable-next-line promise/catch-or-return, promise/always-return
        cy.window().then(win => {
            should(win.uiCharts).is.not.empty()
            const chart = win.uiCharts['chart-1']
            should(chart).is.not.empty()
            const options = chart.chart.getOption()
            should(options.series).be.an.Array()

            should(options.series).be.an.Array().and.have.length(1)
            should(options.series[0].data).be.an.Array().and.have.length(2)
        })
    })
})
