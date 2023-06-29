const sinon = require('sinon')
var helper = require("node-red-node-test-helper");
var baseConfigNode = require("../../../nodes/config/ui_base.js");
var pageConfigNode = require("../../../nodes/config/ui_page.js");
var buttonNode = require("../../../nodes/widgets/ui_button.js");

// load standard ui-page and ui-base examples
const fixtures = require('../fixtures')

helper.init(require.resolve('node-red'));

describe('ui-button node', function () {

    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    const flow = [
        {
            "id": "node-ui-button",
            "type": "ui-button",
            "z": "tab-id",
            "page": "config-ui-page",
            "name": "",
            "label": "button",
            "order": 0,
            "width": 0,
            "height": 0,
            "passthru": false,
            "tooltip": "",
            "color": "",
            "bgcolor": "",
            "className": "",
            "icon": "",
            "payload": "",
            "payloadType": "str",
            "topic": "topic",
            "topicType": "msg",
            "x": 290,
            "y": 180,
            "wires": [
                []
            ]
        },
        fixtures['config-ui-page'],
        fixtures['config-ui-base'],
    ]

    it('should be loaded', function (done) {

        helper.load([baseConfigNode, pageConfigNode, buttonNode], flow, function () {
            const button = helper.getNode("node-ui-button");
            try {
                button.should.exist
                done();
            } catch(err) {
                done(err);
            }
        });
    });

    it('should be registered with the ui-base', function (done) {

        helper.load([baseConfigNode, pageConfigNode, buttonNode], flow, function () {
            const base = helper.getNode("config-ui-base");
            try {
                base.should.have.property('ui')
                base.ui.should.have.property(`widgets`)
                base.ui.widgets.get('config-ui-page').should.have.property('node-ui-button')
                done();
            } catch(err) {
                done(err);
            }
        });
    });

    it('should be registered with the ui-base with the correct defaults', function (done) {
        helper.load([baseConfigNode, pageConfigNode, buttonNode], flow, function () {
            const base = helper.getNode("config-ui-base");
            try {
                const widget = base.ui.widgets.get('config-ui-page')['node-ui-button']

                // base config should be correct
                widget.id.should.equal('node-ui-button')
                widget.type.should.equal('ui-button')
                // default UI component state
                widget.state.enabled.should.equal(true)
                widget.state.visible.should.equal(true)
                // check we have our proeprties set correctly
                widget.props.label.should.equal(flow[0].label)
                done();
            } catch(err) {
                done(err);
            }
        });
    });

    it('should emit a msg-input event via socketio when the node receives an input in Node-RED', function (done) {
        helper.load([baseConfigNode, pageConfigNode, buttonNode], flow, function () {
            const base = helper.getNode("config-ui-base");
            base.socketio = {
                emit: sinon.spy()
            }
            const button = helper.getNode("node-ui-button");
            button.receive({})
            base.socketio.emit.should.be.calledOnce()
            base.socketio.emit.should.be.calledWith('msg-input:' + button.id)
            done()
        });
    });
});