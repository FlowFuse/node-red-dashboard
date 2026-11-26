import type { ChartMessage, ChartPoint, CloneValue, Datapoint, HistoryItem, StorePath, StoreProps, StoredMessage } from './types.js'
import { deepFreeze, deepReactive, freezeOwned } from './utils.js'

export type KeepMessages = (messages: StoredMessage[]) => StoredMessage[]

interface PreparedMessage {
    owned: ChartMessage
    datapoint: Datapoint
    hasDatapoint: boolean
    start: number
    end: number
}

export interface PreparedSeries {
    points: ChartPoint[]
    parts: PreparedMessage[]
}

interface MessageIndex {
    messageOfPoint: Map<ChartPoint, StoredMessage>
    messagesWithoutPointsBefore: Map<StoredMessage, StoredMessage[]>
    trailingWithoutPoints: StoredMessage[]
}

export interface UnchangedEnds {
    msgStart: number
    pointStart: number
    msgEnd: number
    pointEnd: number
}

interface RelinkedRange {
    points: ChartPoint[]
    messages: StoredMessage[]
}

interface RelinkOptions {
    fresh: ReadonlySet<unknown>
    clone: CloneValue
}

function isPointList (datapoint: Datapoint): datapoint is readonly ChartPoint[] {
    return Array.isArray(datapoint)
}

export function pointsOf (datapoint: Datapoint): readonly ChartPoint[] {
    if (datapoint === undefined || datapoint === null) {
        return []
    }
    return isPointList(datapoint) ? datapoint : [datapoint]
}

export function pointCount (datapoint: Datapoint): number {
    if (datapoint === undefined || datapoint === null) {
        return 0
    }
    return isPointList(datapoint) ? datapoint.length : 1
}

export function builtMessage (point: ChartPoint): ChartMessage {
    return { payload: point?.y, topic: point?.category, _datapoint: point }
}

export function storedDatapoint (points: readonly ChartPoint[], datapoint: Datapoint, start: number, end: number): Datapoint {
    if (end === start) {
        return undefined
    }
    return Array.isArray(datapoint) ? Object.freeze(points.slice(start, end)) : points[start]
}

export function compactTrimmed (points: unknown[], messages: readonly StoredMessage[], kept: readonly StoredMessage[]): void {
    const removedMessages: number = messages.length - kept.length
    if (kept.length === 0 || kept[0] === messages[removedMessages]) {
        let removedPoints: number = 0
        for (let index = 0; index < removedMessages; index++) {
            removedPoints += pointCount(messages[index]._datapoint)
        }
        points.splice(0, removedPoints)
        return
    }
    let readAt: number = 0
    let writeAt: number = 0
    let nextKept: number = 0
    for (const message of messages) {
        const count: number = pointCount(message._datapoint)
        if (message === kept[nextKept]) {
            nextKept++
            for (let offset = 0; offset < count; offset++) {
                points[writeAt++] = points[readAt + offset]
            }
        }
        readAt += count
    }
    points.length = writeAt
}

export function linkLivePoints (messages: readonly StoredMessage[], livePoints: readonly ChartPoint[]): readonly StoredMessage[] {
    let nextPoint: number = 0
    return Object.freeze(messages.map((message: StoredMessage): StoredMessage => {
        const count: number = pointCount(message._datapoint)
        if (count === 0) {
            return message
        }
        const linked: ChartPoint[] = Array.from({ length: count }, (): ChartPoint => livePoints[nextPoint++])
        return Object.freeze({ ...message, _datapoint: isPointList(message._datapoint) ? Object.freeze(linked) : linked[0] })
    }))
}

export function isPoint (item: unknown): item is ChartPoint {
    return typeof item === 'object' && item !== null && !Array.isArray(item)
}

function holdsPointsAt (datapoint: Datapoint, points: readonly unknown[], at: number): boolean {
    if (!isPointList(datapoint)) {
        return points[at] === datapoint
    }
    for (let offset = 0; offset < datapoint.length; offset++) {
        if (points[at + offset] !== datapoint[offset]) {
            return false
        }
    }
    return true
}

