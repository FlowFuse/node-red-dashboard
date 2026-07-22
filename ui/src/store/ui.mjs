/**
 * @typedef {Object} Group
 * @property {string} id - the group ID
 * @property {'ui-group'} type
 * @property {string} page - owner page ID
 * @property {*} [*] - Other group properties
 */
/**
 * @typedef {Object} Widget
 * @property {string} id - the widget ID
 * @property {string} type - the widget type e.g. ui-button, ui-text, ui-template
 * @property {Object} props - the widget properties (typically the node properties)
 * @property {Object} layout - the widget layout properties
 * @property {Number | String} layout.order - order of the widget in the group
 * @property {Number | String} layout.width - width of the widget in the group
 * @property {Number | String} layout.height - height of the widget in the group
 * @property {Object} state
 * @property {Object} component
 */
/**
 * @typedef {Object.<string, Widget>} Widgets - Widget ID to Widget lookup as per ui store state format
 */
/**
 * @typedef {Array<Group>} PageGroups - Array of Group on the current given page
 */
/**
 * @typedef {Object.<string, Array<Widget>} PageGroupsWidgets - Look up of Group ID to Array of Widgets for the current page
 */

// initial state
const state = () => ({
    dashboards: null,
    pages: null,
    themes: null,
    /** @type {Widgets} */
    groups: null,
    /** @type {Widgets} */
    widgets: null
})

// getters
const getters = {
    id: (state) => {
        // should only be one dashboard for now
        console.log(state.dashboards)
        const id = state.dashboards ? Object.keys(state.dashboards)[0] : null
        return id
    },
    dashboards (state) {
        return state.dashboards
    },
    dashboard (state) {
        const dashboards = Object.keys(state.dashboards)
        const id = dashboards.length ? dashboards[0] : undefined
        return id ? state.dashboards[id] : undefined
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
            // Widgets in a group share a single ordering space (assigned in the editor's layout manager,
            // where both regular widgets and subflow instances get a sequential order). The complication
            // is that a single subflow instance can contribute several widgets which must stay contiguous.
            // So we build a list of sortable "units": each regular widget is its own unit (ordered by its
            // layout.order), while all widgets belonging to the same subflow instance collapse into one
            // unit (ordered by subflow.order). Sorting the units together lets a subflow be positioned
            // freely between regular widgets, rather than only before/after the whole block of them.

            // First though, filter out any non-local scoped ui-templates
            const widgetsInGroup = Object.values(state.widgets).filter((w) => {
                // return all widgets that belong to the specified group (so long as it is not a non-local scoped ui-template)
                return w.props.group === groupId && !(w.type === 'ui-template' && w.props.templateScope !== 'local')
            })

            // 1. Build sortable units. A regular widget => its own unit; widgets from the same subflow
            //    instance => a single shared unit so they render contiguously.
            const subflowUnits = {}
            const units = []
            widgetsInGroup.forEach((w) => {
                const subflowId = w.props?.subflow?.id
                if (subflowId) {
                    if (!subflowUnits[subflowId]) {
                        subflowUnits[subflowId] = {
                            order: w.props.subflow.order || Number.MAX_SAFE_INTEGER,
                            widgets: []
                        }
                        units.push(subflowUnits[subflowId])
                    }
                    subflowUnits[subflowId].widgets.push(w)
                } else {
                    units.push({
                        order: w.layout?.order || Number.MAX_SAFE_INTEGER,
                        widgets: [w]
                    })
                }
            })

            // 2. Sort widgets within each subflow unit by their own layout.order.
            units.forEach((unit) => {
                if (unit.widgets.length > 1) {
                    unit.widgets.sort((a, b) => {
                        const aOrder = a.layout?.order || Number.MAX_SAFE_INTEGER
                        const bOrder = b.layout?.order || Number.MAX_SAFE_INTEGER
                        return aOrder - bOrder
                    })
                }
            })

            // 3. Sort the units together in the shared ordering space, then flatten back to a widget list.
            units.sort((a, b) => a.order - b.order)
            return units.flatMap((unit) => unit.widgets)
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
            if (state.widgets[wId]) {
                state.widgets[wId].state[prop] = config[prop]
            }
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
