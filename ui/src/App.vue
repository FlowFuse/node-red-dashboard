<template>
  <nrdb-header></nrdb-header>
  <main>
      <button @click="send">Send Message</button>
      <button @click="go('TestView')">Navigate to Test Route</button>
      <div>
        <button v-for="page in pages" :key="page.id" @click="go(page.route.name)">{{ page.name }} ({{ page.route.path }})</button>
      </div>
      <router-view :widgets="widgets"></router-view>
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

import Flex from './layouts/Flex' // import all layouts

export default {
    name: 'App',
    components: {
        'nrdb-header': NRDBHeader
    },
    computed: {
        ...mapState('ui', ['dashboards', 'pages', 'widgets'])
    },
    created () {
        this.$socket.on("ui-config", (topic, payload) => {
            console.log("ui config")
            console.log(topic, payload)
            this.widgets = Object.values(payload.widgets)

            console.log(Flex)

            const layouts = {
                'flex': Flex
            }
            
            Object.values(payload.pages).forEach(page => {
                const route = payload.dashboards[page.ui].path + page.path
                const routeName = 'Page:' + page.name
                console.log("adding route", route)
                this.$router?.addRoute({
                    path: route,
                    name: routeName,
                    component: layouts[page.layout]
                })
                page.route = {
                    path: route,
                    name: routeName
                }
                this.$router.push({
                    name: routeName
                })
            })

            this.$store.commit('ui/dashboards', payload.dashboards)
            this.$store.commit('ui/pages', payload.pages)
            this.$store.commit('ui/widgets', payload.widgets)
        })
    },
    methods: {
        send: function () {
            this.$socket.emit('widget-action', '<node-id>', 'hello world');
        },
        go: function (name) {
            this.$router.push({
                name
            })
        }
    },
}
</script>

<style>
@import "./stylesheets/common.css";
</style>