function indexMessagesByPoint (messages: readonly StoredMessage[]): MessageIndex {
    const messageOfPoint: Map<ChartPoint, StoredMessage> = new Map()
    const messagesWithoutPointsBefore: Map<StoredMessage, StoredMessage[]> = new Map()
    let withoutPoints: StoredMessage[] = []
    for (const message of messages) {
        const messagePoints: readonly ChartPoint[] = pointsOf(message._datapoint)
        if (messagePoints.length === 0) {
            withoutPoints.push(message)
            continue
        }
        messagesWithoutPointsBefore.set(message, withoutPoints)
        withoutPoints = []
        for (const point of messagePoints) {
            messageOfPoint.set(point, message)
        }
    }
    return { messageOfPoint, messagesWithoutPointsBefore, trailingWithoutPoints: withoutPoints }
}

// a message without points belongs to the message after it, so it is only skipped along with that message
export function unchangedEnds (points: readonly unknown[], messages: readonly StoredMessage[], end: number): UnchangedEnds {
    let msgStart: number = 0
    let pointStart: number = 0
    for (let index = 0, at = 0; index < end; index++) {
        const count: number = pointCount(messages[index]._datapoint)
        if (count === 0) {
            continue
        }
        if (!holdsPointsAt(messages[index]._datapoint, points, at)) {
            break
        }
        at += count
        msgStart = index + 1
        pointStart = at
    }
    let msgEnd: number = end
    let pointEnd: number = points.length
    for (let index = end - 1; index >= msgStart; index--) {
        const count: number = pointCount(messages[index]._datapoint)
        if (count > 0 && (pointEnd - count < pointStart || !holdsPointsAt(messages[index]._datapoint, points, pointEnd - count))) {
            break
        }
        msgEnd = index
        pointEnd -= count
    }
    return { msgStart, pointStart, msgEnd, pointEnd }
}

function endOfMessagesWithPoints (messages: readonly StoredMessage[]): number {
    let end: number = messages.length
    while (end > 0 && pointCount(messages[end - 1]._datapoint) === 0) {
        end--
    }
    return end
}

function relinkMiddle (items: readonly ChartPoint[], messages: readonly StoredMessage[], { fresh, clone }: RelinkOptions): RelinkedRange {
    const { messageOfPoint, messagesWithoutPointsBefore, trailingWithoutPoints } = indexMessagesByPoint(messages)
    const used: Set<ChartPoint> = new Set()
    const points: ChartPoint[] = []
    const relinked: StoredMessage[] = []
    let index: number = 0
    while (index < items.length) {
        const item: ChartPoint = items[index]
        const message: StoredMessage | undefined = messageOfPoint.get(item)
        const messagePoints: readonly ChartPoint[] = message ? pointsOf(message._datapoint) : []
        if (message && messagePoints.length > 0 && messagePoints.every((point: ChartPoint, offset: number): boolean => items[index + offset] === point && !used.has(point))) {
            points.push(...messagePoints)
            relinked.push(...messagesWithoutPointsBefore.get(message) ?? [], message)
            messagePoints.forEach((point: ChartPoint): void => { used.add(point) })
            index += messagePoints.length
            continue
        }
        const needsCopy: boolean = used.has(item) || (!fresh.has(item) && !messageOfPoint.has(item))
        const point: ChartPoint = needsCopy ? clone(item) : item
        used.add(point)
        points.push(point)
        relinked.push(storedMessageFor(point, clone))
        index++
    }
    relinked.push(...trailingWithoutPoints)
    return { points, messages: relinked }
}

