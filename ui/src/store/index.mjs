/* eslint-disable import/order */
import { createStore } from 'vuex'

import ui from './ui.mjs'
import data from './data.mjs'
import setup from './setup.mjs'

export default createStore({
    modules: {
        ui,
        data,
        setup
    },
    plugins: []
})
