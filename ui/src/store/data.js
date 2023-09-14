/**
 * Vuex store for tracking data bound to each widget
 */

import { getDeepValue, hasProperty } from '../util.js'

// initial state is empty - we don't know if we have any widgets
const state = () => ({
    values: {},
    messages: {},
    properties: {}
})

// map of supported property messages
// Any msg received with a topic matching a key in this object will be stored in the properties object under the value of the key
// e.g. { topic: 'ui-property:class', payload: 'my-class' } will be stored as { class: 'my-class' }
const supportedPropertyMessages = {
    'ui-property:class': 'class'
}

const mutations = {
    bind (state, data) {
        const widgetId = data.widgetId
        // if packet contains a msg, then we process it
        if ('msg' in data) {
            // first, if the msg.topic is a supported property message, then we store it in the properties object
            // but do not store it in the messages object.
            // This permits the widget to receive property messages without affecting the widget's value
            if (data.msg?.topic && supportedPropertyMessages[data.msg.topic] && hasProperty(data.msg, 'payload')) {
                const controlProperty = supportedPropertyMessages[data.msg.topic]
                state.properties[widgetId] = state.properties[widgetId] || {}
                state.properties[widgetId][controlProperty] = data.msg.payload
                return // do not store in messages object
            }
            // if the msg was not a property message, then we store it in the messages object
            state.messages[widgetId] = data.msg
        }
    },
    append (state, data) {
        const widgetId = data.widgetId
        // if packet contains a msg, then we process it
        if ('msg' in data) {
            if (!state.messages[widgetId]) {
                state.messages[widgetId] = []
            }
            state.messages[widgetId].push(data.msg)
        }
    },
    /**
     *
     * @param {*} state
     * @param {*} data  - object defining:
     *  widgetId - The id of the widget in question
     *  min      - the minimum value allowed for _datapoint.x
     *  points   - the maximum number of points allowed in the history
     */
    restrict (state, data) {
        const widgetId = data.widgetId
        // if packet contains a msg, then we process it
        if ('min' in data) {
            const cutoff = data.min
            state.messages[widgetId] = state.messages[widgetId].filter((msg) => {
                return msg._datapoint.x > cutoff
            })
        }

        if ('points' in data) {
            const points = data.points
            state.messages[widgetId] = state.messages[widgetId].slice(-points)
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
