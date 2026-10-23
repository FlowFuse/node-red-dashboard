const should = require('should') // eslint-disable-line no-unused-vars

const { pointsOf, pointCount, builtMessage, storedDatapoint, compactTrimmed, linkLivePoints } = require('../../nodes/store/series.js')

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
        it('pairs each message with the live points at its positions', function () {
            const msgs = [msg(0, pt(0)), msg('none'), msg(1, [pt(1), pt(1, 'b')])]
            const live = ['L0', 'L1', 'L2']

            const linked = linkLivePoints(msgs, live)

            linked[0]._datapoint.should.equal('L0')
            linked[1].should.equal(msgs[1])
            linked[2]._datapoint.should.eql(['L1', 'L2'])
        })

        it('freezes the list, each linked message and a multi-point list', function () {
            const msgs = [msg(0, pt(0)), msg(1, [pt(1), pt(1, 'b')])]

            const linked = linkLivePoints(msgs, [{ i: 0 }, { i: 1 }, { i: 2 }])

            Object.isFrozen(linked).should.equal(true)
            Object.isFrozen(linked[0]).should.equal(true)
            Object.isFrozen(linked[1]._datapoint).should.equal(true)
        })

        it('leaves the stored messages unchanged', function () {
            const p = pt(0)
            const msgs = [msg(0, p)]

            linkLivePoints(msgs, ['live'])

            msgs[0]._datapoint.should.equal(p)
        })
    })
})
