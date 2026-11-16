import type { Entry } from './reactive.js'
import type { SeriesEntry } from './series.js'

export type StorePath = string
export type NotifyChange = (path: StorePath) => void
export type CloneValue = <TValue>(value: TValue) => TValue

export interface ChartPoint {
    x?: unknown
    y?: unknown
    category?: unknown
    [field: string]: unknown
}

export type Datapoint = ChartPoint | readonly ChartPoint[] | null | undefined

export interface DashboardMessage {
    [field: string]: unknown
}

export interface ChartMessage extends DashboardMessage {
    _datapoint?: Datapoint
}

export type StoredMessage = Readonly<ChartMessage>

export interface HistoryItem {
    readonly value: unknown
    readonly timestamp: number
}

export type StoreEntry = Entry | SeriesEntry

export type OnChange = (key: string, entry: StoreEntry | undefined, path: StorePath) => void

export interface StoreProps {
    cloneValue: CloneValue
    emit: OnChange
    now: () => number
    entryFor: (key: string) => StoreEntry | undefined
}

export interface StorePlugin {
    hooks?: {
        onCanSaveInStore?: (msg: unknown) => boolean
    }
}

export interface StoreRuntime {
    plugins: {
        getByType: (type: string) => StorePlugin[]
    }
    util: {
        cloneMessage: CloneValue
    }
}

export interface StoreBaseNode {
    acceptsClientConfig: string[]
    warn: (message: string) => void
}

export interface StoreWidgetNode {
    id: string
    type: string
}
