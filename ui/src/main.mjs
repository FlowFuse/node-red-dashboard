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
import Resize from './directives/resize.js'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Labs Imports
import { VNumberInput } from 'vuetify/labs/VNumberInput'
import { VTreeview } from 'vuetify/labs/VTreeview'
import { VTimePicker } from 'vuetify/labs/VTimePicker'

import './stylesheets/common.css'

import store from './store/index.mjs'
import { useDataTracker } from './widgets/data-tracker.mjs' // eslint-disable-line import/order

// Retrieve the "Default" theme from cache
function retrieveDefaultThemeFromCache () {
    const cachedTheme = localStorage.getItem('ndrb-theme-default')
    if (cachedTheme) {
        return JSON.parse(cachedTheme)
    }
    return null
}

const defaultTheme = retrieveDefaultThemeFromCache()

// set a base theme on which we will add our custom NR-defined theme (initially set to the default theme if exists in cache)
const theme = {
    dark: false,
    colors: {
        background: defaultTheme ? defaultTheme.colors.bgPage : '#fff',
        'navigation-background': defaultTheme ? defaultTheme.colors.surface : '#ffffff',
        'group-background': defaultTheme ? defaultTheme.colors.groupBg : '#ffffff',
        'group-outline': defaultTheme ? defaultTheme.colors.groupOutline : '#d1d1d1',
        primary: defaultTheme ? defaultTheme.colors.primary : '#0094CE',
        accent: '#ff6b99',
        secondary: '#26ff8c',
        success: '#a5d64c',
        surface: defaultTheme ? defaultTheme.colors.surface : '#ffffff',
        info: '#ff53d0',
        warning: '#ff8e00',
        error: '#ff5252'
    }
}

const vuetify = createVuetify({
    components: {
        ...components,
        VNumberInput,
        VTreeview,
        VTimePicker
    },
    directives: {
        ...directives,
        resize: Resize
    },
    theme: {
        defaultTheme: 'nrdb',
        themes: {
            nrdb: theme
        }
    },
    defaults: {
        global: {
            density: 'default'
        }
    }
})

const host = new URL(window.location.href)

function forcePageReload (err) {
    console.log('Reloading page:', err)
    console.log('redirecting to:', window.location.origin + '/dashboard')

    // Reloading dashboard without using cache by appending a cache-busting string to fully reload page to allow redirecting to auth
    const url = new URL(window.location.origin + '/dashboard')
    url.searchParams.set('reloadTime', Date.now().toString() + Math.random())
    if (host.searchParams.has('edit-key')) {
        url.searchParams.set('edit-key', host.searchParams.get('edit-key'))
    }
    window.location.replace(url)
}

/*
 * Configure SocketIO Client to Interact with Node-RED
 */

// if our socket disconnects, we should inform the user when it reconnects

