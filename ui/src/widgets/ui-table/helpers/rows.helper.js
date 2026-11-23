/**
 * Helpers for merging incoming rows into the data held by a ui-table.
 * Kept free of Vue/DOM dependencies so they can be unit tested.
 */

/**
 * Append `incoming` rows to `existing` rows. When `uniqueKey` is set, any
 * incoming row whose `uniqueKey` value matches an existing row replaces that
 * row in place, instead of being added to the end of the table.
 * Rows without a value (`undefined` or `null`) for `uniqueKey` are always appended.
 * @param {Array} existing - the rows currently held by the table
 * @param {Array} incoming - the rows that have just been received
 * @param {string} [uniqueKey] - name of the row property that uniquely identifies a row
 * @returns {Array} a new array with the merged rows
 */
function mergeRows (existing, incoming, uniqueKey) {
    if (!uniqueKey) {
        return [...(existing || []), ...(incoming || [])]
    }
    const rows = [...(existing || [])]
    const getId = (row) => (row !== null && typeof row === 'object') ? row[uniqueKey] : undefined
    const hasId = (id) => id !== undefined && id !== null
    // map each identifier to the position of its row
    const positions = new Map()
    rows.forEach((row, index) => {
        const id = getId(row)
        if (hasId(id)) {
            positions.set(id, index)
        }
    })
    for (const row of (incoming || [])) {
        const id = getId(row)
        if (hasId(id) && positions.has(id)) {
            rows[positions.get(id)] = row
        } else {
            if (hasId(id)) {
                positions.set(id, rows.length)
            }
            rows.push(row)
        }
    }
    return rows
}

export { mergeRows }

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mergeRows }
    module.exports.default = module.exports
}
