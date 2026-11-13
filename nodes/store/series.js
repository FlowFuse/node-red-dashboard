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

function isPoint (item) {
    return typeof item === 'object' && item !== null && !Array.isArray(item)
}

function holdsPointsAt (datapoint, points, at) {
    if (!Array.isArray(datapoint)) {
        return points[at] === datapoint
    }
    for (let k = 0; k < datapoint.length; k++) {
        if (points[at + k] !== datapoint[k]) {
            return false
        }
    }
    return true
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

function unchangedEnds (points, msgs, end) {
    let msgStart = 0
    let pointStart = 0
    for (let k = 0, at = 0; k < end; k++) {
        const n = pointCount(msgs[k]._datapoint)
        if (n === 0) {
            continue
        }
        if (!holdsPointsAt(msgs[k]._datapoint, points, at)) {
            break
        }
        at += n
        msgStart = k + 1
        pointStart = at
    }
    let msgEnd = end
    let pointEnd = points.length
    for (let k = end - 1; k >= msgStart; k--) {
        const n = pointCount(msgs[k]._datapoint)
        if (n > 0 && (pointEnd - n < pointStart || !holdsPointsAt(msgs[k]._datapoint, points, pointEnd - n))) {
            break
        }
        msgEnd = k
        pointEnd -= n
    }
    return { msgStart, pointStart, msgEnd, pointEnd }
}

function endOfMessagesWithPoints (msgs) {
    let end = msgs.length
    while (end > 0 && pointCount(msgs[end - 1]._datapoint) === 0) {
        end--
    }
    return end
}

function relinkMiddle (items, msgs, { fresh, clone }) {
    const { messageOfPoint, messagesWithoutPointsBefore, trailingWithoutPoints } = indexMessagesByPoint(msgs)
    const used = new Set()
    const points = []
    const messages = []
    let i = 0
    while (i < items.length) {
        const item = items[i]
        const msg = messageOfPoint.get(item)
        const msgPoints = msg ? pointsOf(msg._datapoint) : []
        if (msgPoints.length > 0 && msgPoints.every((point, k) => items[i + k] === point && !used.has(point))) {
            points.push(...msgPoints)
            messages.push(...messagesWithoutPointsBefore.get(msg), msg)
            msgPoints.forEach((point) => used.add(point))
            i += msgPoints.length
            continue
        }
        const needsCopy = used.has(item) || (!fresh.has(item) && !messageOfPoint.has(item))
        const point = needsCopy ? clone(item) : item
        used.add(point)
        points.push(point)
        messages.push(storedMessageFor(point, clone))
        i++
    }
    messages.push(...trailingWithoutPoints)
    return { points, messages }
}

function relinkMessages (points, msgs, { fresh, clone }) {
    const end = endOfMessagesWithPoints(msgs)
    const { msgStart, pointStart, msgEnd, pointEnd } = unchangedEnds(points, msgs, end)
    const middle = relinkMiddle(points.slice(pointStart, pointEnd).filter(isPoint), msgs.slice(msgStart, msgEnd), { fresh, clone })
    replaceRange(points, pointStart, pointEnd, middle.points)
    replaceRange(msgs, msgStart, msgEnd, middle.messages)
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

function storedMessageFor (point, clone) {
    const { _datapoint, ...fields } = builtMessage(point)
    return toStoredMessage(clone(fields), point)
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

const MUTATORS = new Set(['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'])

function isIndex (key) {
    return typeof key === 'string' && /^(0|[1-9]\d*)$/.test(key)
}

class SeriesHandler {
    constructor (entry, points) {
        this.entry = entry
        this.reader = deepReactive(points, (path) => entry.notify(points, path), entry.key, entry.storeProps.cloneValue, new WeakMap(), true)
    }

    get (points, key, receiver) {
        if (MUTATORS.has(key)) {
            return (...args) => this.entry.runMethod(points, key, args, receiver)
        }
        return Reflect.get(this.reader, key, receiver)
    }

    set (points, key, value) {
        if (isIndex(key) || key === 'length') {
            this.entry.writeIndex(points, key, value)
            return true
        }
        return Reflect.set(this.reader, key, value)
    }

    deleteProperty (points, key) {
        if (isIndex(key)) {
            this.entry.deleteIndex(points, Number(key))
            return true
        }
        return Reflect.deleteProperty(this.reader, key)
    }
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
        this.value = new Proxy(this.points, new SeriesHandler(this, this.points))
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
        for (const point of pointsOf(datapoint)) {
            this.points.push(this.storeProps.cloneValue(point))
            this.timestamp = this.storeProps.now()
            this.storeProps.emit(this.key, this, `${this.key}.${this.points.length - 1}`)
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

    writeIndex (points, key, value) {
        const copy = key === 'length' ? Math.min(value, points.length) : this.storeProps.cloneValue(value)
        points[key === 'length' ? key : Math.min(Number(key), points.length)] = copy
        if (this.isCurrent(points)) {
            this.relink(new Set([copy]))
        }
    }

    deleteIndex (points, i) {
        if (!(i in points)) {
            return
        }
        delete points[i]
        if (this.isCurrent(points)) {
            this.relink(new Set())
        }
    }

    runMethod (points, name, args, receiver) {
        const copies = args.map((arg) => this.storeProps.cloneValue(arg))
        const result = Array.prototype[name].apply(points, copies)
        if (this.isCurrent(points)) {
            this.relink(new Set(copies))
        }
        return result === points ? receiver : result
    }

    relink (fresh) {
        relinkMessages(this.points, this.msg, { fresh, clone: this.storeProps.cloneValue })
        this.commit()
    }
}

module.exports = { isPoint, pointsOf, pointCount, builtMessage, storedDatapoint, compactTrimmed, linkLivePoints, relinkMessages, unchangedEnds, toStoredMessage, preparedSeries, SeriesEntry }