// GET our SocketIO Config from Node-RED & any other bits plugins have added to the _setup endpoint
fetch('_setup')
    .then(async (response) => {
        switch (true) {
        case !response.ok && response.status === 401:
            forcePageReload('Unauthenticated')
            return
        case !response.ok:
            console.error('Failed to fetch setup data:', response)
            throw new Error('Failed to fetch setup data:', response)
        case host.origin !== new URL(response.url).origin: {
            console.log('Following redirect:', response.url)
            const url = new URL(response.url)
            if (host.searchParams.has('edit-key')) {
                url.searchParams.set('edit-key', host.searchParams.get('edit-key'))
            }
            window.location.replace(url)
            return
        }
        default:
            break
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
        let retryCount = 0 // number of reconnection attempts made

        let reconnectTO = null
        const MAX_RETRIES = 22 // 4 at 2.5 seconds, 10 at 5 secs then 8 at 30 seconds
        const editKey = host.searchParams.get('edit-key')
        const socket = io({
            ...setup.socketio,
            reconnection: false,
            query: editKey ? { editKey } : undefined // include handshake data so that only original edit-key holder can edit
        })

        // handle final disconnection
        socket.on('disconnect', (reason) => {
            if (!disconnected) {
                retryCount = 0
                disconnected = true
            }

            const dashboard = store.getters['ui/dashboard']
            if (dashboard?.showDisconnectNotification) {
                // tell the user we're trying to connect
                Alerts.emit('Connection Lost', 'Attempting to reconnect to server...', 'red', {
                    displayTime: 0, // displayTime 0 persists notifications until another notification closes it
                    allowDismiss: false,
                    showCountdown: false
                })
            }
            // attempt to reconnect
            reconnect()
        })

        socket.on('connect', () => {
            console.log('SIO connected')
            // if we've just disconnected (i.e. aren't connecting for the first time)
            if (disconnected) {
                // check vuex store here
                const dashboard = store.getters['ui/dashboard']
                if (dashboard?.showReconnectNotification) {
                // send a notification/alert to the user to let them know the connection is live again
                    Alerts.emit('Connected', 'Connection re-established.', '#1BC318', {
                        displayTime: dashboard?.notificationDisplayTime || 5, // default: 5 seconds
                        allowDismiss: true,
                        showCountdown: true
                    })
                } else {
                    //, send a notification for 1 ms to close the disconnected notification
                    Alerts.emit('Connected', 'Connection re-established.', '#1BC318', {
                        displayTime: 0.001, // 1 ms
                        allowDismiss: false,
                        showCountdown: false
                    })
                }
            }
            disconnected = false
            clearTimeout(reconnectTO)
        })

        socket.on('connect_error', (err) => {
            console.error('SIO connect error:', err, `err: ${JSON.stringify(err)}`)
            if (err?.code === 'parser error') {
                // There has been a 'parser error' during the attempt to connect. This means that socket.io
                // does not like the response from the server from the attempt to connect.
                // This happens if there is a proxy server in front of node red that has redirected to
                // a login page. There may also be other situations under which this error occurs, but whatever the
                // cause it doesn't seem that we can do much other than force a reload.
                forcePageReload('parser error')
            }
        })

        // default interval - every 2.5 seconds
        function reconnect (interval = 2500) {
            if (disconnected) {
                socket.connect()
                if (retryCount >= 14) {
                    // trying for over 1 minute
                    interval = 30000 // interval at 30 seconds
                } else if (retryCount >= 4) {
                    // trying for over 10 seconds
                    interval = 5000 // interval at 5 seconds
                }
                retryCount++
                // if still within our maximum retry count
                if (retryCount <= MAX_RETRIES) {
                    // check for a connection again in <interval> milliseconds
                    reconnectTO = setTimeout(reconnect, interval)
                } else {
                    // we have been retrying for 5 minutes so give up and reload the page
                    forcePageReload('Too many retries')
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
        app.mixin({
            methods: {
                setDynamicProperties (config) {
                    this.$store.commit('ui/widgetState', {
                        widgetId: this.id,
                        config
                    })
                },
                updateDynamicProperty (property, value) {
                    if (!property && typeof property !== 'string') {
                        throw new Error('updateDynamicProperty requires a valid, string "property" argument')
                    }
                    if (typeof value !== 'undefined') {
                        const config = {}
                        config[property] = value
                        this.$store.commit('ui/widgetState', {
                            widgetId: this.id,
                            config
                        })
                    }
                },
                // retrieves a property from the store for a given widget
                getProperty (property) {
                    const config = this.props ? this.props[property] : null // last known value for the config of this widget property
                    const state = this.state[property] // chec if there have been any dynamic updates to this property
                    // return the dynamic property if it exists, otherwise return the last known configuration
                    return this.state && property in this.state && state !== null ? state : config
                }
            }
        })

        // make the socket service available app-wide via this.$socket
        app.provide('$socket', socket)
        app.provide('$dataTracker', useDataTracker)

        // mount the VueJS app into <div id="app"></div> in /ui/public/index.html
        app.mount('#app')
    })
    .catch((err) => {
        function handleOnline () {
            // remove the online event listener and reload the page
            window.removeEventListener('online', handleOnline)
            location.reload()
        }

        // loads minimal VueJS app to display error message and options to user
        function loadFallback (error) {
            // pass the error to the Vuex store
            store.commit('setup/setError', error)
            const app = Vue.createApp(App)
                .use(store)
                .use(vuetify)
                .use(router)

            const head = createHead()
            app.use(head)
            app.mixin(VueHeadMixin)

            // mount the VueJS app into <div id="app"></div> in /ui/public/index.html
            app.mount('#app')
        }

        let error = {}
        if (navigator.onLine) {
            if (err instanceof TypeError && err.message === 'Failed to fetch') {
                forcePageReload(err)
            } else {
                error = { error: err, type: 'server unreachable', message: 'There was an error loading the Dashboard.' }
                loadFallback(error)
                // Add timer to reload the page every 20 seconds
                setInterval(() => {
                    location.reload()
                }, 20000)
            }
        } else {
            // Add event listener
            window.addEventListener('online', handleOnline)
            error = { error: err, type: 'no internet', message: 'Your device appears to be offline.' }
            loadFallback(error)
        }
    })
