const should = require('should') // eslint-disable-line no-unused-vars

const dateHelper = require('../../ui/src/widgets/ui-table/helpers/date.helper.js')

describe('date.helper', function () {
    describe('toDate', function () {
        it('treats a 13-digit number as epoch milliseconds', function () {
            dateHelper.toDate(1723377600000).getTime().should.equal(1723377600000)
        })

        it('treats a 10-digit number as epoch seconds (scales to ms)', function () {
            dateHelper.toDate(1723377600).getTime().should.equal(1723377600000)
        })

        it('treats a pre-2001 ms epoch as milliseconds, not seconds', function () {
            dateHelper.toDate(946684800000).getTime().should.equal(946684800000)
        })

        it('treats the threshold value (1e11) as milliseconds', function () {
            dateHelper.toDate(dateHelper.SECONDS_TO_MS_THRESHOLD).getTime()
                .should.equal(dateHelper.SECONDS_TO_MS_THRESHOLD)
        })

        it('treats just below the threshold as seconds', function () {
            const belowThreshold = dateHelper.SECONDS_TO_MS_THRESHOLD - 1
            dateHelper.toDate(belowThreshold).getTime().should.equal(belowThreshold * 1000)
        })

        it('passes a Date instance through unchanged', function () {
            const d = new Date('2024-08-11T12:00:00Z')
            dateHelper.toDate(d).should.equal(d)
        })

        it('parses an ISO-8601 string', function () {
            dateHelper.toDate('2024-08-11T12:00:00Z').getTime()
                .should.equal(Date.parse('2024-08-11T12:00:00Z'))
        })

        it('returns an Invalid Date for an unparseable string', function () {
            isNaN(dateHelper.toDate('not a date').getTime()).should.equal(true)
        })

        it('coerces a 13-digit epoch STRING to the same instant as the number', function () {
            dateHelper.toDate('1723377600000').getTime().should.equal(1723377600000)
        })

        it('coerces a 10-digit epoch STRING (seconds) and scales to ms', function () {
            dateHelper.toDate('1723377600').getTime().should.equal(1723377600000)
        })

        it('does NOT coerce a short numeric string like a year — parses it as a date', function () {
            dateHelper.toDate('2024').getUTCFullYear().should.equal(2024)
        })
    })

    describe('formatCellDate', function () {
        const opts = { locale: 'en-GB', timeZone: 'UTC' }

        it('returns "" for null, undefined and empty string', function () {
            dateHelper.formatCellDate(null).should.equal('')
            dateHelper.formatCellDate(undefined).should.equal('')
            dateHelper.formatCellDate('').should.equal('')
        })

        it('returns the raw value (stringified) when it is not a parseable date', function () {
            dateHelper.formatCellDate('hello').should.equal('hello')
        })

        it('formats ms, seconds and ISO forms of the same instant identically', function () {
            const fromMs = dateHelper.formatCellDate(1723377600000, opts)
            const fromSeconds = dateHelper.formatCellDate(1723377600, opts)
            const fromIso = dateHelper.formatCellDate('2024-08-11T12:00:00Z', opts)
            fromMs.should.equal(fromSeconds)
            fromMs.should.equal(fromIso)
        })

        it('formats to the given locale/timezone', function () {
            const formatted = dateHelper.formatCellDate(1723377600000, opts)
            formatted.should.containEql('2024')
            formatted.should.containEql('11')
            formatted.should.containEql('08')
        })

        it('formats string and numeric epoch forms identically', function () {
            dateHelper.formatCellDate('1723377600000', opts)
                .should.equal(dateHelper.formatCellDate(1723377600000, opts))
            dateHelper.formatCellDate('1723377600', opts)
                .should.equal(dateHelper.formatCellDate(1723377600, opts))
        })

        it('passes booleans through as-is rather than rendering a 1970 date', function () {
            dateHelper.formatCellDate(false).should.equal('false')
            dateHelper.formatCellDate(true).should.equal('true')
        })

        it('passes objects/arrays through as-is', function () {
            dateHelper.formatCellDate({ a: 1 }).should.equal('[object Object]')
        })

        it('returns "" for an already-Invalid Date instance (not "Invalid Date")', function () {
            dateHelper.formatCellDate(new Date('nope')).should.equal('')
        })

        it('does not mis-format a year-like string as 1970', function () {
            dateHelper.formatCellDate('2024', opts).should.containEql('2024')
        })

        it('does not throw on an invalid timeZone — falls back to a non-empty string', function () {
            const formatted = dateHelper.formatCellDate(1723377600000, { timeZone: 'Not/AZone' })
            formatted.should.be.a.String()
            formatted.length.should.be.above(0)
        })

        describe('format option', function () {
            const ms = 1723377600000

            it('format:"date" renders date only (matches toLocaleDateString)', function () {
                dateHelper.formatCellDate(ms, { format: 'date', ...opts })
                    .should.equal(new Date(ms).toLocaleDateString('en-GB', { timeZone: 'UTC' }))
            })

            it('format:"time" renders time only (matches toLocaleTimeString)', function () {
                dateHelper.formatCellDate(ms, { format: 'time', ...opts })
                    .should.equal(new Date(ms).toLocaleTimeString('en-GB', { timeZone: 'UTC' }))
            })

            it('format:"datetime" (default) differs from date-only and time-only', function () {
                const both = dateHelper.formatCellDate(ms, { format: 'datetime', ...opts })
                both.should.not.equal(dateHelper.formatCellDate(ms, { format: 'date', ...opts }))
                both.should.not.equal(dateHelper.formatCellDate(ms, { format: 'time', ...opts }))
            })

            it('an unknown/absent format falls back to date & time', function () {
                const datetime = dateHelper.formatCellDate(ms, { format: 'datetime', ...opts })
                dateHelper.formatCellDate(ms, { format: 'nonsense', ...opts }).should.equal(datetime)
                dateHelper.formatCellDate(ms, opts).should.equal(datetime)
            })

            it('honours the format even when the timeZone is invalid (no throw)', function () {
                const formatted = dateHelper.formatCellDate(ms, { format: 'time', timeZone: 'Not/AZone' })
                formatted.should.be.a.String()
                formatted.length.should.be.above(0)
            })
        })
    })
})
