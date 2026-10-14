const should = require('should') // eslint-disable-line no-unused-vars

const { notificationDisplayTime } = require('../../ui/src/util/notification-display-time.js')

describe('notificationDisplayTime', function () {
    it('uses a configured positive number', function () {
        notificationDisplayTime({ notificationDisplayTime: 3 }).should.equal(3)
        notificationDisplayTime({ notificationDisplayTime: 2.5 }).should.equal(2.5)
    })

    it('coerces the string the editor stores', function () {
        notificationDisplayTime({ notificationDisplayTime: '5' }).should.equal(5)
        notificationDisplayTime({ notificationDisplayTime: '0.5' }).should.equal(0.5)
    })

    it('falls back to the default for zero, so the notification always closes', function () {
        notificationDisplayTime({ notificationDisplayTime: '0' }).should.equal(5)
        notificationDisplayTime({ notificationDisplayTime: 0 }).should.equal(5)
        notificationDisplayTime({ notificationDisplayTime: -1 }).should.equal(5)
    })

    it('falls back to the default for missing or invalid values', function () {
        notificationDisplayTime({ notificationDisplayTime: '' }).should.equal(5)
        notificationDisplayTime({ notificationDisplayTime: 'abc' }).should.equal(5)
        notificationDisplayTime({ notificationDisplayTime: null }).should.equal(5)
        notificationDisplayTime({}).should.equal(5)
        notificationDisplayTime(undefined).should.equal(5)
        notificationDisplayTime(null).should.equal(5)
    })

    it('honours a custom fallback', function () {
        notificationDisplayTime({}, 1).should.equal(1)
    })
})
