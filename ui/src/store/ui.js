import router from '../router'

// initial state
const state = () => ({
    pages: null,
    groups: null,
    themes: null,
    widgets: null
})

// getters
const getters = {
    pages (state) {
        return state.pages
    },
    groups (state) {
        return state.groups
    },
    themes (state) {
        return state.themes
    },
    widgets (state) {
        return state.widgets
    }
}

const mutations = {
    pages (state, pages) {
        state.pages = pages
    },
    groups (state, groups) {
        state.groups = groups
    },
    themes (state, themes) {
        state.themes = themes
    },
    widgets (state, widgets) {
        state.widgets = widgets
    },
    widgetState (state, data) {
        // TODO: Assumed widget is on the current page
        const pageId = router.currentRoute.value.meta.id
        const wId = data.widgetId
        console.log('widgetState', pageId, wId, data)

        if ('enabled' in data) {
            state.widgets[pageId][wId].state.enabled = data.enabled
        }
        if ('visible' in data) {
            state.widgets[pageId][wId].state.visible = data.visible
        }
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations
}
