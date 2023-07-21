import { createApp } from 'vue'
import App from './App.vue'
import { io } from 'socket.io-client'
import router from './router.js'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// set a base theme on which we will add our custom NR-defined theme
const theme =  {
    dark: false,
    colors: {
        background: '#0000ff',
        'group-background': '#ffffff',
        primary: "#0000ff",
        accent: "#ff6b99",
        secondary: "#26ff8c",
        success: "#a5d64c",
        surface: "#ffffff",
        info: "#ff53d0",
        warning: "#ff8e00",
        error: "#ff5252"
    }
}

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: "nrdb",
        themes: {
            "nrdb": theme
        },
    },
})

import store from './store/index.js'

// widgets
import UIText from './widgets/ui-text/UIText'
/**
 * Configure SocketIO Client to Interact with Node-RED
 */

var socket = io({
    path: "/ui/socket.io"
});

// handle final disconnection
socket.on("disconnect", (reason) => {
    console.log("SIO disconnected", reason)
})

socket.on("connect", () => {
    console.log("SIO connected")
})

socket.on("connect_error", (err) => {
    console.log("SIO connect error:", err, err.data)
})

/**
 * Create VueJS App
 */
const app = createApp(App)
    .use(store)
    .use(vuetify)
    .use(router)

// make the socket service available app-wide via this.$socket
app.provide('$socket', socket)

// widgets
app.component('ui-text', UIText)

// mount the VueJS app into <div id="app"></div> in /ui/public/index.html
app.mount('#app')
