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

function linkLivePoints (msgs, pointAt) {
    let i = 0
    return Object.freeze(msgs.map((m) => {
        const n = pointCount(m._datapoint)
        if (n === 0) {
            return m
        }
        const livePoints = Array.from({ length: n }, () => pointAt(i++))
        return Object.freeze({ ...m, _datapoint: Array.isArray(m._datapoint) ? Object.freeze(livePoints) : livePoints[0] })
    }))
}

module.exports = { pointsOf, pointCount, storedDatapoint, compactTrimmed, linkLivePoints }
