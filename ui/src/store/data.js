/**
 * Vuex store for tracking data bound to each widget
 */

// initial state is empty - we don't know if we have any widgets
const state = () => ({
    values: {}
})

const mutations = {
    bind (state, payload) {
        const widgetId = payload.widgetId
        const data = payload.data
        state.values[widgetId] = data
        console.log(widgetId)
        console.log(data)
    }
}

export default {
    namespaced: true,
    state,
    mutations
}
