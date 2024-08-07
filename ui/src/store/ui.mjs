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
    pageByName: (state) => (name) => {
        if (state.pages) {
            return Object.values(state.pages).filter((p) => {
                return p.name === name
            })
        }
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
    widgetsByPage: (state) => (pageId) => {
        if (state.widgets) {
            const widgetsOnPage = Object.values(state.widgets)
                .filter((w) => {
                    // return all widgets that belong to the specified group (so long as it is not a non-local scoped ui-template)
                    return !w.props.group && w.props.page && w.props.page === pageId
                })
                .sort((a, b) => {
                    return a.props.order - b.props.order
                })
            return widgetsOnPage
        }
    },
    widgetsByGroup: (state) => (groupId) => {
        if (state.widgets) {
            // Since there could be several widgets in a subflow, we need to first group them by subflow.id
            // and then sort each widget in the grouped data by layout.order
            // then sort the groups by subflow.order

            // First though, filter out any non-local scoped ui-templates
            const widgetsInGroup = Object.values(state.widgets).filter((w) => {
                // return all widgets that belong to the specified group (so long as it is not a non-local scoped ui-template)
                return w.props.group === groupId && !(w.type === 'ui-template' && w.props.templateScope !== 'local')
            })

            // SORTING:
            // 1. Group elements by subflow.id (or '_' if no subflow)
            const groupedByZ = widgetsInGroup.reduce((acc, curr) => {
                const subflowId = curr.props?.subflow?.id || '_'
                if (!acc[subflowId]) {
                    acc[subflowId] = []
                }
                acc[subflowId].push(curr)
                return acc
            }, {})

            // 2. Sort widgets inside each grouping by layout.order so that the widgets are in the correct order inside their respective sections
            for (const groupId in groupedByZ) {
                groupedByZ[groupId].sort((a, b) => {
                    // If props.subflow.order is the same, sort by layout.order
                    const aOrder = a.layout.order || Number.MAX_SAFE_INTEGER
                    const bOrder = b.layout.order || Number.MAX_SAFE_INTEGER
                    return aOrder - bOrder
                })
            }

            // 3. now sort each grouping by subflow.order (use the first object in the group)
            // NOTE: in cases where the grouping is NOT a subflow (i.e. a normal flow with ui elements), the use layout.order
            const sortedGroups = Object.entries(groupedByZ).sort((a, b) => {
                const o1 = a[1][0]?.props?.subflow?.order || a[1][0]?.layout?.order || Number.MAX_SAFE_INTEGER
                const o2 = b[1][0]?.props?.subflow?.order || b[1][0]?.layout?.order || Number.MAX_SAFE_INTEGER
                return o1 - o2
            })

            // 4. Flatten the grouped data back into a single array
            const sorted = sortedGroups.flatMap((e) => e[1])
            // sortData2(widgetsInGroup).map(e=>{ return {widgetorder: e.layout.order, ...{ ...(e.props.subflow ||{})}}})
            return sorted
        }
    },
    /**
     *
     * @param {*} item - 'page' || 'group' || 'widget'
     * @returns
     */
    findBy: (state) => (item, prop, value) => {
        if (state[item + 's']) {
            return Object.values(state[item + 's']).filter((i) => {
                return i[prop] === value
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
        state.dashboards = {
            ...state.dashboards,
            ...dashboards
        }
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
        const wId = data.widgetId
        const config = data.config

        for (const prop in config) {
            state.widgets[wId].state[prop] = config[prop]
        }
    },
    /**
     *
     * @param {*} item - 'page' || 'group' || 'widget'
     * @returns
     */
    setProperty (state, { item, itemId, property, value }) {
        state[item + 's'][itemId][property] = value
    },
    setProperties (state, { item, itemId, config }) {
        for (const prop in config) {
            state[item + 's'][itemId][prop] = config[prop]
        }
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations
}
