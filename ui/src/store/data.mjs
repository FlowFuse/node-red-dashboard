/**
 * Vuex store for tracking data bound to each widget
 */

import { getDeepValue } from '../util.mjs'

// initial state is empty - we don't know if we have any widgets
const state = () => ({
    values: {},
    messages: {},
    properties: {},
    /** @type {SpeechSynthesisVoice[]} */
    voices: []
})

const mutations = {
    /**
     * Delete all messages for a specific widget
     * @param {Object} state
     * @param {Object} data
     * @param {String} widgetId - The id of the widget whose messages should be deleted
     */
    deleteMessages (state, data) {
        const widgetId = data.widgetId
        delete state.messages[widgetId]
    },
    bind (state, data) {
        const widgetId = data.widgetId
        // if packet contains a msg, then we process it
        if ('msg' in data) {
            // merge with any existing data and override relevant properties
            state.messages[widgetId] = {
                ...state.messages[widgetId],
                ...data.msg
            }
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
            state.messages[widgetId] = state.messages[widgetId]?.filter((msg) => {
                return msg._datapoint.x > cutoff
            })
        }

        if ('points' in data) {
            const points = data.points
            state.messages[widgetId] = state.messages[widgetId]?.slice(-points)
        }
    },

    /**
     * Set the available speech synthesis voices
     * @param {*} state
     * @param {SpeechSynthesisVoice[]} voices
     */
    setVoices (state, voices) {
        console.log('Mutating voices', voices)
        state.voices = voices
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
    },
    // get voices
    voices: (state) => {
        console.log('Getting voices', state.voices)
        return { voices: state.voices }
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    getters
}
