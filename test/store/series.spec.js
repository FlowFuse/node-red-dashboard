const should = require('should') // eslint-disable-line no-unused-vars

const { pointsOf, pointCount, storedDatapoint, compactTrimmed, linkLivePoints, builtMessage, relinkMessages } = require('../../nodes/store/series.js')

const pt = (x, category = 'a') => ({ category, x, y: x })
const msg = (payload, datapoint) => datapoint === undefined ? { payload } : { payload, _datapoint: datapoint }

describe('store: series', function () {
    describe('pointsOf and pointCount', function () {
        it('treats a missing datapoint as no points', function () {
            pointsOf(undefined).should.eql([])
            pointsOf(null).should.eql([])
            pointCount(undefined).should.equal(0)
            pointCount(null).should.equal(0)
        })

        it('treats an object as one point', function () {
            const p = pt(1)

            pointsOf(p).should.eql([p])
            pointCount(p).should.equal(1)
        })

        it('treats an array as its points', function () {
            const points = [pt(1), pt(2, 'b')]

            pointsOf(points).should.equal(points)
            pointCount(points).should.equal(2)
            pointCount([]).should.equal(0)
        })
    })

    describe('builtMessage', function () {
        it('takes payload from y and topic from category', function () {
            const p = pt(4, 'b')

            builtMessage(p).should.eql({ payload: 4, topic: 'b', _datapoint: p })
            builtMessage(p)._datapoint.should.equal(p)
        })

        it('leaves payload and topic undefined for something that is not a point', function () {
            builtMessage(5).should.eql({ payload: undefined, topic: undefined, _datapoint: 5 })
        })
    })

    describe('storedDatapoint', function () {
        const points = [pt(0), pt(1), pt(2)]

        it('stores nothing for an empty range', function () {
            should(storedDatapoint(points, pt(9), 1, 1)).be.undefined()
        })

        it('links the point for a single datapoint', function () {
            storedDatapoint(points, pt(9), 1, 2).should.equal(points[1])
        })

        it('links a frozen slice for an array datapoint', function () {
            const stored = storedDatapoint(points, [pt(8), pt(9)], 1, 3)

            stored.should.eql([points[1], points[2]])
            stored[0].should.equal(points[1])
            Object.isFrozen(stored).should.equal(true)
        })
    })

    describe('compactTrimmed', function () {
        it('removes the oldest points when only the head of the messages went', function () {
            const points = [pt(0), pt(1), pt(2), pt(3)]
            const kept = points.slice(2)
            const msgs = points.map((p, i) => msg(i, p))

            compactTrimmed(points, msgs, msgs.slice(2))

            points.should.eql(kept)
            points[0].should.equal(kept[0])
        })

        it('keeps exactly the points of the kept messages from the middle', function () {
            const points = [pt(0), pt(1), pt(2), pt(3)]
            const msgs = points.map((p, i) => msg(i, p))

            compactTrimmed(points, msgs, [msgs[1], msgs[3]])

            points.map((p) => p.x).should.eql([1, 3])
        })

        it('counts every point of a multi-point message and none for a message without points', function () {
            const points = [pt(0), pt(0, 'b'), pt(1), pt(2), pt(2, 'b')]
            const msgs = [msg(0, [points[0], points[1]]), msg('none'), msg(1, points[2]), msg(2, [points[3], points[4]])]

            compactTrimmed(points, msgs, msgs.slice(1))
            points.map((p) => p.x).should.eql([1, 2, 2])

            const after = msgs.slice(1)
            compactTrimmed(points, after, [after[0], after[2]])
            points.map((p) => p.x).should.eql([2, 2])
        })
    })

    describe('linkLivePoints', function () {
        it('pairs each message with the points at its positions', function () {
            const msgs = [msg(0, pt(0)), msg('none'), msg(1, [pt(1), pt(1, 'b')])]
            const live = ['L0', 'L1', 'L2']

            const linked = linkLivePoints(msgs, (i) => live[i])

            linked[0]._datapoint.should.equal('L0')
            linked[1].should.equal(msgs[1])
            linked[2]._datapoint.should.eql(['L1', 'L2'])
        })

        it('freezes the list, each linked message and a multi-point list', function () {
            const msgs = [msg(0, pt(0)), msg(1, [pt(1), pt(1, 'b')])]

            const linked = linkLivePoints(msgs, (i) => ({ i }))

            Object.isFrozen(linked).should.equal(true)
            Object.isFrozen(linked[0]).should.equal(true)
            Object.isFrozen(linked[1]._datapoint).should.equal(true)
        })

        it('leaves the stored messages unchanged', function () {
            const p = pt(0)
            const msgs = [msg(0, p)]

            linkLivePoints(msgs, () => 'live')

            msgs[0]._datapoint.should.equal(p)
        })
    })

    describe('relinkMessages', function () {
        const toMessage = (datapoint) => ({ built: true, _datapoint: Array.isArray(datapoint) ? Object.freeze(datapoint.slice()) : datapoint })
        const clone = (v) => (v && typeof v === 'object') ? structuredClone(v) : v
        const relink = (points, msgs, opts = {}) => relinkMessages(points, msgs, { from: 0, to: points.length, fresh: new Set(), clone, toMessage, ...opts })
        const chart = (n) => {
            const points = Array.from({ length: n }, (_, i) => pt(i))
            return { points, msgs: points.map((p, i) => ({ payload: i, _datapoint: p })) }
        }
        const owners = (msgs) => msgs.map((m) => m.built ? 'built' : m.payload)

        it('returns the same messages when nothing changed', function () {
            const { points, msgs } = chart(3)

            const result = relink(points, msgs)

            result.forEach((m, i) => m.should.equal(msgs[i]))
        })

        it('drops the message of a removed point', function () {
            const { points, msgs } = chart(3)
            points.splice(1, 1)

            owners(relink(points, msgs)).should.eql([0, 2])
        })

        it('builds a message for a new point', function () {
            const { points, msgs } = chart(2)
            const p = pt(9)
            points.push(p)

            const result = relink(points, msgs, { fresh: new Set([p]) })

            owners(result).should.eql([0, 1, 'built'])
            result[2]._datapoint.should.equal(p)
        })

        it('keeps every message through a reorder', function () {
            const { points, msgs } = chart(3)
            points.reverse()

            owners(relink(points, msgs)).should.eql([2, 1, 0])
        })

        it('builds messages for the surviving points of a split multi-point message', function () {
            const points = [pt(0, 'a'), pt(0, 'b')]
            const msgs = [{ payload: 'm', _datapoint: Object.freeze(points.slice()) }]
            points.pop()

            const result = relink(points, msgs)

            owners(result).should.eql(['built'])
            result[0]._datapoint.should.equal(points[0])
        })

        it('keeps a message without points with the next message that has points', function () {
            const { points, msgs } = chart(2)
            const withRider = [msgs[0], { payload: 'r' }, msgs[1]]

            owners(relink(points.slice(), withRider)).should.eql([0, 'r', 1])
            owners(relink([points[0]], withRider)).should.eql([0])
        })

        it('keeps trailing messages without points at the end', function () {
            const { points, msgs } = chart(1)
            points.push(pt(9))

            owners(relink(points, [...msgs, { payload: 'r' }], { fresh: new Set([points[1]]) })).should.eql([0, 'built', 'r'])
        })

        it('removes holes, null and undefined', function () {
            const { points, msgs } = chart(4)
            delete points[0]
            points[1] = null
            points[2] = undefined

            const result = relink(points, msgs)

            points.map((p) => p.x).should.eql([3])
            owners(result).should.eql([3])
        })

        it('flattens an array item into one multi-point message', function () {
            const { points, msgs } = chart(1)
            const group = [pt(5, 'a'), pt(5, 'b')]
            points.push(group)

            const result = relink(points, msgs, { fresh: new Set([group]) })

            points.should.have.length(3)
            points[1].should.equal(group[0])
            owners(result).should.eql([0, 'built'])
            result[1]._datapoint.should.eql(group)
        })

        it('copies a point that appears twice, keeping the message at the first position', function () {
            const { points, msgs } = chart(3)
            points[2] = points[0]

            const result = relink(points, msgs)

            points[2].should.not.equal(points[0])
            points[2].should.eql(points[0])
            owners(result).should.eql([0, 1, 'built'])
        })

        it('copies a point another position still owns', function () {
            const { points, msgs } = chart(3)
            points.copyWithin(0, 2)

            const result = relink(points, msgs)

            points[0].should.not.equal(points[2])
            owners(result).should.eql(['built', 1, 2])
        })

        it('gives the same result with a write hint as without one', function () {
            let seed = 7
            const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
            for (let run = 0; run < 300; run++) {
                const base = chart(8)
                const withHint = { points: base.points.slice(), msgs: base.msgs }
                const withoutHint = { points: base.points.slice(), msgs: base.msgs }
                const i = Math.floor(rand() * 10)
                const p = pt(100 + run)
                for (const target of [withHint, withoutHint]) {
                    target.points[i] = p
                }
                const fresh = new Set([p])
                const hinted = relink(withHint.points, withHint.msgs, { fresh, from: Math.min(i, 8), to: i + 1 })
                const full = relink(withoutHint.points, withoutHint.msgs, { fresh })

                withHint.points.should.eql(withoutHint.points)
                owners(hinted).should.eql(owners(full))
            }
        })
    })
})
