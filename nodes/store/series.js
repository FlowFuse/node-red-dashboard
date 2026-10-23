const { deepReactive, deepFreeze, freezeOwned } = require('./utils.js')

function pointsOf (datapoint) {
    if (datapoint === undefined || datapoint === null) {
        return []
    }
    return Array.isArray(datapoint) ? datapoint : [datapoint]
}

function pointCount (datapoint) {
    if (datapoint === undefined || datapoint === null) {
        return 0
    }
    return Array.isArray(datapoint) ? datapoint.length : 1
}

function builtMessage (point) {
    return { payload: point?.y, topic: point?.category, _datapoint: point }
}

function storedDatapoint (points, datapoint, start, end) {
    if (end === start) {
        return undefined
    }
    return Array.isArray(datapoint) ? Object.freeze(points.slice(start, end)) : points[start]
}

function compactTrimmed (points, msgs, kept) {
    const removedMessages = msgs.length - kept.length
    if (kept.length === 0 || kept[0] === msgs[removedMessages]) {
        let removedPoints = 0
        for (let i = 0; i < removedMessages; i++) {
            removedPoints += pointCount(msgs[i]._datapoint)
        }
        points.splice(0, removedPoints)
        return
    }
    let readAt = 0
    let writeAt = 0
    let nextKept = 0
    for (const m of msgs) {
        const n = pointCount(m._datapoint)
        if (m === kept[nextKept]) {
            nextKept++
            for (let k = 0; k < n; k++) {
                points[writeAt++] = points[readAt + k]
            }
        }
        readAt += n
    }
    points.length = writeAt
}

function linkLivePoints (msgs, livePoints) {
    let i = 0
    return Object.freeze(msgs.map((m) => {
        const n = pointCount(m._datapoint)
        if (n === 0) {
            return m
        }
        const linked = Array.from({ length: n }, () => livePoints[i++])
        return Object.freeze({ ...m, _datapoint: Array.isArray(m._datapoint) ? Object.freeze(linked) : linked[0] })
    }))
}

function toStoredMessage (owned, datapoint) {
    freezeOwned(owned, '_datapoint')
    if (datapoint !== undefined) {
        owned._datapoint = datapoint
    } else {
        deepFreeze(owned._datapoint)
    }
    return Object.freeze(owned)
}

// copies every message before the entry changes, so one that can't be copied leaves the store as it was
function preparedSeries (msgs, clone) {
    const points = []
    const parts = msgs.map((msg) => {
        const { _datapoint, ...rest } = msg
        const owned = clone(rest)
        const datapoint = clone(_datapoint)
        const start = points.length
        for (const point of pointsOf(datapoint)) {
            points.push(point)
        }
        return { owned, datapoint, hasDatapoint: '_datapoint' in msg, start, end: points.length }
    })
    return { points, parts }
}

class SeriesEntry {
    constructor (key, storeProps, history) {
        this.key = key
        this.storeProps = storeProps
        this.points = []
        this.msg = []
        this.quality = 'GOOD'
        this.history = history
        this.wrap()
    }

    wrap () {
        const points = this.points
        this.value = deepReactive(points, (path) => this.notify(points, path), this.key, this.storeProps.cloneValue, new WeakMap(), true)
        this.timestamp = this.storeProps.now()
    }

    // a proxy taken before the key was replaced, deleted or re-seeded must not report
    isCurrent (points) {
        return this.storeProps.entryFor(this.key) === this && this.points === points
    }

    notify (points, path) {
        if (!this.isCurrent(points)) {
            return
        }
        this.timestamp = this.storeProps.now()
        this.storeProps.emit(this.key, this, path)
    }

    commit () {
        this.wrap()
        this.storeProps.emit(this.key, this, this.key)
    }

    replaceAll ({ points, parts }) {
        this.points = points
        this.msg = parts.map(({ owned, datapoint, hasDatapoint, start, end }) => {
            const stored = storedDatapoint(points, datapoint, start, end)
            if (stored === undefined && hasDatapoint) {
                owned._datapoint = datapoint
            }
            return toStoredMessage(owned, stored)
        })
        this.commit()
    }

    append (owned, datapoint, hasDatapoint) {
        const start = this.points.length
        // the proxy clones on push, so points must not be cloned again here
        for (const point of pointsOf(datapoint)) {
            this.value.push(point)
        }
        const stored = storedDatapoint(this.points, datapoint, start, this.points.length)
        if (stored === undefined && hasDatapoint) {
            owned._datapoint = this.storeProps.cloneValue(datapoint)
        }
        this.msg.push(toStoredMessage(owned, stored))
    }

    trim (keep) {
        const kept = keep(this.msg)
        if (kept.length === this.msg.length) {
            return
        }
        compactTrimmed(this.points, this.msg, kept)
        this.msg = kept
        this.commit()
    }

    linkedMessages () {
        return linkLivePoints(this.msg, this.value)
    }
}

module.exports = { pointsOf, pointCount, builtMessage, storedDatapoint, compactTrimmed, linkLivePoints, toStoredMessage, preparedSeries, SeriesEntry }
