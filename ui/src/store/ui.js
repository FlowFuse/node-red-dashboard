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
    },
    groupsByPage: (state) => (pageId) => {
        if (state.groups) {
            var groupsOnPage = Object.values(state.groups).filter((p) => {
                return p.page === pageId;
            });
            return groupsOnPage
        }
        return
    },
    widgetsByGroup: (state) => (groupId) => {
        if (state.widgets) {
            var widgetsInGroup = Object.values(state.widgets).filter((w) => {
                return w.props.group === groupId;
            });
            return widgetsInGroup
        }
        return
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
            state.widgets[wId].state.enabled = data.enabled
        }
        if ('visible' in data) {
            state.widgets[wId].state.visible = data.visible
        }
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations
}
