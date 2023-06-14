// initial state
const state = () => ({
    pages: null,
    widgets: null
})

// getters
const getters = {
    pages (state) {
        return state.settings
    },
    widgets (state) {
        return state.settings
    }
}

const mutations = {
    pages (state, pages) {
        state.pages = pages
    },
    widgets (state, widgets) {
        state.widgets = widgets
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations
}
