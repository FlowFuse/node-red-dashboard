/* eslint-disable n/file-extension-in-import */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/order */
import { VueHeadMixin, createHead } from '@unhead/vue'
import * as Vue from 'vue'
import * as vuex from 'vuex'
import App from './App.vue'
import { io } from 'socket.io-client'
import router from './router.mjs'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Labs Imports
import { VNumberInput } from 'vuetify/labs/VNumberInput'
import { VSparkline } from 'vuetify/labs/VSparkline'
import { VTreeview } from 'vuetify/labs/VTreeview'

import './stylesheets/common.css'

import store from './store/index.mjs'

// PWA
import { registerSW } from 'virtual:pwa-register'

// register service worker
registerSW({ immediate: true })

// set a base theme on which we will add our custom NR-defined theme
const theme = {
    dark: false,
    colors: {
        background: '#fff',
        'navigation-background': '#ffffff',
        'group-background': '#ffffff',
        primary: '#0000ff',
        accent: '#ff6b99',
        secondary: '#26ff8c',
        success: '#a5d64c',
        surface: '#ffffff',
        info: '#ff53d0',
        warning: '#ff8e00',
        error: '#ff5252'
    }
}

const vuetify = createVuetify({
    components: {
        ...components,
        VNumberInput,
        VSparkline,
        VTreeview
    },
    directives,
    theme: {
        defaultTheme: 'nrdb',
        themes: {
            nrdb: theme
        }
    }
})

/*
 * Configure SocketIO Client to Interact with Node-RED
 */

// GET our SocketIO Config from Node-RED & any other bits plugins have added to the _setup endpoint
fetch('_setup')
    .then(async (response) => {
        const url = new URL(response.url)
        const basePath = url.pathname.replace('/_setup', '')

        // get the setup JSON from the server
        const setup = await response.json()
        setup.basePath = basePath

        if (setup.socketio?.path) {
            // get text before /socket.io and replace it with the calculated basePath
            // basePath would have taken into account any proxy and/or httpNodeRoot settings
            const replace = setup.socketio.path.split('/socket.io')[0]
            setup.socketio.path = setup.socketio.path.replace(replace, basePath)
        }

        store.commit('setup/set', setup)

        const socket = io(setup.socketio)

        // handle final disconnection
        socket.on('disconnect', (reason) => {
            console.log('SIO disconnected', reason)
        })

        socket.on('connect', () => {
            console.log('SIO connected')
        })

        socket.on('connect_error', (err) => {
            console.error('SIO connect error:', err, err.data)
        })

        /**
         * Create VueJS App
         */
        window.Vue = Vue // make VueJS available globally for third-party NR widgets
        window.vuex = vuex // make Vuex available globally for third-party NR widgets
        const app = Vue.createApp(App)
            .use(store)
            .use(vuetify)
            .use(router)

        const head = createHead()
        app.use(head)
        app.mixin(VueHeadMixin)

        // make the socket service available app-wide via this.$socket
        app.provide('$socket', socket)

        // mount the VueJS app into <div id="app"></div> in /ui/public/index.html
        app.mount('#app')
    })
    .catch((err) => {
        console.log('auth error:', err)
    })
