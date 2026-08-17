describe('Node-RED Dashboard 2.0 - Gauge dial fit (#1607)', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-gauge-half-fit')
        cy.visit('/dashboard/page1')
    })

    it('sizes the half-gauge to its arc, not the whole tall cell', () => {
        const widget = '#nrdb-ui-widget-dashboard-ui-gauge-half-tall'
        cy.get(widget).find('svg').should('be.visible')
        // eslint-disable-next-line promise/always-return, promise/catch-or-return
        cy.get(widget).then(($w) => {
            const cell = $w[0].getBoundingClientRect().height
            const svg = $w[0].querySelector('svg')
            const svgH = svg.getBoundingClientRect().height
            const svgW = svg.getBoundingClientRect().width
            // the arc is ~w/2 tall; the svg should hug that (+ label room), not stretch to the cell
            expect(svgH, 'svg sized to the arc, not the cell').to.be.lessThan(svgW / 2 + 40)
            expect(svgH, 'svg does not fill the tall cell').to.be.lessThan(cell - 40)
        })
    })

    it('sizes the 34 dial to its arc, not the whole tall cell', () => {
        const widget = '#nrdb-ui-widget-dashboard-ui-gauge-34-tall'
        cy.get(widget).find('svg').should('be.visible')
        // eslint-disable-next-line promise/always-return, promise/catch-or-return
        cy.get(widget).then(($w) => {
            const cell = $w[0].getBoundingClientRect().height
            const svg = $w[0].querySelector('svg')
            const svgH = svg.getBoundingClientRect().height
            const svgW = svg.getBoundingClientRect().width
            // the dial is ~min(w,h)=w tall here; the svg should hug that, not stretch to the cell
            expect(svgH, 'svg sized to the dial, not the cell').to.be.lessThan(svgW + 40)
            expect(svgH, 'svg does not fill the tall cell').to.be.lessThan(cell - 40)
        })
    })
})
