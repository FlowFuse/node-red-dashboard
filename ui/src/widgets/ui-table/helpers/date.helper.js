const SECONDS_TO_MS_THRESHOLD = 1e11
const EPOCH_STRING = /^-?\d{10,}$/

const FORMATTERS = {
    datetime: 'toLocaleString',
    date: 'toLocaleDateString',
    time: 'toLocaleTimeString'
}

function toDate (value) {
    if (value instanceof Date) {
        return value
    }
    if (typeof value === 'string' && EPOCH_STRING.test(value.trim())) {
        return toDate(Number(value.trim()))
    }
    if (typeof value === 'number') {
        return new Date(value < SECONDS_TO_MS_THRESHOLD ? value * 1000 : value)
    }
    return new Date(value)
}

function formatCellDate (value, { locale, timeZone, format } = {}) {
    if (value === null || typeof value === 'undefined' || value === '') {
        return ''
    }
    if (typeof value !== 'number' && typeof value !== 'string' && !(value instanceof Date)) {
        return String(value)
    }
    const date = toDate(value)
    if (isNaN(date.getTime())) {
        return typeof value === 'string' ? value : ''
    }
    const method = FORMATTERS[format] || FORMATTERS.datetime
    try {
        return date[method](locale, timeZone ? { timeZone } : undefined)
    } catch (e) {
        return date[method]()
    }
}

export default {
    formatCellDate,
    toDate,
    SECONDS_TO_MS_THRESHOLD
}

export { formatCellDate, toDate, SECONDS_TO_MS_THRESHOLD }

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCellDate,
        toDate,
        SECONDS_TO_MS_THRESHOLD
    }
    module.exports.default = module.exports
}
