const should = require('should') // eslint-disable-line no-unused-vars
const sinon = require('sinon')

const { createConnectionAlerts } = require('../../ui/src/util/connection-alerts.js')
const notificationDisplayTime = (dashboard) => dashboard?.notificationDisplayTime || 5

function setup (dashboard = { showDisconnectNotification: true, showReconnectNotification: true, notificationDisplayTime: 5 }) {
    const alerts = { emit: sinon.spy(), clear: sinon.spy() }
    const state = { dashboard }
    const connectionAlerts = createConnectionAlerts({
        alerts,
        getDashboard: () => state.dashboard,
        displayTime: notificationDisplayTime
    })
    return { alerts, state, connectionAlerts }
}

const titles = (spy) => spy.getCalls().map((c) => c.args[0])

describe('connection alerts', function () {
    it('shows the persistent "Connection Lost" alert on disconnect', function () {
        const { alerts, connectionAlerts } = setup()
        connectionAlerts.onDisconnect()
        titles(alerts.emit).should.deepEqual(['Connection Lost'])
        alerts.emit.firstCall.args[3].should.deepEqual({ displayTime: 0, allowDismiss: false, showCountdown: false })
        connectionAlerts.hasPersistentAlert().should.be.true()
    })

    it('replaces it with "Connected" on reconnect', function () {
        const { alerts, connectionAlerts } = setup()
        connectionAlerts.onDisconnect()
        connectionAlerts.onConnect(true)
        titles(alerts.emit).should.deepEqual(['Connection Lost', 'Connected'])
        alerts.emit.secondCall.args[3].displayTime.should.equal(5)
        connectionAlerts.hasPersistentAlert().should.be.false()
    })

    it('clears it without showing "Connected" when the reconnect notification is disabled', function () {
        const { alerts, connectionAlerts } = setup({ showDisconnectNotification: true, showReconnectNotification: false })
        connectionAlerts.onDisconnect()
        connectionAlerts.onConnect(true)
        titles(alerts.emit).should.deepEqual(['Connection Lost'])
        alerts.clear.calledOnce.should.be.true()
    })

    it('clears a stale alert even when the connect is not flagged as a reconnect', function () {
        // the bug: "Connection Lost" shown, then a connect arrives with the reconnect flag already
        // cleared - the alert used to stay on screen forever
        const { alerts, connectionAlerts } = setup()
        connectionAlerts.onDisconnect()
        connectionAlerts.onConnect(false)
        alerts.clear.calledOnce.should.be.true()
        connectionAlerts.hasPersistentAlert().should.be.false()
    })

    it('clears a stale alert when sync() learns the socket is live (no further connect event)', function () {
        // a disconnect processed while the socket is already live again: socket.connect() is a no-op,
        // so no 'connect' event follows and only sync() can remove the alert
        const { alerts, connectionAlerts } = setup()
        connectionAlerts.onDisconnect()
        connectionAlerts.sync(true)
        alerts.clear.calledOnce.should.be.true()
        connectionAlerts.hasPersistentAlert().should.be.false()
    })

    it('leaves the alert alone while still disconnected', function () {
        const { alerts, connectionAlerts } = setup()
        connectionAlerts.onDisconnect()
        connectionAlerts.sync(false)
        alerts.clear.called.should.be.false()
        connectionAlerts.hasPersistentAlert().should.be.true()
    })

    it('never clears when nothing is showing', function () {
        const { alerts, connectionAlerts } = setup()
        connectionAlerts.sync(true)
        connectionAlerts.onConnect(false)
        connectionAlerts.onConnect(true)
        alerts.clear.called.should.be.false()
    })

    it('does not show the lost alert when the disconnect notification is disabled, and clears nothing later', function () {
        const { alerts, connectionAlerts } = setup({ showDisconnectNotification: false, showReconnectNotification: true })
        connectionAlerts.onDisconnect()
        alerts.emit.called.should.be.false()
        connectionAlerts.hasPersistentAlert().should.be.false()
        connectionAlerts.sync(true)
        alerts.clear.called.should.be.false()
    })

    it('is idempotent across repeated disconnect/sync cycles', function () {
        const { alerts, connectionAlerts } = setup()
        connectionAlerts.onDisconnect()
        connectionAlerts.onDisconnect()
        connectionAlerts.sync(true)
        connectionAlerts.sync(true)
        alerts.clear.calledOnce.should.be.true()
    })

    it('tolerates a missing dashboard config', function () {
        const { alerts, connectionAlerts } = setup(null) // passing undefined would hit the default parameter
        connectionAlerts.onDisconnect()
        connectionAlerts.onConnect(true)
        alerts.emit.called.should.be.false()
        alerts.clear.called.should.be.false()
    })
})

describe('connection alerts - first connection of the session', function () {
    it('does not read the dashboard config before it exists', function () {
        // ui/src/store/ui.mjs getter does Object.keys(state.dashboards) and throws while that is null
        const alerts = { emit: sinon.spy(), clear: sinon.spy() }
        const getDashboard = sinon.spy(() => { throw new TypeError('Cannot convert undefined or null to object') })
        const connectionAlerts = createConnectionAlerts({ alerts, getDashboard, displayTime: notificationDisplayTime })
        connectionAlerts.onConnect(false) // must not throw
        getDashboard.called.should.be.false()
        alerts.emit.called.should.be.false()
        alerts.clear.called.should.be.false()
    })
})

describe('connection alerts - fail-safe bookkeeping', function () {
    it('keeps the alert clearable when a subscriber throws during emit', function () {
        // if the flag were set after the emit, a throwing subscriber would leave a persistent alert
        // on screen that no later sync() could ever remove
        const alerts = {
            emit: sinon.stub().throws(new Error('subscriber blew up')),
            clear: sinon.spy()
        }
        const connectionAlerts = createConnectionAlerts({
            alerts,
            getDashboard: () => ({ showDisconnectNotification: true }),
            displayTime: notificationDisplayTime
        })
        should(() => connectionAlerts.onDisconnect()).throw(/subscriber blew up/)
        connectionAlerts.hasPersistentAlert().should.be.true()
        connectionAlerts.sync(true)
        alerts.clear.calledOnce.should.be.true()
    })

    it('survives a dashboard getter that throws, on both paths', function () {
        // ui/src/store/ui.mjs reads state.dashboards, which is null until the ui-config arrives
        const alerts = { emit: sinon.spy(), clear: sinon.spy() }
        const getDashboard = () => { throw new TypeError('Cannot convert undefined or null to object') }
        const connectionAlerts = createConnectionAlerts({ alerts, getDashboard, displayTime: notificationDisplayTime })
        should(() => connectionAlerts.onDisconnect()).not.throw()
        should(() => connectionAlerts.onConnect(true)).not.throw()
        alerts.emit.called.should.be.false()
    })
})
