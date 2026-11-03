const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars
const sinon = require('sinon/lib/sinon.js')

// load test 1 standard test data (base, page, group, theme) plus a button to act as a widget target
const { testData1 } = require('../fixtures/index.js')
const { verifyFlowLoaded } = require('../utils.js')
const testFlow1 = testData1.flows
const nodeImports = testData1.getImports(null, ['ui_control', 'ui_button'])

helper.init(require.resolve('node-red'))

describe('ui-control node', function () {
    beforeEach(function (done) {
        helper.startServer(done)
    })

    afterEach(function (done) {
        helper.unload()
        helper.stopServer(done)
    })

    function control (id, props) {
        return {
            id,
            type: 'ui-control',
            z: 'tab-id',
            name: '',
            ui: 'config-ui-base',
            events: 'all',
            wires: [[]],
            ...props
        }
    }

    const button = {
        id: 'node-ui-button',
        type: 'ui-button',
        z: 'tab-id',
        group: 'config-ui-group',
        name: 'Save',
        label: 'Save',
        payload: '',
        payloadType: 'str',
        topic: 'topic',
        topicType: 'msg',
        wires: [[]]
    }

    /**
     * Load a flow, add a fake socket connection, send a msg into the ui-control node
     * and resolve with the payloads it emitted to the UI and the node error, if any
     */
    async function runControl (controlNode, msg) {
        const flow = [controlNode, button, ...testFlow1]
        await helper.load(nodeImports, flow)
        verifyFlowLoaded(helper, flow)
        const base = helper.getNode('config-ui-base')
        const socket = { id: 'fake-conn-id', emit: sinon.spy() }
        base.uiShared.connections['fake-conn-id'] = socket

        const node = helper.getNode(controlNode.id)
        const emitted = () => socket.emit.args
            .filter(args => args[0] === 'ui-control:' + controlNode.id)
            .map(args => args[1].payload)
        node.receive(msg)
        // ui-base runs the input handler asynchronously, give it a moment
        await new Promise(resolve => setTimeout(resolve, 50))
        // the test helper spies on node.error
        return { payloads: emitted(), error: node.error.called ? node.error.args[0][0] : null }
    }

    async function sendToControl (controlNode, msg) {
        const { payloads, error } = await runControl(controlNode, msg)
        if (error) {
            throw error
        }
        return payloads
    }

    describe('output "None"', function () {
        it('adds socket listeners when the output is used', async function () {
            const flow = [control('ctl-all'), ...testFlow1]
            await helper.load(nodeImports, flow)
            const widget = helper.getNode('config-ui-base').ui.widgets.get('ctl-all')
            widget.hooks.should.have.property('onSocket')
            Object.keys(widget.hooks.onSocket).should.containDeep(['connection', 'disconnect', 'ui-control'])
        })

        it('adds no socket listeners when the output is "None"', async function () {
            const flow = [control('ctl-none', { events: 'none' }), ...testFlow1]
            await helper.load(nodeImports, flow)
            const widget = helper.getNode('config-ui-base').ui.widgets.get('ctl-none')
            should(widget).be.an.Object()
            widget.hooks.should.not.have.property('onSocket')
            // it can still be sent commands
            widget.hooks.should.have.property('onInput')
        })

        it('keeps socket listeners for older nodes with no events setting', async function () {
            const legacy = control('ctl-legacy')
            delete legacy.events
            await helper.load(nodeImports, [legacy, ...testFlow1])
            const widget = helper.getNode('config-ui-base').ui.widgets.get('ctl-legacy')
            widget.hooks.should.have.property('onSocket')
        })
    })

    describe('actions configured in the editor', function () {
        it('ignores the configured actions when using msg.payload', async function () {
            const node = control('ctl', {
                inputMode: 'payload',
                actions: [{ action: 'hide', targetType: 'group', target: 'config-ui-group' }]
            })
            const payloads = await sendToControl(node, { payload: { groups: { show: ['Group 1'] } } })
            payloads.should.have.length(1)
            payloads[0].should.eql({ groups: { show: ['config-ui-group'] } })
        })

        it('builds one payload of ids from page, group and widget actions', async function () {
            const node = control('ctl', {
                inputMode: 'actions',
                actions: [
                    { action: 'navigate', targetType: 'page', target: 'config-ui-page' },
                    { action: 'disable', targetType: 'page', target: 'config-ui-page' },
                    { action: 'hide', targetType: 'group', target: 'config-ui-group' },
                    { action: 'disable', targetType: 'widget', target: 'node-ui-button' }
                ]
            })
            const payloads = await sendToControl(node, { payload: 'ignored' })
            payloads.should.have.length(1)
            payloads[0].should.eql({
                page: 'Page 1', // the UI routes by page name
                pages: { disable: ['config-ui-page'] },
                groups: { hide: ['config-ui-group'] },
                widgets: { disable: ['node-ui-button'] }
            })
        })

        it('maps next, previous and refresh to the msg.payload.page values', async function () {
            for (const [targetType, page] of [['next', '+1'], ['prev', '-1'], ['refresh', '']]) {
                const node = control('ctl', { inputMode: 'actions', actions: [{ action: 'navigate', targetType }] })
                const payloads = await sendToControl(node, {})
                payloads[0].should.have.property('page', page)
                helper.unload()
            }
        })

        it('resolves names and ids from a msg property', async function () {
            const node = control('ctl', {
                inputMode: 'actions',
                actions: [
                    { action: 'navigate', targetType: 'msg', target: 'goto' },
                    { action: 'show', targetType: 'msg', target: 'targets' }
                ]
            })
            const payloads = await sendToControl(node, {
                goto: 'config-ui-page', // an id is turned into the page name
                targets: ['Page 1', 'Page 1:Group 1', 'node-ui-button']
            })
            payloads.should.have.length(1)
            payloads[0].should.eql({
                page: 'Page 1',
                pages: { show: ['config-ui-page'] },
                groups: { show: ['config-ui-group'] },
                widgets: { show: ['node-ui-button'] }
            })
        })

        it('reports a missing msg property instead of refreshing the page', async function () {
            const node = control('ctl', { inputMode: 'actions', actions: [{ action: 'navigate', targetType: 'msg', target: 'goto' }] })
            await sendToControl(node, {}).should.be.rejectedWith(/msg.goto is not set/)
        })

        it('reports a msg value that matches nothing', async function () {
            const node = control('ctl', { inputMode: 'actions', actions: [{ action: 'hide', targetType: 'msg', target: 'what' }] })
            await sendToControl(node, { what: 'Nope' }).should.be.rejectedWith(/No page, group or widget found/)
        })

        it('reports a configured target that no longer exists', async function () {
            const node = control('ctl', { inputMode: 'actions', actions: [{ action: 'hide', targetType: 'group', target: 'deleted-group' }] })
            await sendToControl(node, {}).should.be.rejectedWith(/No group found/)
        })
    })

    describe('msg.payload', function () {
        it('emits once with ids when pages and groups are sent together (#2315)', async function () {
            const payloads = await sendToControl(control('ctl'), {
                payload: { pages: { enable: ['Page 1'] }, groups: { show: ['Page 1:Group 1'] } }
            })
            payloads.should.have.length(1)
            payloads[0].should.eql({
                pages: { enable: ['config-ui-page'] },
                groups: { show: ['config-ui-group'] }
            })
        })

        it('still emits the sections that were stored when a later section fails', async function () {
            const { payloads, error } = await runControl(control('ctl'), {
                payload: { pages: { hide: ['Page 1'] }, groups: { show: ['typo'] } }
            })
            should(error).match(/No group found/)
            payloads.should.eql([{ pages: { hide: ['config-ui-page'] } }])
        })

        it('navigates to page index 0 instead of refreshing', async function () {
            for (const payload of [0, { page: 0 }]) {
                const payloads = await sendToControl(control('ctl'), { payload })
                payloads[0].should.have.property('page', 0)
                helper.unload()
            }
        })

        it('stores a disabled page as disabled', async function () {
            await sendToControl(control('ctl'), { payload: { pages: { disable: ['Page 1'] } } })
            const statestore = require('../../../nodes/store/state.js')
            statestore.getProperty('config-ui-page', 'disabled').should.be.true()
        })
    })
})
