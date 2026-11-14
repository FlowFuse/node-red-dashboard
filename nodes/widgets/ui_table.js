const datastore = require('../store/data.js')

/**
 * Append `incoming` rows to `existing` rows. When `uniqueKey` is set, any
 * incoming row whose `uniqueKey` value matches an existing row replaces that
 * row in place, instead of being added to the end of the table.
 * Rows without a value (`undefined` or `null`) for `uniqueKey` are always appended.
 * Mirrors `mergeRows` in ui/src/widgets/ui-table/helpers/rows.helper.js
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

module.exports = function (RED) {
    function TableNode (config) {
        const node = this

        // create node in Node-RED
        RED.nodes.createNode(this, config)

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)
        const base = group?.getBase() // Used for datastore
        config.maxrows = typeof config.maxrows === 'number' ? config.maxrows : parseInt(config.maxrows)
        if (isNaN(config.maxrows) || config.maxrows < 0) {
            config.maxrows = 0
        }

        if (config.columns && Array.isArray(config.columns)) {
            config.columns.forEach((col) => {
                // map older data where 'label' was used.
                if (typeof col.label !== 'undefined' && (typeof col.title === 'undefined' || col.title === '')) {
                    col.title = col.label
                }
            })
        } else {
            config.columns = undefined
        }

        if (['append', 'replace'].indexOf(config.action) === -1) {
            config.action = 'append'
        }

        config.uniqueKey = typeof config.uniqueKey === 'string' ? config.uniqueKey.trim() : ''

        // inform the dashboard UI that we are adding this node
        if (group) {
            group.register(node, config, {
                onAction: true,
                onInput: function (msg) {
                    const existingData = datastore.get(node.id) || []
                    const formatPayload = (value) => {
                        if (value !== null && typeof value !== 'undefined') {
                            // push object into array if user sends object instead of array
                            if (typeof value === 'object' && !Array.isArray(value)) {
                                return [value]
                            }
                        }
                        return value
                    }
                    let payload = formatPayload(msg?.payload)
                    // check if the action is to append records
                    if (config.action === 'append') {
                        payload = payload && payload.length > 0 ? mergeRows(existingData.payload, payload, config.uniqueKey) : payload
                    }

                    datastore.save(base, node, {
                        ...msg,
                        payload
                    })
                }
            })
        } else {
            node.error('No group configured')
        }
    }

    RED.nodes.registerType('ui-table', TableNode)
}
