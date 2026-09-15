const CLIENT_ID_KEY = 'nrdb-client-id'

function generateClientId () {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function getOrCreateClientId (getStorage, generate = generateClientId) {
    try {
        const storage = typeof getStorage === 'function' ? getStorage() : getStorage
        const existing = storage.getItem(CLIENT_ID_KEY)
        if (existing) {
            return existing
        }
        const id = generate()
        storage.setItem(CLIENT_ID_KEY, id)
        return id
    } catch (_error) {
        return generate()
    }
}

export { getOrCreateClientId }

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getOrCreateClientId }
    module.exports.default = module.exports
}
