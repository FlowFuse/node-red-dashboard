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

function isPoint (item) {
    return item !== undefined && item !== null
}

function owns (msg, point) {
    return msg !== undefined && isPoint(point) && !Array.isArray(point) && msg._datapoint === point
}

function indexMessagesByPoint (msgs) {
    const messageOfPoint = new Map()
    const messagesWithoutPointsBefore = new Map()
    let withoutPoints = []
    for (const msg of msgs) {
        const msgPoints = pointsOf(msg._datapoint)
        if (msgPoints.length === 0) {
            withoutPoints.push(msg)
            continue
        }
        messagesWithoutPointsBefore.set(msg, withoutPoints)
        withoutPoints = []
        for (const point of msgPoints) {
            messageOfPoint.set(point, msg)
        }
    }
    return { messageOfPoint, messagesWithoutPointsBefore, trailingWithoutPoints: withoutPoints }
}

function unchangedEnds (points, msgs, end, from, to) {
    let start = from > 0 && from <= end && owns(msgs[from - 1], points[from - 1]) ? from : 0
    while (start < end && start < points.length && owns(msgs[start], points[start])) {
        start++
    }
    let msgEnd = end
    let pointEnd = points.length
    const alignedWithTo = msgEnd - (pointEnd - to)
    if (to < pointEnd && alignedWithTo > start && owns(msgs[alignedWithTo], points[to])) {
        msgEnd = alignedWithTo
        pointEnd = to
    }
    while (msgEnd > start && pointEnd > start && owns(msgs[msgEnd - 1], points[pointEnd - 1])) {
        msgEnd--
        pointEnd--
    }
    return { start, msgEnd, pointEnd }
}

function relinkMessages (points, msgs, { from, to, fresh, clone, toMessage }) {
    let end = msgs.length
    while (end > 0 && pointCount(msgs[end - 1]._datapoint) === 0) {
        end--
    }
    const { start, msgEnd, pointEnd } = unchangedEnds(points, msgs, end, from, to)
    const { messageOfPoint, messagesWithoutPointsBefore, trailingWithoutPoints } = indexMessagesByPoint(msgs.slice(start, msgEnd))
    const items = []
    for (let i = start; i < pointEnd; i++) {
        if (Array.isArray(points[i])) {
            const group = points[i].filter(isPoint)
            if (group.length > 0) {
                items.push(group)
            }
        } else if (isPoint(points[i])) {
            items.push(points[i])
        }
    }
    const kept = new Set()
    const used = new Set()
    const middlePoints = []
    const middleMessages = []
    let i = 0
    while (i < items.length) {
        const item = items[i]
        if (Array.isArray(item)) {
            middlePoints.push(...item)
            middleMessages.push(toMessage(item))
            i++
            continue
        }
        const msg = messageOfPoint.get(item)
        const msgPoints = msg && !kept.has(msg) ? pointsOf(msg._datapoint) : []
        if (msgPoints.length > 0 && msgPoints.every((point, k) => items[i + k] === point)) {
            kept.add(msg)
            middlePoints.push(...msgPoints)
            middleMessages.push(...messagesWithoutPointsBefore.get(msg), msg)
            msgPoints.forEach((point) => used.add(point))
            i += msgPoints.length
            continue
        }
        const owned = typeof item === 'object' && (used.has(item) || (!fresh.has(item) && !messageOfPoint.has(item)))
        const point = owned ? clone(item) : item
        used.add(point)
        middlePoints.push(point)
        middleMessages.push(toMessage(point))
        i++
    }
    middleMessages.push(...trailingWithoutPoints)
    replaceRange(points, start, pointEnd, middlePoints)
    if (middleMessages.length === msgEnd - start) {
        middleMessages.forEach((msg, k) => { msgs[start + k] = msg })
        return msgs
    }
    return [...msgs.slice(0, start), ...middleMessages, ...msgs.slice(msgEnd)]
}

function replaceRange (list, start, end, items) {
    if (items.length === end - start) {
        items.forEach((item, k) => { list[start + k] = item })
        return
    }
    const tail = list.slice(end)
    list.length = start
    for (const item of items) {
        list.push(item)
    }
    for (const item of tail) {
        list.push(item)
    }
}

module.exports = { pointsOf, pointCount, builtMessage, storedDatapoint, compactTrimmed, linkLivePoints, relinkMessages }
