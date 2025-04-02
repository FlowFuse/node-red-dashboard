const should = require('should') // eslint-disable-line no-unused-vars

const utils = require('../../nodes/utils/index.js')

describe('utils', function () {
    describe('getThirdPartyWidgets', function () {
        it('should load single node package', function () {
            // this covers loading from a nodesDir source
            const widgets = utils.getThirdPartyWidgets('test/nodes/fixtures/contrib-node')
            widgets.should.be.an.Object()
            widgets.should.have.properties(['ui-widget-1', 'ui-widget-2'])
            widgets['ui-widget-1'].should.have.properties(['component', 'name', 'package', 'path', 'src'])
            widgets['ui-widget-1'].component.should.equal('ui-widget-1')
            widgets['ui-widget-1'].name.should.equal('ui-widget-1')
            widgets['ui-widget-1'].package.should.equal('@me/node-red-dashboard-2-two-widgets')
            widgets['ui-widget-1'].src.should.equal('ui-widget-1.js')

            widgets['ui-widget-2'].should.have.properties(['component', 'name', 'package', 'path', 'src'])
            widgets['ui-widget-2'].component.should.equal('ui-widget-2')
            widgets['ui-widget-2'].name.should.equal('ui-widget-2')
            widgets['ui-widget-2'].package.should.equal('@me/node-red-dashboard-2-two-widgets')
            widgets['ui-widget-2'].src.should.equal('ui-widget-2.js')
        })
        it('should load nodes from a package dependencies', function () {
            // this covers loading from node-red src package and from userDir package
            const widgets = utils.getThirdPartyWidgets('test/nodes/fixtures/contrib-nodes')
            widgets.should.be.an.Object()
            widgets.should.have.properties(['widget-a', 'widget-b'])
            widgets['widget-a'].should.have.properties(['component', 'name', 'package', 'path', 'src'])
            widgets['widget-a'].component.should.equal('ui-widget-a')
            widgets['widget-a'].name.should.equal('widget-a')
            widgets['widget-a'].package.should.equal('@me/node-red-dashboard-2-widget-a')
            widgets['widget-a'].src.should.equal('ui-widget.js')

            widgets['widget-b'].should.have.properties(['component', 'name', 'package', 'path', 'src'])
            widgets['widget-b'].component.should.equal('ui-widget-b')
            widgets['widget-b'].name.should.equal('widget-b')
            widgets['widget-b'].package.should.equal('@me/node-red-dashboard-2-widget-b')
            widgets['widget-b'].src.should.equal('ui-widget.js')
        })
    })
    describe('hasProperty', function () {
        it('should return true for a property that exists', function () {
            const obj = { payload: 1 }
            const result = utils.hasProperty(obj, 'payload')
            result.should.equal(true)
        })
        it('should return false for a property that does not exist', function () {
            const obj = { payload: 2 }
            const result = utils.hasProperty(obj, 'topic')
            result.should.equal(false)
        })
        it('should return false for an empty object', function () {
            const obj = {}
            const result = utils.hasProperty(obj, 'a')
            result.should.equal(false)
        })
        it('should return false for a null object', function () {
            const obj = null
            const result = utils.hasProperty(obj, 'a')
            result.should.equal(false)
        })
        it('should return false for an undefined object', function () {
            const obj = undefined
            const result = utils.hasProperty(obj, 'a')
            result.should.equal(false)
        })
    })
})
