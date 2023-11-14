/* eslint-disable n/file-extension-in-import */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/order */
import { VueHeadMixin, createHead } from '@unhead/vue'
import { createApp } from 'vue'
import App from './App.vue'
import { io } from 'socket.io-client'
import router from './router.mjs'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import store from './store/index.mjs'

import './stylesheets/common.css'

// set a base theme on which we will add our custom NR-defined theme
const theme = {
    dark: false,
    colors: {
        background: '#fff',
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
    components,
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
// Inspect the current URL to determine the correct path to use for socket.io.
// for example, the base path might be `:1880/` or if `httpNodeRoot` is set, it could be something like `:1880/nr/endpoints/v1`
// 1. determine the base path to use (grab everything before the first /dashboard)
// 2. append '/socket.io' to the base path
// TODO: determine what to do when /dashboard is called something else (support multiple dashboards github #23 )
//       possible idea: pass the base path as a query param from the side bar, extract it then redirect?
const url = new URL(window.location.href)
const basePath = url.pathname.split('/dashboard')[0]
const path = basePath + '/dashboard/socket.io'
const socket = io({
    path
})

// handle final disconnection
socket.on('disconnect', (reason) => {
    console.log('SIO disconnected', reason)
})

socket.on('connect', () => {
    console.log('SIO connected')
})

socket.on('connect_error', (err) => {
    console.log('SIO connect error:', err, err.data)
})

/**
 * Create VueJS App
 */
const app = createApp(App)
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
