const { readWrapped, deleteReported, deepFreeze, freezeOwned } = require('./watch.js')

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

function toStoredMessage (owned, datapoint) {
    freezeOwned(owned, '_datapoint')
    if (datapoint !== undefined) {
        owned._datapoint = datapoint
    } else {
        deepFreeze(owned._datapoint)
    }
    return Object.freeze(owned)
}

function storedMessageFor (datapoint, clone) {
    const { _datapoint, ...fields } = builtMessage(datapoint)
    return toStoredMessage(clone(fields), Array.isArray(datapoint) ? Object.freeze(datapoint.slice()) : datapoint)
}

// copies every message before the entry changes, so one that can't be copied leaves the store as it was
function preparedSeries (msgs, clone) {
    const points = []
    const parts = msgs.map((msg) => {
        const { _datapoint, ...rest } = msg
        const owned = clone(rest)
        const datapoint = clone(_datapoint)
        const start = points.length
        points.push(...pointsOf(datapoint))
        return { owned, datapoint, hasDatapoint: '_datapoint' in msg, start, end: points.length }
    })
    return { points, parts }
}

function isIndex (key) {
    return typeof key === 'string' && /^(0|[1-9]\d*)$/.test(key)
}

class SeriesHandler {
    constructor (entry, points) {
        const notify = (path) => entry.notify(points, path)
        this.entry = entry
        this.readPoint = readWrapped(notify, entry.key, entry.store.clone, new WeakMap())
        this.deleteOther = deleteReported(notify, entry.key)
    }

    get (points, key, receiver) {
        return this.readPoint(points, key, receiver)
    }

    set (points, key, value) {
        if (typeof key === 'symbol') {
            return Reflect.set(points, key, value)
        }
        if (isIndex(key) || key === 'length') {
            this.entry.writeIndex(points, key, value)
        } else {
            this.entry.writeOther(points, key, value)
        }
        return true
    }

    deleteProperty (points, key) {
        if (isIndex(key) && this.entry.isCurrent(points)) {
            this.entry.deleteIndex(points, Number(key))
            return true
        }
        return this.deleteOther(points, key)
    }
}

class SeriesEntry {
    constructor (key, store, history) {
        this.key = key
        this.store = store
        this.points = []
        this.msg = []
        this.quality = 'GOOD'
        this.history = history
        this.wrap()
    }

    wrap () {
        this.value = new Proxy(this.points, new SeriesHandler(this, this.points))
        this.timestamp = this.store.now()
    }

    // a proxy taken before the key was replaced, deleted or re-seeded must not report
    isCurrent (points) {
        return this.store.entryFor(this.key) === this && this.points === points
    }

    notify (points, path) {
        if (!this.isCurrent(points)) {
            return
        }
        this.timestamp = this.store.now()
        this.store.emit(this.key, this, path)
    }

    commit () {
        this.wrap()
        this.store.emit(this.key, this, this.key)
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
        for (const point of pointsOf(datapoint)) {
            this.points.push(this.store.clone(point))
            this.timestamp = this.store.now()
            this.store.emit(this.key, this, `${this.key}.${this.points.length - 1}`)
        }
        const stored = storedDatapoint(this.points, datapoint, start, this.points.length)
        if (stored === undefined && hasDatapoint) {
            owned._datapoint = this.store.clone(datapoint)
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
        return linkLivePoints(this.msg, (i) => this.value[i])
    }

    writeIndex (points, key, value) {
        const oldLength = points.length
        const copy = key === 'length' ? value : this.store.clone(value)
        points[key] = copy
        if (!this.isCurrent(points)) {
            return
        }
        if (key === 'length') {
            this.relink({ from: Math.min(oldLength, points.length), to: points.length, fresh: new Set() })
        } else {
            const i = Number(key)
            this.relink({ from: Math.min(i, oldLength), to: i + 1, fresh: new Set([copy]) })
        }
    }

    deleteIndex (points, i) {
        if (!(i in points)) {
            return
        }
        delete points[i]
        this.relink({ from: i, to: i + 1, fresh: new Set() })
    }

    writeOther (points, key, value) {
        points[key] = this.store.clone(value)
        this.notify(points, `${this.key}.${key}`)
    }

    relink ({ from, to, fresh }) {
        const clone = this.store.clone
        this.msg = relinkMessages(this.points, this.msg, { from, to, fresh, clone, toMessage: (datapoint) => storedMessageFor(datapoint, clone) })
        this.commit()
    }
}

module.exports = { pointsOf, pointCount, builtMessage, storedDatapoint, compactTrimmed, linkLivePoints, relinkMessages, toStoredMessage, preparedSeries, SeriesEntry }
