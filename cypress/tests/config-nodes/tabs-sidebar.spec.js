function openEditor () {
    cy.intercept({ method: 'GET', pathname: '/settings' }, (req) => {
        req.continue((res) => {
            res.body.telemetryEnabled = false
            res.body.editorTheme = { ...res.body.editorTheme, tours: false }
        })
    })
    cy.loadFlows()
    cy.window().its('RED.nodes').invoke('node', 'dashboard-ui-page-tabs').should('exist')
}

describe('Node-RED Dashboard 2.0 - Editor: Sidebar tabs', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-layouts')
        openEditor()
        cy.window().its('RED.sidebar').invoke('show', 'dashboard-2.0')
    })

    it('renders page tabs in order, followed by a No tab row holding untabbed groups', () => {
        cy.contains('.nrdb2-sb-pages-list-header .nrdb2-sb-title', /^Layout: Tabs$/).closest('li').within(() => {
            cy.get('.nrdb2-sb-tabs-list-header .nrdb2-sb-title').should((titles) => {
                expect([...titles].map((t) => t.textContent)).to.deep.equal(['Compose', 'Inbox', 'No tab'])
            })
            cy.get('.nrdb2-sb-untabbed-groups .nrdb2-sb-groups-list-header .nrdb2-sb-title').should('have.text', 'Loose')
        })
    })

    it('renders groups directly under pages without page tabs', () => {
        cy.contains('.nrdb2-sb-pages-list-header .nrdb2-sb-title', 'Layout: Tabs (no page tabs)').closest('li').within(() => {
            cy.get('.nrdb2-sb-tabs-list-header').should('not.exist')
            cy.get('.nrdb2-sb-groups-list-header').should('have.length', 4)
        })
        cy.contains('.nrdb2-sb-pages-list-header .nrdb2-sb-title', 'Layout: Grid').closest('li').within(() => {
            cy.get('.nrdb2-sb-tabs-list-header').should('not.exist')
        })
    })

    it('adds a group under No tab without touching existing groups', () => {
        cy.contains('.nrdb2-sb-pages-list-header .nrdb2-sb-title', /^Layout: Tabs$/).parent().find('a[title="Add Group"]').click({ force: true })
        cy.get('#node-config-dialog-ok').click()
        cy.get('#node-config-dialog-ok').should('not.exist')
        cy.window().its('RED').should((RED) => {
            const groups = []
            RED.nodes.eachConfig((n) => {
                if (n.type === 'ui-group' && n.page === 'dashboard-ui-page-tabs') {
                    groups.push(n)
                }
            })
            const added = groups.find((g) => !g.id.startsWith('dashboard-'))
            expect(added.order).to.equal(5)
            expect(added.tab || '').to.equal('')
            expect(groups.filter((g) => g !== added && g.changed).map((g) => g.id)).to.deep.equal([])
            const touchesAdded = (e) => (e.events || [e]).some((x) => x.node === added || (x.nodes || []).includes(added.id))
            expect(RED.history.list().filter(touchesAdded)).to.have.length(2)
        })
    })
})
