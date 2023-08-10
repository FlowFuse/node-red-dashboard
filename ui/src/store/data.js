/**
 * Vuex store for tracking data bound to each widget
 */

// initial state is empty - we don't know if we have any widgets
const state = () => ({
    values: {},
    messages: {}
})

const mutations = {
    bind (state, data) {
        const widgetId = data.widgetId
        // if packet contains a msg, then we store it in the messages object
        if ('msg' in data) {
            state.messages[widgetId] = data.msg
        }
    }
}

export default {
    namespaced: true,
    state,
    mutations
}
