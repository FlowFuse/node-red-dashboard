/* eslint-disable promise/catch-or-return, promise/always-return, no-template-curly-in-string */
function openEditor () {
    cy.intercept({ method: 'GET', pathname: '/settings' }, (req) => {
        req.continue((res) => {
            res.body.telemetryEnabled = false
            res.body.editorTheme = { ...res.body.editorTheme, tours: false }
        })
    })
    cy.loadFlows()
    cy.window().its('RED.nodes').invoke('node', 'sizer-gauge-in').should('exist')
}

function registerContribType (win, type, defaults) {
    const template = win.document.createElement('script')
    template.type = 'text/html'
    template.setAttribute('data-template-name', type)
    template.innerHTML = `
        <div class="form-row">
            <label for="node-input-group">Group</label>
            <input type="text" id="node-input-group">
        </div>
        <div class="form-row">
            <label>Size</label>
            <input type="hidden" id="node-input-width">
            <input type="hidden" id="node-input-height">
            <button class="editor-button" id="node-input-size"></button>
        </div>`
    win.document.body.appendChild(template)
    win.RED.nodes.addNodeSet({ id: `test/${type}`, name: type, types: [type], enabled: true, module: 'test', version: '0.0.1', local: false, added: true })
    win.RED.nodes.registerType(type, {
        category: 'dashboard 2',
        defaults,
        inputs: 1,
        outputs: 0,
        oneditprepare: function () {
            win.$('#node-input-size').elementSizer({
                width: '#node-input-width',
                height: '#node-input-height',
                group: '#node-input-group'
            })
        }
    })
}

function addContribNodes () {
    cy.window().then((win) => {
        registerContribType(win, 'test-contrib', {
            group: { type: 'ui-group', required: true },
            order: { value: 0 },
            width: { value: 0 },
            height: { value: 0 }
        })
        registerContribType(win, 'test-contrib-noorder', {
            group: { type: 'ui-group', required: true },
            width: { value: 0 },
            height: { value: 0 }
        })
        win.RED.workspaces.show('sizer-sf')
        win.RED.nodes.import([
            { id: 'test-contrib-in', type: 'test-contrib', group: 'dashboard-ui-group', order: 7, width: 3, height: 1, x: 300, y: 60, wires: [] },
            { id: 'test-contrib-noorder-in', type: 'test-contrib-noorder', group: 'dashboard-ui-group', width: 3, height: 1, x: 300, y: 120, wires: [] }
        ])
        win.RED.workspaces.show('sizer-tab')
        win.RED.nodes.import([
            { id: 'test-contrib-out', type: 'test-contrib', group: 'dashboard-ui-group', order: 2, width: 3, height: 1, x: 300, y: 60, wires: [] }
        ])
    })
    cy.window().its('RED.nodes').invoke('node', 'test-contrib-in').its('z').should('equal', 'sizer-sf')
    cy.window().its('RED.nodes').invoke('node', 'test-contrib-out').its('z').should('equal', 'sizer-tab')
}

function edit (id) {
    cy.window().then((win) => {
        win.RED.editor.edit(win.RED.nodes.node(id))
    })
    cy.get('#node-dialog-ok').should('be.visible')
}

function editConfig (type, id) {
    cy.window().its('RED.editor').invoke('editConfig', '', type, id)
    cy.get('#node-config-dialog-ok').should('be.visible')
}

