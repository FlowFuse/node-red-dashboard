export type StorePath = string
export type NotifyChange = (path: StorePath) => void
export type CloneValue = <T>(value: T) => T
