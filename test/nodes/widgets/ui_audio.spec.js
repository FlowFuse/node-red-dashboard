const helper = require('node-red-node-test-helper')
const should = require('should') // eslint-disable-line no-unused-vars
const sinon = require('sinon')

const datastore = require('../../../nodes/store/data.js')
const statestore = require('../../../nodes/store/state.js')

// load test 1 standard test data (base, page, group, theme, audio)
const { testData1 } = require('../fixtures/index.js')
const { getBaseRegisterCallAndParams, getGroupRegisterCallAndParams, registerHelperSpies, unRegisterHelperSpies } = require('../utils.js')
const { verifyFlowLoaded } = require('../utils.js')
const testFlow1 = testData1.flows
const nodeImports = testData1.getImports(null, ['ui_audio'])

helper.init(require.resolve('node-red'))

const flow1AudioPlayer = [
    {
        id: 'node-ui-audio-audio',
        type: 'ui-audio',
        z: 'tab-id',
        ui: '',
        group: 'config-ui-group',
        name: 'audio-widget-audio',
        order: 0,
        width: 0,
        height: 0,
        mode: 'src',
        voice: '',
        src: 's1',
        autoplay: 'on',
        loop: 'on',
        muted: 'on',
        className: '',
        x: 200,
        y: 120,
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

const flow2TTS = [
    {
        id: 'node-ui-audio-tts',
        type: 'ui-audio',
        z: 'tab-id',
        group: '',
        ui: 'config-ui-base',
        name: 'audio-widget-tts',
        order: 0,
        width: 0,
        height: 0,
        mode: 'tts',
        voice: 'v1',
        src: '',
        autoplay: 'off',
        loop: 'off',
        muted: 'off',
        className: '',
        x: 200,
        y: 120,
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

describe('ui-audio node', function () {
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

    describe('audio player mode', function () {
        const flow = flow1AudioPlayer

        it('audio player should be loaded', async function () {
            await helper.load(nodeImports, flow)
            verifyFlowLoaded(helper, flow)
            const audio = helper.getNode('node-ui-audio-audio')
            should(audio).be.an.Object()
        })

        it('should default to mode \'src\'', async function () {
            const flows = JSON.parse(JSON.stringify(flow))
            delete flows[0].mode // remove mode to test defaulting
            await helper.load(nodeImports, flows)
            verifyFlowLoaded(helper, flows)
            const base = helper.getNode('config-ui-base')
            const widget = base.ui.widgets.get('node-ui-audio-audio')
            should(widget).be.an.Object()
            widget.should.have.property('props').and.be.an.Object()
            widget.props.should.have.property('mode', 'src')
            // createNode should be called with mode 'src'
            const createNodeCall = helper._RED.nodes.createNode.getCalls().find(call => call.args[0]?.id === 'node-ui-audio-audio')
            should(createNodeCall).be.not.undefined()
            const createNodeConfig = createNodeCall.args[1]
            createNodeConfig.should.have.property('mode', 'src')
        })

        it('should call RED.nodes.createNode with node and ui-group config', async function () {
            await helper.load(nodeImports, flow)
            verifyFlowLoaded(helper, flow)
            const node = helper.getNode('node-ui-audio-audio')
            node.should.have.property('name', 'audio-widget-audio')
            helper._RED.nodes.createNode.called.should.be.true()
            const createNodeCall = helper._RED.nodes.createNode.getCalls().find(call => call.args[0]?.id === 'node-ui-audio-audio')
            should(createNodeCall).be.not.undefined()
            const createNodeNode = createNodeCall.args[0]
            createNodeNode.should.have.property('name', 'audio-widget-audio')
            const createNodeConfig = createNodeCall.args[1]
            createNodeConfig.should.have.property('group', 'config-ui-group')
        })

        it('should be registered with the ui-base', async function () {
            await helper.load(nodeImports, flow)
            verifyFlowLoaded(helper, flow)
            const base = helper.getNode('config-ui-base')
            const group = helper.getNode('config-ui-group')
            const page = helper.getNode('config-ui-page')

            // src mode should only call base.register, group.register, page.register
            group.register.called.should.be.true()
            group.register.getCalls().filter(call => call.args[0]?.id === 'node-ui-audio-audio').length.should.equal(1)
            page.register.called.should.be.true()
            page.register.getCalls().filter(call => call.args[1]?.id === 'node-ui-audio-audio').length.should.equal(1)
            base.register.called.should.be.true()
            base.register.getCalls().filter(call => call.args[2]?.id === 'node-ui-audio-audio').length.should.equal(1)

            base.should.have.property('ui')
            base.ui.should.have.property('widgets')
            base.ui.widgets.has('node-ui-audio-audio').should.be.true()
        })

        it('should be registered with the ui-base with the correct values', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].ui = ''
            updatedFlow[0].voice = ''
            updatedFlow[0].src = 's1'
            updatedFlow[0].autoplay = 'on'
            updatedFlow[0].loop = 'on'
            updatedFlow[0].muted = 'on'
            updatedFlow[0].className = 'c2'

            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const base = helper.getNode('config-ui-base')
            const widget = base.ui.widgets.get('node-ui-audio-audio')

            // base config should be correct
            widget.id.should.equal('node-ui-audio-audio')
            widget.type.should.equal('ui-audio')

            // default UI component state
            widget.should.have.property('state')
            widget.state.should.have.property('enabled', true)
            widget.state.should.have.property('visible', true)

            // check we have our properties set correctly
            widget.should.have.property('props')
            widget.props.should.have.property('ui', '')
            widget.props.should.have.property('group', 'config-ui-group')
            widget.props.should.have.property('mode', 'src')
            widget.props.should.have.property('voice', '')
            widget.props.should.have.property('src', 's1')
            widget.props.should.have.property('autoplay', 'on')
            widget.props.should.have.property('loop', 'on')
            widget.props.should.have.property('muted', 'on')
            widget.props.should.have.property('className', 'c2')
        })

        it('should call node.error when group is not configured', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].ui = ''
            updatedFlow[0].group = ''
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const node = helper.getNode('node-ui-audio-audio')
            node.error.called.should.be.true()
            const errorCall = node.error.getCall(0)
            const errorMsg = errorCall.args[0]
            errorMsg.should.equal('No group configured')
        })

        it('should fail to register if group is not found', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].ui = ''
            updatedFlow[0].group = 'bad-group'
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const node = helper.getNode('node-ui-audio-audio')
            const group = helper._RED.nodes.getNode('bad-group')
            should(group).be.null()
            node.error.called.should.be.true()
            const errorCall = node.error.getCall(0)
            const errorMsg = errorCall.args[0]
            errorMsg.should.match(/Group 'bad-group' not found for ui_audio node/)
        })

        describe('onInput hook', function () {
            it('should store message when source is supplied in payload', async function () {
                await helper.load(nodeImports, flow)
                verifyFlowLoaded(helper, flow)
                const group = helper.getNode('config-ui-group')
                const node = helper.getNode('node-ui-audio-audio')
                const { registerEvents } = getGroupRegisterCallAndParams(group, 'node-ui-audio-audio')
                sinon.spy(datastore, 'save')
                // now call evts.onInput with a message with a string payload
                const msg = { payload: 'audio-source-url' }
                registerEvents.onInput.call(node, msg, function () {})
                datastore.save.called.should.be.true()
                const saveCall = datastore.save.getCall(0)
                saveCall.args[0].should.equal(group.getBase())
                saveCall.args[1].should.equal(node)
                saveCall.args[2].should.equal(msg)
            })
            it('should not store message when source is not supplied in payload', async function () {
                await helper.load(nodeImports, flow)
                verifyFlowLoaded(helper, flow)
                const group = helper.getNode('config-ui-group')
                const node = helper.getNode('node-ui-audio-audio')
                const { registerEvents } = getGroupRegisterCallAndParams(group, 'node-ui-audio-audio')
                sinon.spy(datastore, 'save')
                // now call evts.onInput with a message with a non-string payload
                const msg = { payload: 12345 }
                registerEvents.onInput.call(node, msg, function () {})
                datastore.save.called.should.be.false()
            })
            it('should passthru message when passthru is enabled', async function () {
                const flow1WithPassthru = JSON.parse(JSON.stringify(flow))
                flow1WithPassthru[0].passthru = true
                await helper.load(nodeImports, flow1WithPassthru)
                verifyFlowLoaded(helper, flow1WithPassthru)
                const group = helper.getNode('config-ui-group')
                const node = helper.getNode('node-ui-audio-audio')
                const { registerEvents } = getGroupRegisterCallAndParams(group, 'node-ui-audio-audio')
                // now call evts.onInput with a message
                const msg = { payload: 'audio-source-url' }
                const sendSpy = sinon.spy()
                registerEvents.onInput.call(node, msg, sendSpy)
                const sendCall = sendSpy.getCall(0)
                sendCall.args[0].should.equal(msg)
            })
            it('should not passthru message when passthru is disabled', async function () {
                const flow1WithNoPassthru = JSON.parse(JSON.stringify(flow))
                flow1WithNoPassthru[0].passthru = false
                await helper.load(nodeImports, flow1WithNoPassthru)
                verifyFlowLoaded(helper, flow1WithNoPassthru)
                const group = helper.getNode('config-ui-group')
                const node = helper.getNode('node-ui-audio-audio')
                const { registerEvents } = getGroupRegisterCallAndParams(group, 'node-ui-audio-audio')
                // now call evts.onInput with a message
                const msg = { payload: 'audio-source-url' }
                const sendSpy = sinon.spy()
                registerEvents.onInput.call(node, msg, sendSpy)
                sendSpy.called.should.be.false()
            })
        })

        describe('beforeSend hook', function () {
            it('should return the msg', async function () {
                await helper.load(nodeImports, flow)
                verifyFlowLoaded(helper, flow)
                const group = helper.getNode('config-ui-group')
                const node = helper.getNode('node-ui-audio-audio')
                const { registerEvents } = getGroupRegisterCallAndParams(group, 'node-ui-audio-audio')

                // call beforeSend with playback=play and no dynamic updates
                const msg = {
                    playback: 'play'
                }
                registerEvents.beforeSend.call(node, msg)
                const returnValue = registerEvents.beforeSend.call(node, msg)
                returnValue.should.equal(msg)
            })
            it('should warn if playback==play and src is not a string and no previous message', async function () {
                const flows = JSON.parse(JSON.stringify(flow))
                flows[0].src = ''
                await helper.load(nodeImports, flows)
                verifyFlowLoaded(helper, flows)
                const group = helper.getNode('config-ui-group')
                const node = helper.getNode('node-ui-audio-audio')

                // mock datastore.get to return null i.e. no previous message stored
                sinon.stub(datastore, 'get').returns(null)
                const { registerEvents } = getGroupRegisterCallAndParams(group, 'node-ui-audio-audio')

                // now call beforeSend with playback=play and src not a string
                registerEvents.beforeSend.call(node, { playback: 'play' })

                node.warn.called.should.be.true()
                const warnCall = node.warn.getCall(0)
                const warnMsg = warnCall.args[0]
                warnMsg.should.equal('Cannot play audio when no source has been specified')
            })
            it('should not do dynamic updates if no dynamic updates are present in the msg', async function () {
                await helper.load(nodeImports, flow)
                verifyFlowLoaded(helper, flow)
                const group = helper.getNode('config-ui-group')
                const node = helper.getNode('node-ui-audio-audio')

                // mock statestore.set
                sinon.spy(statestore, 'set')
                const { registerEvents } = getGroupRegisterCallAndParams(group, 'node-ui-audio-audio')

                // now call beforeSend with playback=play and src not a string
                const msg = {
                    playback: 'play',
                    ui_update: undefined
                }
                registerEvents.beforeSend.call(node, msg)
                const returnValue = registerEvents.beforeSend.call(node, msg)
                returnValue.should.equal(msg)

                // statestore.set should not have been called
                statestore.set.called.should.be.false()
            })
            it('should do dynamic updates if dynamic updates are present in the msg', async function () {
                await helper.load(nodeImports, flow)
                verifyFlowLoaded(helper, flow)
                const group = helper.getNode('config-ui-group')
                const node = helper.getNode('node-ui-audio-audio')

                // mock statestore.set
                sinon.spy(statestore, 'set')
                const { registerEvents } = getGroupRegisterCallAndParams(group, 'node-ui-audio-audio')

                // now call beforeSend with playback=play and src not a string
                const msg = {
                    playback: 'play',
                    ui_update: {
                        src: 'new-src',
                        autoplay: 'on',
                        loop: 'off',
                        muted: 'on',
                        nonsense: 'value',
                        madeup: 'property'
                    }
                }
                registerEvents.beforeSend.call(node, msg)

                // check that statestore.set was called with correct args
                const setCalls = statestore.set.getCalls().filter(call => call.args[1]?.id === 'node-ui-audio-audio')
                setCalls.should.have.length(4) // should have been called 4 times (src, autoplay, loop, muted)
                const srcCall = setCalls.find(call => call.args[3] === 'src')
                srcCall.args[0].should.equal(group.getBase())
                srcCall.args[1].should.equal(node)
                srcCall.args[2].should.equal(msg)
                srcCall.args[3].should.equal('src')
                srcCall.args[4].should.equal('new-src')
                const autoplayCall = setCalls.find(call => call.args[3] === 'autoplay')
                autoplayCall.args[4].should.equal('on')
                const loopCall = setCalls.find(call => call.args[3] === 'loop')
                loopCall.args[4].should.equal('off')
                const mutedCall = setCalls.find(call => call.args[3] === 'muted')
                mutedCall.args[4].should.equal('on')
            })
            it('should call node.error when dynamic updates value is bad', async function () {
                await helper.load(nodeImports, flow)
                verifyFlowLoaded(helper, flow)
                const group = helper.getNode('config-ui-group')
                const node = helper.getNode('node-ui-audio-audio')

                // mock statestore.set
                sinon.spy(statestore, 'set')
                const { registerEvents } = getGroupRegisterCallAndParams(group, 'node-ui-audio-audio')

                // now call beforeSend with playback=play and src not a string
                const msg = {
                    playback: 'play',
                    ui_update: {
                        autoplay: 'incorrect',
                        loop: 'not right',
                        muted: 'bad value'
                    }
                }
                registerEvents.beforeSend.call(node, msg)

                // check that statestore.set was called with correct args
                const setCalls = statestore.set.getCalls().filter(call => call.args[1]?.id === 'node-ui-audio-audio')
                setCalls.should.have.length(0) // should not be called due to invalid values

                // check node.error was called 3 times
                node.error.called.should.be.true()
                node.error.callCount.should.equal(3)
                node.error.getCall(0).args[0].should.equal('Property msg.ui_update.autoplay should be "on" or "off"')
                node.error.getCall(1).args[0].should.equal('Property msg.ui_update.loop should be "on" or "off"')
                node.error.getCall(2).args[0].should.equal('Property msg.ui_update.muted should be "on" or "off"')
            })
        })
    })

    describe('tts player mode', function () {
        const flow = flow2TTS

        it('tts player should be loaded', async function () {
            await helper.load(nodeImports, flow)
            verifyFlowLoaded(helper, flow)
            const audio = helper.getNode('node-ui-audio-tts')
            should(audio).be.an.Object()
        })

        it('should be registered with the ui-base', async function () {
            await helper.load(nodeImports, flow)
            verifyFlowLoaded(helper, flow)
            const base = helper.getNode('config-ui-base')
            const group = helper.getNode('config-ui-group')
            const page = helper.getNode('config-ui-page')

            // tts should only call base.register was called, not group.register, not page.register
            group.register.called.should.be.false()
            page.register.called.should.be.false()
            base.register.called.should.be.true()
            base.register.getCalls().filter(call => call.args[2]?.id === 'node-ui-audio-tts').length.should.equal(1)

            const { registerCall, registerNode, registerConfig, registerEvents } = getBaseRegisterCallAndParams(base, 'node-ui-audio-tts')
            should(registerCall).be.not.undefined()

            // should have been called with the node, config and evts args
            registerNode.id.should.equal('node-ui-audio-tts')
            registerConfig.should.have.property('mode', 'tts')
            registerConfig.should.have.property('ui', 'config-ui-base')
            registerConfig.should.have.property('group', '')
            registerConfig.should.have.property('voice', 'v1')
            should(registerEvents).be.an.Object()
            should(registerEvents).have.property('onInput').and.be.a.Function()
            should(registerEvents).have.property('beforeSend').and.be.a.Function()

            base.should.have.property('ui')
            base.ui.should.have.property('widgets')
            base.ui.widgets.has('node-ui-audio-tts').should.be.true()
        })

        it('should be registered with the ui-base with the correct values', async function () {
            const flows = JSON.parse(JSON.stringify(flow))
            flows[0].className = 'c1'
            await helper.load(nodeImports, flows)
            verifyFlowLoaded(helper, flows)
            const base = helper.getNode('config-ui-base')
            const widget = base.ui.widgets.get('node-ui-audio-tts')

            // base config should be correct
            widget.id.should.equal('node-ui-audio-tts')
            widget.type.should.equal('ui-audio')

            // default UI component state
            widget.should.have.property('state')
            widget.state.should.have.property('enabled', true)
            widget.state.should.have.property('visible', true)

            // check we have our properties set correctly
            widget.should.have.property('props')
            widget.props.should.have.property('ui', 'config-ui-base')
            widget.props.should.have.property('group', '')
            widget.props.should.have.property('mode', 'tts')
            widget.props.should.have.property('voice', 'v1')
            widget.props.should.have.property('src', '')
            widget.props.should.have.property('autoplay', 'off')
            widget.props.should.have.property('loop', 'off')
            widget.props.should.have.property('muted', 'off')
            widget.props.should.have.property('className', 'c1')
        })

        it('should fail to register if base is not found', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].ui = 'bad-ui'
            updatedFlow[0].group = ''
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const node = helper.getNode('node-ui-audio-tts')
            const ui = helper._RED.nodes.getNode('bad-ui')
            should(ui).be.null()
            node.error.called.should.be.true()
            const errorCall = node.error.getCall(0)
            const errorMsg = errorCall.args[0]
            errorMsg.should.match(/UI 'bad-ui' not found for ui_audio node/)
        })

        it('should call RED.nodes.createNode with node and ui-base config', async function () {
            await helper.load(nodeImports, flow)
            verifyFlowLoaded(helper, flow)
            const node = helper.getNode('node-ui-audio-tts')
            node.should.have.property('name', 'audio-widget-tts')
            helper._RED.nodes.createNode.called.should.be.true()
            const createNodeCall = helper._RED.nodes.createNode.getCalls().find(call => call.args[0]?.id === 'node-ui-audio-tts')
            should(createNodeCall).be.not.undefined()
            const createNodeNode = createNodeCall.args[0]
            createNodeNode.should.have.property('name', 'audio-widget-tts')
            const createNodeConfig = createNodeCall.args[1]
            createNodeConfig.should.have.property('ui', 'config-ui-base')
        })

        it('should call node.error when ui is not configured', async function () {
            const updatedFlow = JSON.parse(JSON.stringify(flow))
            updatedFlow[0].ui = ''
            updatedFlow[0].group = ''
            await helper.load(nodeImports, updatedFlow)
            verifyFlowLoaded(helper, updatedFlow)
            const node = helper.getNode('node-ui-audio-tts')
            node.error.called.should.be.true()
            const errorCall = node.error.getCall(0)
            const errorMsg = errorCall.args[0]
            errorMsg.should.equal('No UI configured')
        })

        describe('onInput hook', function () {
            it('Calls send when passthru is enabled', async function () {
                const flow2WithPassthru = JSON.parse(JSON.stringify(flow))
                flow2WithPassthru[0].passthru = true
                await helper.load(nodeImports, flow2WithPassthru)
                verifyFlowLoaded(helper, flow2WithPassthru)
                const base = helper.getNode('config-ui-base')
                const node = helper.getNode('node-ui-audio-tts')
                const { registerEvents } = getBaseRegisterCallAndParams(base, 'node-ui-audio-tts')
                const sendSpy = sinon.spy()
                sinon.spy(datastore, 'save')

                // now call evts.onInput so that we can check the send function is called and datastore.save is not called
                registerEvents.onInput.call(node, { payload: 'This is a test message' }, sendSpy)
                datastore.save.called.should.be.false()
                sendSpy.called.should.be.true()
                // belts and braces - check the send msg sent was correct
                const sendCall = sendSpy.getCall(0)
                const sendMsg = sendCall.args[0]
                sendMsg.should.have.property('payload', 'This is a test message')
            })
            it('Does not call send when passthru is disabled', async function () {
                const flow2WithoutPassthru = JSON.parse(JSON.stringify(flow))
                flow2WithoutPassthru[0].passthru = false
                await helper.load(nodeImports, flow2WithoutPassthru)
                verifyFlowLoaded(helper, flow2WithoutPassthru)
                const base = helper.getNode('config-ui-base')
                const node = helper.getNode('node-ui-audio-tts')
                const { registerEvents } = getBaseRegisterCallAndParams(base, 'node-ui-audio-tts')
                const sendSpy = sinon.spy()
                sinon.spy(datastore, 'save')

                // now call evts.onInput so that we can check the both the send function and datastore.save is not called
                registerEvents.onInput.call(node, { payload: 'This is a test message' }, sendSpy)
                datastore.save.called.should.be.false()
                sendSpy.called.should.be.false()
            })
        })
        describe('beforeSend hook', function () {
            it('should clean up the datastore', async function () {
                await helper.load(nodeImports, flow)
                verifyFlowLoaded(helper, flow)
                const base = helper.getNode('config-ui-base')
                const node = helper.getNode('node-ui-audio-tts')

                sinon.stub(datastore, 'clear').returns(null)
                sinon.stub(statestore, 'reset').returns(null)
                const { registerEvents } = getBaseRegisterCallAndParams(base, 'node-ui-audio-tts')

                registerEvents.beforeSend.call(node, { playback: 'hello world' })
                datastore.clear.called.should.be.true()
                const clearCall = datastore.clear.getCall(0)
                clearCall.args[0].should.equal(node.id)
                statestore.reset.called.should.be.true()
                const resetCall = statestore.reset.getCall(0)
                resetCall.args[0].should.equal(node.id)
            })
        })
    })
})
