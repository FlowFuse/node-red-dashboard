import { createStore } from 'vuex'

import ui from './ui.js'
import data from './data.js'

export default createStore({
    modules: {
        ui,
        data
    },
    plugins: []
})
