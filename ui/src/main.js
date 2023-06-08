import { createApp } from 'vue'
import App from './App.vue'

// const { createApp } = require('vue')
// const App = require('./App.vue')

module.exports = {
    create: function () {
        createApp(App).mount('#app')
    }
}
