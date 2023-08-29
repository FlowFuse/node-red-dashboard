/* eslint-disable n/no-missing-import */
/* eslint-disable n/file-extension-in-import */
/* eslint-disable import/no-unresolved */

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
            const groupsOnPage = Object.values(state.groups).filter((p) => {
                return p.page === pageId
            })
            // sort by .order
            return groupsOnPage.sort((a, b) => {
                // if order = 0, prioritise groups where order _is_ set
                const aOrder = a.order || Number.MAX_SAFE_INTEGER
                const bOrder = b.order || Number.MAX_SAFE_INTEGER
                return aOrder - bOrder
            })
        }
    },
    widgetsByGroup: (state) => (groupId) => {
        if (state.widgets) {
            const widgetsInGroup = Object.values(state.widgets).filter((w) => {
                return w.props.group === groupId
            })
            // sort by .order
            return widgetsInGroup.sort((a, b) => {
                // if order = 0, prioritise groups where order _is_ set
                const aOrder = a.props?.order || Number.MAX_SAFE_INTEGER
                const bOrder = b.props?.order || Number.MAX_SAFE_INTEGER
                return aOrder - bOrder
            })
        }
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
        const wId = data.widgetId

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
