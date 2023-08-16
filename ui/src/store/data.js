/**
 * Vuex store for tracking data bound to each widget
 */

import { getDeepValue } from '../util.js'

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

const getters = {
    // get the value of a widget's data
    value: (state) => (widgetId) => {
        return state.values[widgetId]
    },
    // get the message of a widget's data
    getMsgProperty: (state) => (widgetId, path, defaultValue) => {
        const msg = state.messages[widgetId] || {}
        return getDeepValue(msg, path, defaultValue)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    getters
}
