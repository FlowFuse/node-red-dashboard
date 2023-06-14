<template>
  <nrdb-header></nrdb-header>
  <main>
      <button @click="send">Send Message</button>
      <router-view></router-view>
      <h1>Pages:</h1>
      {{ pages }}
      <h1>Widgets:</h1>
      {{ widgets }}
  </main>
  <img alt="Vue logo" src="./assets/logo.png">
</template>

<script>
import { mapState } from 'vuex'
import NRDBHeader from './components/header/Header'

// import Flex from './layouts/Flex' // import all layouts

export default {
    name: 'App',
    components: {
        'nrdb-header': NRDBHeader
    },
    computed: {
        ...mapState('dashboard', ['pages', 'widgets'])
    },
    created () {
        this.$socket.on("ui-config", (topic, payload) => {
            console.log("ui config")
            console.log(topic, payload)
            this.widgets = Object.values(payload.widgets)
            this.$store.commit('dashboard/pages', payload.pages)
            this.$store.commit('dashboard/widgets', payload.widgets)

            const layouts = {
                'flex': 'hello world' // Flex
            }
            
            Object.values(payload.pages).forEach(page => {
                console.log(page)
                console.log(layouts[page.layout])
                this.$router?.addRoute({
                    path: page.path,
                    component: layouts[page.layout]
                })
            })
        })
    },
    methods: {
        send: function () {
            this.$socket.emit('widget-action', '<node-id>', 'hello world');
        }
    },
}
</script>

<style>
@import "./stylesheets/common.css";
</style>