export function relinkMessages (points: unknown[], messages: StoredMessage[], { fresh, clone }: RelinkOptions): void {
    const end: number = endOfMessagesWithPoints(messages)
    const { msgStart, pointStart, msgEnd, pointEnd } = unchangedEnds(points, messages, end)
    const middle: RelinkedRange = relinkMiddle(points.slice(pointStart, pointEnd).filter(isPoint), messages.slice(msgStart, msgEnd), { fresh, clone })
    replaceRange(points, pointStart, pointEnd, middle.points)
    replaceRange(messages, msgStart, msgEnd, middle.messages)
}

function replaceRange<TItem> (list: TItem[], start: number, end: number, items: readonly TItem[]): void {
    if (items.length === end - start) {
        items.forEach((item: TItem, offset: number): void => { list[start + offset] = item })
        return
    }
    const tail: TItem[] = list.slice(end)
    list.length = start
    for (const item of items) {
        list.push(item)
    }
    for (const item of tail) {
        list.push(item)
    }
}

export function toStoredMessage (owned: ChartMessage, datapoint: Datapoint): StoredMessage {
    freezeOwned(owned, '_datapoint')
    if (datapoint !== undefined) {
        owned._datapoint = datapoint
    } else {
        deepFreeze(owned._datapoint)
    }
    return Object.freeze(owned)
}

function storedMessageFor (point: ChartPoint, clone: CloneValue): StoredMessage {
    const { _datapoint, ...fields } = builtMessage(point)
    return toStoredMessage(clone(fields), point)
}

// copies every message before the entry changes, so one that can't be copied leaves the store as it was
export function preparedSeries (messages: readonly ChartMessage[], clone: CloneValue): PreparedSeries {
    const points: ChartPoint[] = []
    const parts: PreparedMessage[] = messages.map((message: ChartMessage): PreparedMessage => {
        const { _datapoint, ...rest } = message
        const owned: ChartMessage = clone(rest)
        const datapoint: Datapoint = clone(_datapoint)
        const start: number = points.length
        for (const point of pointsOf(datapoint)) {
            points.push(point)
        }
        return { owned, datapoint, hasDatapoint: '_datapoint' in message, start, end: points.length }
    })
    return { points, parts }
}

type ArrayMutator = 'copyWithin' | 'fill' | 'pop' | 'push' | 'reverse' | 'shift' | 'sort' | 'splice' | 'unshift'

const MUTATORS: ReadonlySet<string> = new Set<ArrayMutator>(['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'])

function isMutator (key: string | symbol): key is ArrayMutator {
    return typeof key === 'string' && MUTATORS.has(key)
}

function isIndex (key: string): boolean {
    return /^(0|[1-9]\d*)$/.test(key)
}

class SeriesHandler implements ProxyHandler<ChartPoint[]> {
    entry: SeriesEntry
    reader: ChartPoint[]

    constructor (entry: SeriesEntry, points: ChartPoint[]) {
        this.entry = entry
        this.reader = deepReactive(points, (path: StorePath): void => entry.notify(points, path), entry.key, entry.storeProps.cloneValue, new WeakMap(), true)
    }

    get (points: ChartPoint[], key: string | symbol, receiver: unknown): unknown {
        if (isMutator(key)) {
            return (...args: unknown[]): unknown => this.entry.runMethod(points, key, args, receiver)
        }
        return Reflect.get(this.reader, key, receiver)
    }

    set (points: ChartPoint[], key: string | symbol, value: unknown): boolean {
        if (typeof key === 'string' && (isIndex(key) || key === 'length')) {
            this.entry.writeIndex(points, key, value)
            return true
        }
        return Reflect.set(this.reader, key, value)
    }

    deleteProperty (points: ChartPoint[], key: string | symbol): boolean {
        if (typeof key === 'string' && isIndex(key)) {
            this.entry.deleteIndex(points, Number(key))
            return true
        }
        return Reflect.deleteProperty(this.reader, key)
    }
}

export class SeriesEntry {
    key: string
    storeProps: StoreProps
    points: ChartPoint[]
    msg: StoredMessage[]
    quality: string
    history: HistoryItem[]
    value: ChartPoint[] | undefined
    timestamp: number

