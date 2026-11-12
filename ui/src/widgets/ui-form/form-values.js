/**
 * Helpers for working with the values held by a ui-form.
 * Kept free of Vue/DOM dependencies so they can be unit tested.
 */

/**
 * Coerce a value into the shape expected by a multi-select form element:
 * an array of selected values.
 * @param {*} value - the raw value (e.g. from `msg.payload` or the input model)
 * @returns {Array} `[]` for null/undefined/'', the value itself if it is an array, otherwise `[value]`
 */
function toMultiValue (value) {
    if (value === null || typeof value === 'undefined' || value === '') {
        return []
    }
    return Array.isArray(value) ? value : [value]
}

/**
 * Whether a form element has been given a value, for the purpose of the "required" rule.
 * @param {string} type - the form element type
 * @param {*} value - the current value of the element
 * @returns {boolean}
 */
function hasValue (type, value) {
    if (type === 'multiselect') {
        return toMultiValue(value).length > 0
    }
    if (type === 'number') {
        return value !== null && typeof value !== 'undefined' && value !== '' && !Number.isNaN(value)
    }
    return value !== null && typeof value !== 'undefined' && value !== ''
}

export { toMultiValue, hasValue }

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { toMultiValue, hasValue }
    module.exports.default = module.exports
}
