/* eslint-disable cypress/no-unnecessary-waiting, promise/catch-or-return, promise/always-return */
const ORDER_ENV = 'DB2_SF_ORDER'

function openEditor () {
    cy.intercept({ method: 'GET', pathname: '/settings' }, (req) => {
        req.continue((res) => {
            res.body.telemetryEnabled = false
            res.body.editorTheme = { ...res.body.editorTheme, tours: false }
        })
    })
    cy.loadFlows()
    cy.window().its('RED.nodes').invoke('node', 'subflow-order-instance-1').should('exist')
    cy.window().its('RED.sidebar').invoke('show', 'dashboard-2.0')
}

// layout order entry of a subflow instance, in the current (`name`) or the legacy (`key`) format
function orderEntry (node) {
    return (node.env || []).find((e) => e.name === ORDER_ENV || e.key === ORDER_ENV)
}

function expectOrderEntry (id, value) {
    cy.window().its('RED.nodes').invoke('node', id).should((node) => {
        expect(orderEntry(node)).to.deep.equal({ name: ORDER_ENV, value, type: 'str' })
    })
}

function expectLayoutOrder (titles) {
    cy.contains('.nrdb2-sb-groups-list-header .nrdb2-sb-title', 'Group 1').closest('li')
        .find('.nrdb2-sb-widgets-list-header .nrdb2-sb-title')
        .should((elements) => {
            expect([...elements].map((e) => e.textContent)).to.deep.equal(titles)
        })
}

function expectHistoryDepthUnchanged (alias) {
    cy.get(alias).then((depth) => {
        cy.window().its('RED.history').invoke('depth').should('equal', depth)
    })
}

function openEditDialog (id) {
    cy.window().then((win) => win.RED.editor.edit(win.RED.nodes.node(id)))
    cy.get('#node-dialog-ok').should('be.visible')
}

function clickDone () {
    cy.get('#node-dialog-ok').click()
    cy.get('#node-dialog-ok').should('not.exist')
    cy.wait(500) // the refresh of the layout editor is debounced (300 ms)
}

describe('Node-RED Dashboard 2.0 - Editor: Subflow instance order', () => {
    it('keeps the layout position of a subflow instance when its edit dialog is closed with Done', () => {
        cy.deployFixture('dashboard-subflow-order')
        openEditor()
        expectLayoutOrder(['subflow 1', 'subflow 2'])

        openEditDialog('subflow-order-instance-2')
        cy.get('#node-input-subflow-env-label').parent().find('.red-ui-typedInput-input').as('labelInput')
        cy.get('@labelInput').type(' (edited)')
        cy.get('@labelInput').blur()
        clickDone()

        cy.window().its('RED.nodes').invoke('node', 'subflow-order-instance-2').its('env')
            .should('deep.include', { name: 'label', value: 'subflow 2 (edited)', type: 'str' })
        expectOrderEntry('subflow-order-instance-1', '1')
        expectOrderEntry('subflow-order-instance-2', '2')
        expectLayoutOrder(['subflow 1', 'subflow 2'])
    })

    it('converts legacy order entries into named env vars without marking the flow as changed', () => {
        cy.deployFixture('dashboard-subflow-order')
        openEditor()
        expectLayoutOrder(['subflow 1', 'subflow 2'])

        expectOrderEntry('subflow-order-instance-1', '1')
        expectOrderEntry('subflow-order-instance-2', '2')
        cy.window().its('RED.nodes').invoke('dirty').should('equal', false)
    })

    it('does not mark a subflow instance as changed when its edit dialog is closed with Done without changes', () => {
        cy.deployFixture('dashboard-subflow-order')
        openEditor()
        expectLayoutOrder(['subflow 1', 'subflow 2'])
        cy.window().its('RED.history').invoke('depth').as('historyDepth')

        openEditDialog('subflow-order-instance-1')
        clickDone()

        expectHistoryDepthUnchanged('@historyDepth')
        cy.window().its('RED.nodes').invoke('node', 'subflow-order-instance-1').should((node) => {
            expect(node.changed).to.not.equal(true)
        })
        expectLayoutOrder(['subflow 1', 'subflow 2'])
    })

    it('stores new order entries as named env vars with string values', () => {
        // subflow 2 has no order yet: the layout editor sorts it first, adds an entry and renumbers subflow 1
        cy.deployFixture('dashboard-subflow-order', [{
            mode: 'merge',
            id: 'subflow-order-instance-2',
            data: {
                env: [
                    { name: 'group', value: 'dashboard-ui-group', type: 'conf-type' },
                    { name: 'label', value: 'subflow 2', type: 'str' }
                ]
            }
        }])
        openEditor()
        expectLayoutOrder(['subflow 2', 'subflow 1'])
        expectOrderEntry('subflow-order-instance-2', '1')
        expectOrderEntry('subflow-order-instance-1', '2')
        cy.window().its('RED.history').invoke('depth').as('historyDepth')

        // the edit dialog keeps the entries as they are
        openEditDialog('subflow-order-instance-1')
        clickDone()

        expectHistoryDepthUnchanged('@historyDepth')
        expectLayoutOrder(['subflow 2', 'subflow 1'])
    })
})
