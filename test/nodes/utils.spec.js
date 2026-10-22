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

    describe('normalizeClientId', function () {
        it('returns a plain string id unchanged', function () {
            utils.normalizeClientId('abc').should.equal('abc')
        })
        it('collapses a duplicated (array) query param to the first value', function () {
            utils.normalizeClientId(['abc', 'def']).should.equal('abc')
        })
        it('returns undefined for missing or empty ids', function () {
            should(utils.normalizeClientId(undefined)).be.undefined()
            should(utils.normalizeClientId(null)).be.undefined()
            should(utils.normalizeClientId('')).be.undefined()
        })
    })

    describe('isClientScoped', function () {
        it('is false for a msg with no client targeting', function () {
            utils.isClientScoped({ payload: 1 }).should.be.false()
            utils.isClientScoped({ payload: 1, _client: {} }).should.be.false()
            utils.isClientScoped(undefined).should.be.false()
        })
        it('is true for a socketId-targeted msg', function () {
            utils.isClientScoped({ _client: { socketId: 's1' } }).should.be.true()
        })
        it('is true for a clientId-targeted msg', function () {
            utils.isClientScoped({ _client: { clientId: 'c1' } }).should.be.true()
        })
        it('ignores ids that normalize away', function () {
            utils.isClientScoped({ _client: { clientId: '' } }).should.be.false()
            utils.isClientScoped({ _client: { socketId: null } }).should.be.false()
        })
    })

    describe('matchesClient', function () {
        const conn = { id: 's1', _clientId: 'c1' }

        it('matches any connection when the msg is not targeted', function () {
            utils.matchesClient(conn, { payload: 1 }).should.be.true()
        })
        it('matches on socketId', function () {
            utils.matchesClient(conn, { _client: { socketId: 's1' } }).should.be.true()
            utils.matchesClient(conn, { _client: { socketId: 's2' } }).should.be.false()
        })
        it('matches on clientId', function () {
            utils.matchesClient(conn, { _client: { clientId: 'c1' } }).should.be.true()
            utils.matchesClient(conn, { _client: { clientId: 'c2' } }).should.be.false()
        })
        it('normalizes a clientId sent as a duplicated query param', function () {
            utils.matchesClient(conn, { _client: { clientId: ['c1', 'c2'] } }).should.be.true()
        })
        it('requires every targeted field to match', function () {
            utils.matchesClient(conn, { _client: { socketId: 's1', clientId: 'c2' } }).should.be.false()
        })
    })
})
