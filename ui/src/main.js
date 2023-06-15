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

const vuetify = createVuetify({
  components,
  directives,
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
    console.log("SIO disconnect:", reason)
})

socket.on("connect", () => {
    console.log("SIO connected")
})

socket.on("msg", (topic, payload) => {
    console.log("msg received")
    console.log(topic, payload)
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
app.config.globalProperties.$socket = socket

// widgets
app.component('ui-text', UIText)

// mount the VueJS app into <div id="app"></div> in /ui/public/index.html
app.mount('#app')
