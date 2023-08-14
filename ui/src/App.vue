<template>
    <v-app>
        <router-view />
    </v-app>
</template>

<script>
import { mapState } from 'vuex'
import { markRaw } from 'vue' // eslint-disable-line import/order

// eslint-disable-next-line n/no-missing-import
import layouts from './layouts' // import all layouts
// eslint-disable-next-line n/no-missing-import
import widgetComponents from './widgets' // import all Vue Widget Components

export default {
    name: 'App',
    inject: ['$socket'],
    computed: {
        ...mapState('ui', ['dashboards', 'pages', 'widgets'])
    },
    created () {
        this.$socket.on('ui-config', (topic, payload) => {
            console.log('ui config')
            console.log(topic, payload)

            // loop over pages, add them to vue router
            Object.values(payload.pages).forEach(page => {
                const route = payload.dashboards[page.ui].path + page.path
                const routeName = 'Page:' + page.name
                console.log('adding route', route)
                this.$router?.addRoute({
                    path: route,
                    name: routeName,
                    component: layouts[page.layout],
                    meta: {
                        title: page.name,
                        id: page.id
                    }
                })
                // store data on the "page" object so it's easy for us to map in the navigation drawer
                page.route = {
                    path: route,
                    name: routeName
                }
                // navigate to this route, this ensures we navigate to _something_ when the app loads
                this.$router.push({
                    name: routeName
                })
            })

            // loop over the widgets defined in Node-RED,
            // map their respective Vue component for rendering on a page
            Object.keys(payload.widgets).forEach(id => {
                const widget = payload.widgets[id]
                widget.component = markRaw(widgetComponents[widget.type])
            })

            // store this data in our VueX store for access across the app
            this.$store.commit('ui/dashboards', payload.dashboards)
            this.$store.commit('ui/pages', payload.pages)
            this.$store.commit('ui/groups', payload.groups)
            this.$store.commit('ui/widgets', payload.widgets)
            this.$store.commit('ui/themes', payload.themes)
        })
    },
    methods: {
        send: function () {
            this.$socket.emit('widget-action', '<node-id>', 'hello world')
        },
        go: function (name) {
            this.$router.push({
                name
            })
        }
    }
}
</script>

<style>
@import "./stylesheets/common.css";
</style>
