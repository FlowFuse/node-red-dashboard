/* eslint-disable n/file-extension-in-import */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/order */
import { VueHeadMixin, createHead } from '@unhead/vue'
import * as Vue from 'vue'
import * as vuex from 'vuex'
import App from './App.vue'
import { io } from 'socket.io-client'
import router from './router.mjs'
import Alerts from './services/alerts.js'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Labs Imports
import { VNumberInput } from 'vuetify/labs/VNumberInput'
import { VTreeview } from 'vuetify/labs/VTreeview'

import './stylesheets/common.css'

import store from './store/index.mjs'

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

// if our scoket disconnects, we should inform the user when it reconnects

function forcePageReload (err) {
    console.log('auth error:', err)
    console.log('redirecting to:', window.location.origin + '/dashboard')

    // Reloading dashboard without using cache by apending a cache-busting string to fully reload page to allow redirecting to auth
    window.location.replace(window.location.origin + '/dashboard' + '?' + 'reloadTime=' + Date.now().toString() + Math.random()) // Seems to work on Edge and Chrome on Windows, Chromium and Firefox on Linux, and also on Chrome Android (and also as PWA App)
}

// GET our SocketIO Config from Node-RED & any other bits plugins have added to the _setup endpoint
fetch('_setup')
    .then(async (response) => {
        if (!response.ok && response.status === 401) {
            forcePageReload('Unauthenticated')
            return
        }

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

        let disconnected = false
        let disconnectedAt = null

        let reconnectTO = null
        const MAX_TIMER = 300000 // 5 minutes

        const socket = io({
            ...setup.socketio,
            reconnection: false
        })

        // handle final disconnection
        socket.on('disconnect', (reason) => {
            if (!disconnected) {
                disconnectedAt = new Date()
                disconnected = true
            }
            // tell the user we're trying to connect
            Alerts.emit('Connection Lost', 'Attempting to reconnect to server...', 'red', {
                displayTime: 0,
                allowDismiss: false,
                showCountdown: false
            })
            // attempt to reconnect
            reconnect()
        })

        socket.on('connect', () => {
            console.log('SIO connected')
            // if we've just disconnected (i.e. aren't connecting for the first time)
            if (disconnected) {
                // send a notification/alert to the user to let them know the connection is live again
                Alerts.emit('Connected', 'Connection re-established.', '#1BC318', {
                    displayTime: 3,
                    allowDismiss: true,
                    showCountdown: true
                })
            }
            disconnected = false
            clearTimeout(reconnectTO)
        })

        socket.on('connect_error', (err) => {
            console.error('SIO connect error:', err, err.data)
        })

        // default interval - every 5 seconds
        function reconnect (interval = 5000) {
            if (disconnected) {
                socket.connect()
                const now = new Date()
                if (now - disconnectedAt > 60000) {
                    // trying for over 1 minute
                    interval = 30000 // interval at 30 seconds
                }
                // if still within our maximum timer
                if (now - disconnectedAt < MAX_TIMER) {
                    // check for a connection again in <interval> milliseconds
                    reconnectTO = setTimeout(reconnect, interval)
                }
            }
        }

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
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
            forcePageReload(err)
        } else {
            // handle general errors here
            console.error('An error occurred:', err)
        }
    })
