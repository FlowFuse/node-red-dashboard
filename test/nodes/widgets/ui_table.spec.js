const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars
const sinon = require('sinon')

const datastore = require('../../../nodes/store/data.js')
const statestore = require('../../../nodes/store/state.js')

// load test 1 standard test data (base, page, group, theme, audio)
const { testData1 } = require('../fixtures/index.js')
const { getBaseRegisterCallAndParams, registerHelperSpies, unRegisterHelperSpies } = require('../utils.js')
const { verifyFlowLoaded } = require('../utils.js')
const testFlow1 = testData1.flows
const nodeImports = testData1.getImports(null, ['ui_table'])

helper.init(require.resolve('node-red'))
const flow1 = [
    {
        id: 'node-ui-table',
        type: 'ui-table',
        z: 'tab-id',
        group: 'config-ui-group',
        name: 'node-ui-table',
        label: 'table label',
        order: 0,
        width: 0,
        height: 0,
        maxrows: '9',
        passthru: true,
        autocols: true,
        showSearch: true,
        deselect: true,
        selectionType: 'click',
        columns: [],
        mobileBreakpoint: 'sm',
        mobileBreakpointType: 'px',
        action: 'append',
        className: 'c1',
        x: 200,
        y: 200,
        wires: [
            ['helper-node']
        ]
    },
    {
        id: 'helper-node',
        type: 'helper'
    },
    ...testFlow1
]

