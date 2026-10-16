const should = require('should') // eslint-disable-line no-unused-vars
const sinon = require('sinon')

// the service is an ES module with a default export; Node's require(esm) exposes it under .default
const AlertsModule = require('../../ui/src/services/alerts.js')
const Alerts = AlertsModule.default || AlertsModule

describe('Alerts service', function () {
    const unsubscribers = []

    afterEach(function () {
        // make sure no subscriptions leak between tests
        while (unsubscribers.length) {
            unsubscribers.pop()()
        }
    })

    function subscribe (fcn) {
        const unsubscribe = Alerts.subscribe(fcn)
        unsubscribers.push(unsubscribe)
        return unsubscribe
    }

    it('delivers emitted alerts to subscribers', function () {
        const fcn = sinon.spy()
        subscribe(fcn)
        const options = { displayTime: 5, allowDismiss: true, showCountdown: true }
        Alerts.emit('Connected', 'Connection re-established.', '#1BC318', options)
        fcn.calledOnce.should.be.true()
        fcn.firstCall.args.should.deepEqual(['Connected', 'Connection re-established.', '#1BC318', options])
    })

    it('delivers clear() as a null title', function () {
        const fcn = sinon.spy()
        subscribe(fcn)
        Alerts.clear()
        fcn.calledOnce.should.be.true()
        should(fcn.firstCall.args[0]).be.null()
    })

    it('stops delivering after unsubscribe', function () {
        const first = sinon.spy()
        const second = sinon.spy()
        const unsubscribeFirst = subscribe(first)
        subscribe(second)
        unsubscribeFirst()
        Alerts.emit('Connection Lost', 'Attempting to reconnect to server...', 'red', { displayTime: 0 })
        first.called.should.be.false()
        second.calledOnce.should.be.true()
        // calling unsubscribe twice is harmless
        unsubscribeFirst()
        Alerts.clear()
        first.called.should.be.false()
        second.calledTwice.should.be.true()
    })

    it('tolerates a subscriber unsubscribing during emit', function () {
        const seen = []
        let unsubscribeSelf = null
        unsubscribeSelf = subscribe(() => {
            seen.push('self')
            unsubscribeSelf()
        })
        subscribe(() => seen.push('other'))
        Alerts.emit('Connected', 'ok', 'green', {})
        seen.should.deepEqual(['self', 'other'])
    })
})