describe('Node-RED Dashboard 2.0 - Editor: element sizer in subflows', () => {
    beforeEach(() => {
        cy.deployFixture('dashboard-subflow-sizer')
        openEditor()
        addContribNodes()
    })

    it('renders width, height and order inputs for a contrib node in a subflow', () => {
        edit('test-contrib-in')
        cy.get('#node-input-size').should('not.be.visible')
        cy.get('.nr-db-ui-element-subflow-row').should('have.length', 3)
        cy.get('#node-input-width').should('have.attr', 'type', 'text').and('be.visible')
        cy.get('#node-input-height').should('have.attr', 'type', 'text').and('be.visible')
        cy.get('#node-input-order').should('have.value', '7')

        cy.get('#node-input-width').clear()
        cy.get('#node-input-width').type('${W}', { parseSpecialCharSequences: false })
        cy.get('#node-input-order').clear()
        cy.get('#node-input-order').type('5')
        cy.get('#node-dialog-ok').click()
        cy.window().its('RED.nodes').invoke('node', 'test-contrib-in').should((node) => {
            expect(node.width).to.equal('${W}')
            expect(Number(node.order)).to.equal(5)
        })
    })

    it('keeps the size button for a contrib node outside a subflow', () => {
        edit('test-contrib-out')
        cy.get('#node-input-size').should('be.visible')
        cy.get('.nr-db-ui-element-subflow-row').should('have.length', 0)
        cy.get('#node-input-order').should('not.exist')
    })

    it('does not duplicate rows when the sizer is initialised twice', () => {
        edit('test-contrib-in')
        cy.window().then((win) => {
            win.$('#node-input-size').elementSizer({
                width: '#node-input-width',
                height: '#node-input-height',
                group: '#node-input-group'
            })
        })
        cy.get('.nr-db-ui-element-subflow-row').should('have.length', 3)
    })

    it('keeps the size button for a ui-group scoped to a subflow', () => {
        editConfig('ui-group', 'sizer-group-in')
        cy.get('#node-config-input-size').should('be.visible')
        cy.get('.nr-db-ui-element-subflow-row').should('have.length', 0)
    })

    it('omits the order row for a contrib node without an order property', () => {
        edit('test-contrib-noorder-in')
        cy.get('.nr-db-ui-element-subflow-row').should('have.length', 2)
        cy.get('#node-input-width').should('be.visible')
        cy.get('#node-input-order').should('not.exist')
    })

    it('falls back to the active workspace when getEditStack is unavailable', () => {
        cy.window().then((win) => {
            win.RED.editor.getEditStack = undefined
            win.RED.workspaces.show('sizer-sf')
        })
        edit('test-contrib-in')
        cy.get('#node-input-size').should('not.be.visible')
        cy.get('#node-input-width').should('have.attr', 'type', 'text').and('be.visible')
        cy.get('#node-input-height').should('be.visible')
        cy.get('#node-input-order').should('not.exist')
        cy.get('#node-dialog-cancel').click()

        cy.window().then((win) => {
            win.RED.workspaces.show('sizer-tab')
        })
        edit('test-contrib-out')
        cy.get('#node-input-size').should('be.visible')
    })

    it('renders subflow inputs for a core widget via the sizer', () => {
        edit('sizer-gauge-in')
        cy.get('#node-input-size').should('not.be.visible')
        cy.get('.nr-db-ui-element-subflow-row').should('have.length', 3)
        cy.get('#node-input-width').should('have.attr', 'type', 'text').and('be.visible').and('have.value', '${W}')
        cy.get('#node-input-order').should('be.visible').and('have.value', '3')
    })

    it('keeps the size button for a core widget outside a subflow', () => {
        edit('sizer-gauge-out')
        cy.get('#node-input-size').should('be.visible')
        cy.get('.nr-db-ui-element-subflow-row').should('have.length', 0)
    })

    it('saves the order of a ui-spacer in a subflow', () => {
        editConfig('ui-spacer', 'sizer-spacer-in')
        cy.get('.nr-db-ui-element-subflow-row').should('have.length', 3)
        cy.get('#node-config-input-order').should('have.value', '4')
        cy.get('#node-config-input-order').clear()
        cy.get('#node-config-input-order').type('6')
        cy.get('#node-config-dialog-ok').click()
        cy.window().its('RED.nodes').invoke('node', 'sizer-spacer-in').its('order').should((order) => {
            expect(Number(order)).to.equal(6)
        })
    })

    it('hides ui-audio subflow inputs in text-to-speech mode without duplicating them', () => {
        edit('sizer-audio-in')
        cy.get('.nr-db-ui-element-subflow-row').should('have.length', 3).and('be.visible')
        cy.get('#node-input-mode').select('tts')
        cy.get('.nr-db-ui-element-subflow-row').should('not.be.visible')
        cy.get('#node-input-mode').select('src')
        cy.get('.nr-db-ui-element-subflow-row').should('have.length', 3).and('be.visible')
        cy.get('#node-input-size').should('not.be.visible')
    })
})