describe('ui-table node', function () {
    const flow = flow1
    beforeEach(function (done) {
        helper.startServer(done)
        registerHelperSpies(sinon, helper)
    })

    afterEach(function (done) {
        unRegisterHelperSpies(helper)
        sinon.restore()
        helper.unload()
        helper.stopServer(done)
    })

    it('should be loaded', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const table = helper.getNode('node-ui-table')
        should(table).be.an.Object()
    })

    it('should be registered with the ui-base', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const base = helper.getNode('config-ui-base')
        const group = helper.getNode('config-ui-group')
        const page = helper.getNode('config-ui-page')

        // src mode should only call base.register, group.register, page.register
        group.register.called.should.be.true()
        group.register.getCalls().filter(call => call.args[0]?.id === 'node-ui-table').length.should.equal(1)
        page.register.called.should.be.true()
        page.register.getCalls().filter(call => call.args[1]?.id === 'node-ui-table').length.should.equal(1)
        base.register.called.should.be.true()
        base.register.getCalls().filter(call => call.args[2]?.id === 'node-ui-table').length.should.equal(1)

        base.should.have.property('ui')
        base.ui.should.have.property('widgets')
        base.ui.widgets.has('node-ui-table').should.be.true()
    })
    it('should call RED.nodes.createNode with node and ui-group config', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const node = helper.getNode('node-ui-table')
        node.should.have.property('name', 'node-ui-table')
        helper._RED.nodes.createNode.called.should.be.true()
        const createNodeCall = helper._RED.nodes.createNode.getCalls().find(call => call.args[0]?.id === 'node-ui-table')
        should(createNodeCall).be.not.undefined()
        const createNodeNode = createNodeCall.args[0]
        createNodeNode.should.have.property('name', 'node-ui-table')
        const createNodeConfig = createNodeCall.args[1]
        createNodeConfig.should.have.property('group', 'config-ui-group')
    })
    it('should be registered with the ui-base with the correct values', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const base = helper.getNode('config-ui-base')
        const widget = base.ui.widgets.get('node-ui-table')
        const { registerPage, registerGroup, registerNode, registerConfig, registerEvents } = getBaseRegisterCallAndParams(base, 'node-ui-table')
        registerGroup.should.have.property('id', 'config-ui-group')
        registerPage.should.have.property('id', 'config-ui-page')
        registerNode.should.have.property('id', 'node-ui-table')

        registerConfig.should.have.property('group', 'config-ui-group')
        registerEvents.should.have.property('onAction', true)
        registerEvents.should.have.property('onInput').which.is.a.Function()

        // base config should be correct
        widget.id.should.equal('node-ui-table')
        widget.type.should.equal('ui-table')

        // default UI component state
        widget.should.have.property('state')
        widget.state.should.have.property('enabled', true)
        widget.state.should.have.property('visible', true)

        // check we have our properties set correctly
        widget.should.have.property('props')
        widget.props.should.have.property('maxrows', 9)
        widget.props.should.have.property('passthru', true)
        widget.props.should.have.property('autocols', true)
        widget.props.should.have.property('showSearch', true)
        widget.props.should.have.property('deselect', true)
        widget.props.should.have.property('selectionType', 'click')
        should(widget.props.columns).be.an.Array()
        widget.props.should.have.property('mobileBreakpoint', 'sm')
        widget.props.should.have.property('mobileBreakpointType', 'px')
        widget.props.should.have.property('action', 'append')
        widget.props.should.have.property('className', 'c1')
    })
    it('should call node.error when group is not configured', async function () {
        const updatedFlow = JSON.parse(JSON.stringify(flow))
        updatedFlow[0].ui = ''
        updatedFlow[0].group = 'xxx'
        await helper.load(nodeImports, updatedFlow)
        verifyFlowLoaded(helper, updatedFlow)
        const node = helper.getNode('node-ui-table')
        node.error.called.should.be.true()
        const errorCall = node.error.getCall(0)
        const errorMsg = errorCall.args[0]
        errorMsg.should.equal('No group configured')
    })

    describe('maxrows property', function () {
        it('should set maxrows 0 if not set', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].maxrows = ''
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const base = helper.getNode('config-ui-base')
            const widget = base.ui.widgets.get('node-ui-table')
            widget.props.should.have.property('maxrows', 0)
        })
        it('should set maxrows 0 if minus value set', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].maxrows = '-1'
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const base = helper.getNode('config-ui-base')
            const widget = base.ui.widgets.get('node-ui-table')
            widget.props.should.have.property('maxrows', 0)
        })
        it('should set maxrows 0 if incorrectly set', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].maxrows = 'randomString'
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const base = helper.getNode('config-ui-base')
            const widget = base.ui.widgets.get('node-ui-table')
            widget.props.should.have.property('maxrows', 0)
        })
        it('should accept maxrows as string number', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].maxrows = '5'
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const base = helper.getNode('config-ui-base')
            const widget = base.ui.widgets.get('node-ui-table')
            widget.props.should.have.property('maxrows', 5)
        })
        it('should accept maxrows as number', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].maxrows = 5
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const base = helper.getNode('config-ui-base')
            const widget = base.ui.widgets.get('node-ui-table')
            widget.props.should.have.property('maxrows', 5)
        })
    })

    describe('columns property', function () {
        it('should accept columns definition', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].columns = [
                { title: 'Column 1', key: 'col1', type: 'string', width: '', align: 'left' },
                { title: 'Column 2', key: 'col2', type: 'number', width: '100', align: 'right' }
            ]
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const base = helper.getNode('config-ui-base')
            const widget = base.ui.widgets.get('node-ui-table')
            widget.props.should.have.property('columns')
            widget.props.columns.should.be.an.Array().and.have.length(2)
            widget.props.columns[0].should.deepEqual({ title: 'Column 1', key: 'col1', type: 'string', width: '', align: 'left' })
            widget.props.columns[1].should.deepEqual({ title: 'Column 2', key: 'col2', type: 'number', width: '100', align: 'right' })
        })

        it('should map older label property to title in columns definition', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].columns = [
                { label: 'Column 1', key: 'col1', type: 'string', width: '', align: 'left' },
                { label: 'Column 2', key: 'col2', type: 'number', width: '100', align: 'right' }
            ]
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const base = helper.getNode('config-ui-base')
            const widget = base.ui.widgets.get('node-ui-table')
            widget.props.should.have.property('columns')
            widget.props.columns.should.be.an.Array().and.have.length(2)
            widget.props.columns[0].should.have.property('title', 'Column 1')
            widget.props.columns[1].should.have.property('title', 'Column 2')
        })
        it('should set columns to undefined if not an array', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].columns = 'invalid-columns-definition'
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const base = helper.getNode('config-ui-base')
            const widget = base.ui.widgets.get('node-ui-table')
            should(widget.props.columns).be.undefined()
        })
    })

    describe('action property', function () {
        it('should default action to append if value is not set', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].action = ''
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const base = helper.getNode('config-ui-base')
            const widget = base.ui.widgets.get('node-ui-table')
            widget.props.should.have.property('action', 'append')
        })
        it('should set action to append if invalid value set', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].action = 'invalid-action'
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const base = helper.getNode('config-ui-base')
            const widget = base.ui.widgets.get('node-ui-table')
            widget.props.should.have.property('action', 'append')
        })
    })
    describe('className property', function () {
        it('should accept class name', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].className = 'my-custom-class'
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const base = helper.getNode('config-ui-base')
            const widget = base.ui.widgets.get('node-ui-table')
            widget.props.should.have.property('className', 'my-custom-class')
        })
    })
    describe('statestore', function () {
        it('should initialize state in statestore', async function () {
            await helper.load(nodeImports, flow)
            verifyFlowLoaded(helper, flow)
            statestore.getProperty('node-ui-table', 'visible').should.equal(true)
            statestore.getProperty('node-ui-table', 'enabled').should.equal(true)
            statestore.getProperty('node-ui-table', 'class').should.equal('')
        })
        it('dynamically updates state', async function () {
            await helper.load(nodeImports, flow)
            verifyFlowLoaded(helper, flow)
            const node = helper.getNode('node-ui-table')
            node.receive({ visible: false })
            statestore.getProperty('node-ui-table', 'visible').should.equal(false)
            statestore.getProperty('node-ui-table', 'enabled').should.equal(true)
            statestore.getProperty('node-ui-table', 'class').should.equal('')
            node.receive({ enabled: false })
            statestore.getProperty('node-ui-table', 'visible').should.equal(false)
            statestore.getProperty('node-ui-table', 'enabled').should.equal(false)
            statestore.getProperty('node-ui-table', 'class').should.equal('')
            node.receive({ class: 'new-class', enabled: true, visible: true })
            statestore.getProperty('node-ui-table', 'enabled').should.equal(true)
            statestore.getProperty('node-ui-table', 'visible').should.equal(true)
            statestore.getProperty('node-ui-table', 'class').should.equal('new-class')
        })
    })

    describe('datastore', function () {
        it('should append data on input when action is append', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const node = helper.getNode('node-ui-table')
            const testMsg1 = { payload: [{ col1: 'r1c1', col2: 'r1c2' }] }
            const testMsg2 = { payload: [{ col1: 'r2c1', col2: 'r2c2' }] }
            node.receive(testMsg1)
            let existingData = datastore.get('node-ui-table')
            existingData.should.be.an.Object()
            existingData.payload.should.be.an.Array().and.have.length(1)
            existingData.payload[0].should.deepEqual({ col1: 'r1c1', col2: 'r1c2' })
            node.receive(testMsg2)
            existingData = datastore.get('node-ui-table')
            existingData.should.be.an.Object()
            existingData.payload.should.be.an.Array().and.have.length(2)
            existingData.payload[0].should.deepEqual({ col1: 'r1c1', col2: 'r1c2' })
            existingData.payload[1].should.deepEqual({ col1: 'r2c1', col2: 'r2c2' })
        })
        it('should replace data on input when action is replace', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].action = 'replace'
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const node = helper.getNode('node-ui-table')
            const testMsg1 = { payload: [{ col1: 'r1c1', col2: 'r1c2' }] }
            const testMsg2 = { payload: [{ col1: 'r2c1', col2: 'r2c2' }] }
            node.receive(testMsg1)
            let existingData = datastore.get('node-ui-table')
            existingData.should.be.an.Object()
            existingData.payload.should.be.an.Array().and.have.length(1)
            existingData.payload[0].should.deepEqual({ col1: 'r1c1', col2: 'r1c2' })
            node.receive(testMsg2)
            existingData = datastore.get('node-ui-table')
            existingData.should.be.an.Object()
            existingData.payload.should.be.an.Array().and.have.length(1)
            existingData.payload[0].should.deepEqual({ col1: 'r2c1', col2: 'r2c2' })
        })
        it('should format non-array object payload into array containing object', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].action = 'replace'
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const node = helper.getNode('node-ui-table')
            const testMsg1 = { payload: { col1: 'r1c1', col2: 'r1c2' } }
            node.receive(testMsg1)
            const existingData = datastore.get('node-ui-table')
            existingData.should.be.an.Object()
            existingData.payload.should.be.an.Array().and.have.length(1)
            existingData.payload[0].should.deepEqual({ col1: 'r1c1', col2: 'r1c2' })
        })
    })
})
