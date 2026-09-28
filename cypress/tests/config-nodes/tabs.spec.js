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

function editConfig (type, id) {
    cy.window().its('RED.editor').invoke('editConfig', '', type, id)
    cy.get('#node-config-dialog-ok').should('be.visible')
}

describe('Node-RED Dashboard 2.0 - Editor: Page tabs', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-layouts')
        openEditor()
    })

    it('shows the Tabs list only for the Tabs layout, with a hint while empty', () => {
        editConfig('ui-page', 'dashboard-ui-page-grid')
        cy.get('#node-config-container-tabs').should('not.be.visible')

        cy.window().invoke('$', '#node-config-input-layout').invoke('typedInput', 'value', 'tabs')
        cy.get('#node-config-container-tabs').should('be.visible')
        cy.get('#node-config-tabs-empty').should('be.visible')
        cy.get('#node-config-container-tabs .red-ui-editableList-border').should('have.css', 'display', 'none')

        cy.get('#node-config-container-tabs .red-ui-editableList-addButton').click()
        cy.get('#node-config-tabs-empty').should('not.be.visible')
        cy.get('#node-config-container-tabs .red-ui-editableList-border').should('not.have.css', 'display', 'none')
        cy.get('.node-input-tab-name').should('have.length', 1)
    })

    it('keeps existing tab ids when renaming and generates ids for new tabs', () => {
        editConfig('ui-page', 'dashboard-ui-page-tabs')
        cy.get('.node-input-tab-name').should('have.length', 2)
        cy.get('.node-input-tab-name').eq(0).clear()
        cy.get('.node-input-tab-name').eq(0).type('Compose renamed')
        cy.get('#node-config-container-tabs .red-ui-editableList-addButton').click()
        cy.get('.node-input-tab-name').eq(2).type('Settings')
        cy.get('#node-config-dialog-ok').click()

        cy.window().its('RED.nodes').invoke('node', 'dashboard-ui-page-tabs').its('tabs').should((tabs) => {
            expect(tabs.map((t) => t.name)).to.deep.equal(['Compose renamed', 'Inbox', 'Settings'])
            expect(tabs[0].id).to.equal('tab-compose')
            expect(tabs[1].id).to.equal('tab-inbox')
            expect(tabs[2].id).to.be.a('string').and.not.be.oneOf(['', 'tab-compose', 'tab-inbox'])
        })
    })
})

describe('Node-RED Dashboard 2.0 - Editor: Group tab', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-layouts')
        openEditor()
    })

    it('lists the page tabs and selects the group\'s tab', () => {
        editConfig('ui-group', 'dashboard-ui-group-tabs-inbox')
        cy.get('#node-config-row-tab').should('be.visible')
        cy.get('#node-config-input-tab option').should((options) => {
            expect([...options].map((o) => o.textContent)).to.deep.equal(['None (own tab)', 'Compose', 'Inbox'])
        })
        cy.get('#node-config-input-tab').should('have.value', 'tab-inbox')
    })

    it('hides and clears the tab when the group moves to a page without the Tabs layout', () => {
        editConfig('ui-group', 'dashboard-ui-group-tabs-inbox')
        cy.get('#node-config-input-page').select('dashboard-ui-page-grid')
        cy.get('#node-config-row-tab').should('not.be.visible')
        cy.get('#node-config-dialog-ok').click()

        cy.window().its('RED.nodes').invoke('node', 'dashboard-ui-group-tabs-inbox').its('tab').should('equal', '')
    })
})
