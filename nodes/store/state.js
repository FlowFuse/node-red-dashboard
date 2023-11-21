// Store to manage any dynamic properties set

const state = {}

const getters = {
    // given a widget id, return all dynamically set properties
    all (id) {
        return state[id]
    },
    // given a widget id, return a specific dynamically set property
    property (id, property) {
        return state[id][property]
    }
}

const setters = {
    // given a widget id, property and value
    set (id, prop, value) {
        if (!state[id]) {
            state[id] = {}
        }
        state[id][prop] = value
    },
    // remove data associated to a given widget
    reset (id) {
        delete state[id]
    }
}

module.exports = {
    getAll: getters.all,
    getProperty: getters.property,
    set: setters.set,
    reset: setters.reset
}
