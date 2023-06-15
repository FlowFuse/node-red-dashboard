<template>
    <v-app>
        <router-view></router-view>
        <v-btn @click="send">Send Message</v-btn>
        <v-btn @click="go('TestView')">Navigate to Test Route</v-btn>
        <div>
            <v-btn v-for="page in pages" :key="page.id" @click="go(page.route.name)">{{ page.name }} ({{ page.route.path }})</v-btn>
        </div>

        <h1>Pages:</h1>
        {{ pages }}
        <h1>Widgets:</h1>
        {{ widgets }}
        <img alt="Vue logo" src="./assets/logo.png">
    </v-app>
</template>

<script>
import { mapState } from 'vuex'
import { markRaw } from 'vue'

import layouts from './layouts' // import all layouts
import widgetComponents from './widgets' // import all Vue Widget Components

export default {
    name: 'App',
    computed: {
        ...mapState('ui', ['dashboards', 'pages', 'widgets'])
    },
    created () {
        this.$socket.on("ui-config", (topic, payload) => {
            console.log("ui config")
            console.log(topic, payload)
            
            // loop over pages, add to vue router
            Object.values(payload.pages).forEach(page => {
                const route = payload.dashboards[page.ui].path + page.path
                const routeName = 'Page:' + page.name
                console.log("adding route", route)
                this.$router?.addRoute({
                    path: route,
                    name: routeName,
                    component: layouts[page.layout],
                    meta: {
                        id: page.id
                    }
                })
                page.route = {
                    path: route,
                    name: routeName
                }
                this.$router.push({
                    name: routeName
                })
            })

            // loop over widgets, map in component
            Object.keys(payload.widgets).forEach(page => {
                Object.values(payload.widgets[page]).forEach(widget => {
                    console.log("adding widget", widget)
                    // widget.component = 'hello world'
                    widget.component = markRaw(widgetComponents[widget.type])
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
