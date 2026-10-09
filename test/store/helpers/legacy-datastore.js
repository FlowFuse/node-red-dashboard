const { isClientScoped } = require('../../../nodes/utils/index.js')

module.exports = function createLegacy (RED) {
    const data = {}

    function canSaveInStore (base, node, msg) {
        const checks = []
        if (base.acceptsClientConfig.includes(node.type)) {
            if (isClientScoped(msg)) {
                checks.push(false)
            }
            for (const plugin of RED.plugins.getByType('node-red-dashboard-2')) {
                if (plugin.hooks?.onCanSaveInStore) {
                    checks.push(plugin.hooks.onCanSaveInStore(msg))
                }
            }
        }
        return checks.length === 0 || !checks.includes(false)
    }

    function stripMsg (msg) {
        const newMsg = RED.util.cloneMessage(msg)
        delete newMsg.ui_update
        return newMsg
    }

    function filter (base, node, filterFunction) {
        const currentData = data[node.id]
        if (filterFunction && Array.isArray(currentData) && currentData.length) {
            const filteredMessages = currentData.filter(filterFunction)
            if (filteredMessages.length !== currentData.length) {
                data[node.id] = filteredMessages
            }
        }
    }

    return {
        get (id) {
            return RED.util.cloneMessage(data[id])
        },
        has (id) {
            return !!data[id]
        },
        clear (id) {
            delete data[id]
        },
        save (base, node, msg) {
            if (Array.isArray(msg)) {
                const filtered = []
                for (const m of msg) {
                    if (canSaveInStore(base, node, m)) {
                        filtered.push(RED.util.cloneMessage(m))
                    }
                }
                data[node.id] = filtered
            } else if (canSaveInStore(base, node, msg)) {
                data[node.id] = { ...data[node.id], ...stripMsg(msg) }
            }
        },
        append (base, node, msg) {
            if (canSaveInStore(base, node, msg)) {
                if (!data[node.id]) {
                    data[node.id] = []
                }
                data[node.id].push(RED.util.cloneMessage(msg))
            }
        },
        filter,
        keepLatestPerTopic (base, node, maxPoints) {
            const currentData = data[node.id]
            if (!Array.isArray(currentData)) {
                return
            }
            const counts = {}
            const keep = []
            let trimmed = false
            for (let i = currentData.length - 1; i >= 0; i--) {
                const topic = currentData[i].topic
                counts[topic] = (counts[topic] || 0) + 1
                if (counts[topic] <= maxPoints) {
                    keep[i] = true
                } else {
                    trimmed = true
                }
            }
            if (trimmed) {
                filter(base, node, (m, i) => keep[i])
            }
        }
    }
}
