<template>
    <v-app>
        <router-view>
            <div class="nrdb-placeholder-container">
                <div class="nrdb-placeholder">
                    <img src="./assets/logo.png">
                    <h1>Node-RED Dashboard 2.0</h1>
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <p :class="'status-' + status.type" v-html="status.msg" />
                </div>
            </div>
        </router-view>
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
        ...mapState('ui', ['dashboards', 'pages', 'widgets']),
        status: function () {
            if (this.dashboards) {
                const dashboards = Object.keys(this.dashboards)
                if (!dashboards || dashboards.length === 0) {
                    return {
                        type: 'info',
                        msg: 'Please add some Dashboard 2.0 nodes to your flow and re-deploy.'
                    }
                } else if (dashboards.length > 1) {
                    return {
                        type: 'warning',
                        msg: 'We currently do not support multiple <code>ui-base</code> nodes in a single flow.<p>Please remove all but one (in the "config" menu on the right-side of Node-RED) and re-deploy.</p>'
                    }
                }
                return {
                    type: 'warning',
                    msg: 'Hmmm... Something unexpected has gone wrong. Please check the console for more information.'
                }
            } else {
                return {
                    type: 'info',
                    msg: 'Loading...'
                }
            }
        }
    },
    created () {
        this.$socket.on('ui-config', (topic, payload) => {
            console.log('ui-config received. topic:', topic, 'payload:', payload)

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
                        title: page.name, // the page name
                        id: page.id, // the pages id
                        dashboard: page.ui // the dashboard id - to simplify determining which dashboard we're on
                    }
                })
                // store data on the "page" object so it's easy for us to map in the navigation drawer
                page.route = {
                    path: route,
                    name: routeName
                }
            })

            // add catch all - this ensures we navigate to _something_ when the app loads
            // default to the first page added (for now)
            this.$router?.addRoute({
                path: '/:pathMatch(.*)*',
                redirect: payload.dashboards[Object.values(payload.pages)[0].ui].path + Object.values(payload.pages)[0].path
            })

            // if this is the first time we load hte Dashboard, the router hasn't registered the current route properly,
            // so best we just navigate to the existing URL to let router catch up
            // this.$router.push(this.$route.path)

            // loop over the widgets defined in Node-RED,
            // map their respective Vue component for rendering on a page
            Object.keys(payload.widgets).forEach(id => {
                const widget = payload.widgets[id]
                // allow for types not defined in code Dashboard, but assume they're utilising ui-template foundations as recommended
                widget.component = markRaw(widgetComponents[widget.type] || widgetComponents['ui-template'])
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
