/* eslint-disable import/order */
import { createStore } from 'vuex'

import ui from './ui.mjs'
import data from './data.mjs'
import setup from './setup.mjs'
import wysiwyg from './wysiwyg.mjs'
import i18n from './modules/i18n.js'

export default createStore({
    modules: {
        ui,
        data,
        setup,
        wysiwyg,
        i18n
    },
    plugins: []
})
