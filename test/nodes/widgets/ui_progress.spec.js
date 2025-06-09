const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars
const sinon = require('sinon/lib/sinon.js')

// load test 1 standard test data (base, page, group, theme, progress)
const { testData1 } = require('../fixtures/index.js')
const { verifyFlowLoaded } = require('../utils.js')
const testFlow1 = testData1.flows
const nodeImports = testData1.getImports(null, ['ui_progress'])

helper.init(require.resolve('node-red'))

describe('ui-progress node', function () {
    beforeEach(function (done) {
        helper.startServer(done)
    })

    afterEach(function (done) {
        helper.unload()
        helper.stopServer(done)
    })

    const flow = [
        {
            id: 'node-ui-progress',
            type: 'ui-progress',
            z: 'tab-id',
            group: 'config-ui-group',
            name: '',
            label: 'Progress',
            order: 0,
            width: 0,
            height: 0,
            color: 'primary',
            className: '',
            x: 290,
            y: 180,
            wires: []
        },
        {
            id: 'helper-node',
            type: 'helper'
        },
        ...testFlow1
    ]

    it('should be loaded', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const progress = helper.getNode('node-ui-progress')
        should(progress).be.an.Object()
    })

    it('should be registered with the ui-base', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const base = helper.getNode('config-ui-base')
        should(base).be.an.Object()
        base.should.have.property('ui')
        base.ui.should.have.property('widgets')
        base.ui.widgets.has('node-ui-progress').should.be.true()
    })

    it('should be registered with the ui-base with the correct defaults', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const base = helper.getNode('config-ui-base')
        const widget = base.ui.widgets.get('node-ui-progress')

        // base config should be correct
        widget.id.should.equal('node-ui-progress')
        widget.type.should.equal('ui-progress')

        // default UI component state
        widget.should.have.property('state')
        widget.state.should.have.property('enabled', true)
        widget.state.should.have.property('visible', true)

        // check we have our properties set correctly
        widget.should.have.property('props')
        widget.props.should.have.property('label', flow[0].label)
        widget.props.should.have.property('color', flow[0].color)
    })

    it('should handle dynamic property updates via ui_update', async function () {
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const progress = helper.getNode('node-ui-progress')

        // spy on the statestore.set method to verify dynamic properties are set
        const statestore = require('../../../nodes/store/state.js')
        const setSpy = sinon.spy(statestore, 'set')

        // send message with ui_update for dynamic properties
        progress.receive({
            payload: 50,
            ui_update: {
                label: 'New Label',
                color: 'red'
            }
        })

        // verify the statestore.set was called for each dynamic property
        setSpy.callCount.should.equal(2)

        // check the first call (label update)
        const firstCall = setSpy.getCall(0)
        firstCall.args[3].should.equal('label')
        firstCall.args[4].should.equal('New Label')

        // check the second call (color update)
        const secondCall = setSpy.getCall(1)
        secondCall.args[3].should.equal('color')
        secondCall.args[4].should.equal('red')

        setSpy.restore()
    })

    it('should error if no group is configured', async function () {
        const flowWithoutGroup = [
            {
                id: 'node-ui-progress-no-group',
                type: 'ui-progress',
                z: 'tab-id',
                name: '',
                label: 'Progress',
                order: 0,
                width: 0,
                height: 0,
                color: 'primary',
                className: '',
                x: 290,
                y: 180,
                wires: []
            },
            ...testFlow1
        ]

        await helper.load(nodeImports, flowWithoutGroup)
        const progress = helper.getNode('node-ui-progress-no-group')
        should(progress).be.an.Object()

        // node should have logged an error about missing group
        const logEvents = helper.log().args.filter(args =>
            args[0].level === helper.log().ERROR &&
            args[0].id === 'node-ui-progress-no-group'
        )
        logEvents.should.have.length(1)
        logEvents[0][0].msg.should.equal('No group configured')
    })
})