    constructor (key: string, storeProps: StoreProps, history: HistoryItem[]) {
        this.key = key
        this.storeProps = storeProps
        this.points = []
        this.msg = []
        this.quality = 'GOOD'
        this.history = history
        this.value = this.proxied()
        this.timestamp = storeProps.now()
    }

    private proxied (): ChartPoint[] {
        return new Proxy(this.points, new SeriesHandler(this, this.points))
    }

    wrap (): void {
        this.value = this.proxied()
        this.timestamp = this.storeProps.now()
    }

    // a proxy taken before the key was replaced, deleted or re-seeded must not report
    isCurrent (points: readonly unknown[]): boolean {
        return this.storeProps.entryFor(this.key) === this && this.points === points
    }

    notify (points: readonly unknown[], path: StorePath): void {
        if (!this.isCurrent(points)) {
            return
        }
        this.timestamp = this.storeProps.now()
        this.storeProps.emit(this.key, this, path)
    }

    commit (): void {
        this.wrap()
        this.storeProps.emit(this.key, this, this.key)
    }

    replaceAll ({ points, parts }: PreparedSeries): void {
        this.points = points
        this.msg = parts.map(({ owned, datapoint, hasDatapoint, start, end }: PreparedMessage): StoredMessage => {
            const stored: Datapoint = storedDatapoint(points, datapoint, start, end)
            if (stored === undefined && hasDatapoint) {
                owned._datapoint = datapoint
            }
            return toStoredMessage(owned, stored)
        })
        this.commit()
    }

    append (owned: ChartMessage, datapoint: Datapoint, hasDatapoint: boolean): void {
        const start: number = this.points.length
        for (const point of pointsOf(datapoint)) {
            this.points.push(this.storeProps.cloneValue(point))
            this.timestamp = this.storeProps.now()
            this.storeProps.emit(this.key, this, `${this.key}.${this.points.length - 1}`)
        }
        const stored: Datapoint = storedDatapoint(this.points, datapoint, start, this.points.length)
        if (stored === undefined && hasDatapoint) {
            owned._datapoint = this.storeProps.cloneValue(datapoint)
        }
        this.msg.push(toStoredMessage(owned, stored))
    }

    trim (keep: KeepMessages): void {
        const kept: StoredMessage[] = keep(this.msg)
        if (kept.length === this.msg.length) {
            return
        }
        compactTrimmed(this.points, this.msg, kept)
        this.msg = kept
        this.commit()
    }

    linkedMessages (): readonly StoredMessage[] {
        return linkLivePoints(this.msg, this.value ?? [])
    }

    // the points list may briefly hold whatever a flow wrote until relink filters it back to points
    writeIndex (points: unknown[], key: string, value: unknown): void {
        if (key === 'length') {
            const length: number = Math.min(Number(value), points.length)
            points.length = length
            if (this.isCurrent(points)) {
                this.relink(new Set([length]))
            }
            return
        }
        const copy: unknown = this.storeProps.cloneValue(value)
        points[Math.min(Number(key), points.length)] = copy
        if (this.isCurrent(points)) {
            this.relink(new Set([copy]))
        }
    }

    deleteIndex (points: unknown[], index: number): void {
        if (!(index in points)) {
            return
        }
        delete points[index]
        if (this.isCurrent(points)) {
            this.relink(new Set())
        }
    }

    runMethod (points: unknown[], name: ArrayMutator, args: unknown[], receiver: unknown): unknown {
        const copies: unknown[] = args.map((arg: unknown): unknown => this.storeProps.cloneValue(arg))
        const result: unknown = Reflect.apply(Array.prototype[name], points, copies)
        if (this.isCurrent(points)) {
            this.relink(new Set(copies))
        }
        return result === points ? receiver : result
    }

    relink (fresh: ReadonlySet<unknown>): void {
        relinkMessages(this.points, this.msg, { fresh, clone: this.storeProps.cloneValue })
        this.commit()
    }
}
