/* eslint-disable n/no-missing-import */
/* eslint-disable n/file-extension-in-import */
/* eslint-disable import/no-unresolved */

// initial state
const state = () => ({
    dashboards: null,
    pages: null,
    groups: null,
    themes: null,
    widgets: null
})

// getters
const getters = {
    dashboards (state) {
        return state.dashboards
    },
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
                // return all widgets that belong to the specified group (so long as it is not a non-local scoped ui-template)
                return w.props.group === groupId && !(w.type === 'ui-template' && w.props.templateScope !== 'local')
            })
            // sort by .order
            return widgetsInGroup.sort((a, b) => {
                // if order = 0, prioritise groups where order _is_ set
                const aOrder = a.props?.order || Number.MAX_SAFE_INTEGER
                const bOrder = b.props?.order || Number.MAX_SAFE_INTEGER
                return aOrder - bOrder
            })
        }
    },
    siteTemplates: (state) => (dashboardId) => {
        if (state.widgets) {
            const siteTemplates = Object.values(state.widgets).filter((w) => {
                // only return templates where templateScope matches /^site:/ and belong to the specified dashboard
                return w.type === 'ui-template' && w.props.dashboard === dashboardId && w.props.templateScope.match(/^site:/)
            })
            return siteTemplates
        }
    },
    pageTemplates: (state) => (pageId) => {
        if (state.widgets) {
            const pageTemplates = Object.values(state.widgets).filter((w) => {
                // only return templates where templateScope matches /^page:/ and belong to the specified page
                return w.type === 'ui-template' && w.props.page === pageId && w.props.templateScope.match(/^page:/)
            })
            return pageTemplates
        }
    }
}

const mutations = {
    dashboards (state, dashboards) {
        state.dashboards = dashboards
    },
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
