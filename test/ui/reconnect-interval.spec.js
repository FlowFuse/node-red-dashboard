const should = require('should') // eslint-disable-line no-unused-vars

const { nextReconnectInterval } = require('../../ui/src/util/reconnect-interval.js')

const noJitter = () => 0.5

describe('nextReconnectInterval', function () {
    describe('count-based escalation', function () {
        it('uses 2.5s for the first few attempts', function () {
            nextReconnectInterval(0, noJitter).should.equal(2500)
            nextReconnectInterval(3, noJitter).should.equal(2500)
        })

        it('escalates to 5s after 4 attempts', function () {
            nextReconnectInterval(4, noJitter).should.equal(5000)
            nextReconnectInterval(13, noJitter).should.equal(5000)
        })

        it('caps at 30s from 14 attempts on, and never gives up', function () {
            nextReconnectInterval(14, noJitter).should.equal(30000)
            nextReconnectInterval(1000, noJitter).should.equal(30000)
        })
    })

    describe('jitter', function () {
        it('stays within ±50% of the base interval', function () {
            for (const rc of [0, 4, 14]) {
                const base = nextReconnectInterval(rc, noJitter)
                nextReconnectInterval(rc, () => 0).should.equal(base * 0.5)
                nextReconnectInterval(rc, () => 1).should.equal(base * 1.5)
            }
        })

        it('varies the delay across clients (desync)', function () {
            const a = nextReconnectInterval(0, () => 0.1)
            const b = nextReconnectInterval(0, () => 0.9)
            a.should.not.equal(b)
        })
    })
})
