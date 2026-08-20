describe('Node-RED Dashboard 2.0 - Button label wrapping (#151, #551)', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-button-wrap')
        cy.visit('/dashboard/page1')
    })

    it('wraps a long label instead of clipping it at each end', () => {
        const content = '#nrdb-ui-widget-dashboard-btn-long .v-btn__content'
        cy.get(content).should('have.css', 'white-space', 'normal')
        // eslint-disable-next-line promise/always-return, promise/catch-or-return
        cy.get(`${content} span`).then(($span) => {
            const range = $span[0].ownerDocument.createRange()
            range.selectNodeContents($span[0])
            expect(range.getClientRects().length, 'label lays out on multiple lines (wrapped, not clipped on one)').to.be.greaterThan(1)
        })
    })

    it('clamps the label so the button never overflows its cell', () => {
        const widget = '#nrdb-ui-widget-dashboard-btn-long'
        // eslint-disable-next-line promise/always-return, promise/catch-or-return
        cy.get(widget).then(($w) => {
            const cell = $w[0].getBoundingClientRect()
            const btn = $w[0].querySelector('.v-btn').getBoundingClientRect()
            expect(btn.bottom, 'button stays within its cell (no overflow past the card)').to.be.at.most(cell.bottom + 1)
        })
    })

    it('stays within its cell on the compact (32px row) theme too', () => {
        cy.visit('/dashboard/page2')
        cy.get('.nrdb-app').should('have.class', 'nrdb-view-density--compact')
        const widget = '#nrdb-ui-widget-dashboard-btn-long-compact'
        // eslint-disable-next-line promise/always-return, promise/catch-or-return
        cy.get(widget).then(($w) => {
            const cell = $w[0].getBoundingClientRect()
            const btn = $w[0].querySelector('.v-btn').getBoundingClientRect()
            expect(btn.bottom, 'compact button stays within its cell').to.be.at.most(cell.bottom + 1)
        })
    })
})
