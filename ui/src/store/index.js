import { createStore } from 'vuex'

import dashboard from './dashboard.js'

export default createStore({
    modules: {
        dashboard
    },
    plugins: []
})
