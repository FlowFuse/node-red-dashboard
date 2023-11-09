<template>
    <v-app>
        <router-view v-if="!status" />
        <div v-else class="nrdb-placeholder-container">
            <div class="nrdb-placeholder">
                <img src="./assets/logo.png">
                <h1>Node-RED Dashboard 2.0</h1>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <p :class="'status-' + status.type" v-html="status.msg" />
            </div>
        </div>
    </v-app>
</template>

<script>
import { markRaw } from 'vue' // eslint-disable-line import/order
import { mapState } from 'vuex'

// eslint-disable-next-line n/no-missing-import
import layouts from './layouts' // import all layouts
// eslint-disable-next-line n/no-missing-import
import widgetComponents from './widgets'

console.log(loadModule) // import all Vue Widget Components

// const options = {
//     async getFile (url) {
//         console.log('get file', url)
//         return fetch(url).then((response) =>
//             response.ok ? response.text() : Promise.reject(response)
//         )
//     },
//     addStyle (textContent) {
//         const style = Object.assign(document.createElement('style'), { textContent })
//         const ref = document.head.getElementsByTagName('style')[0] || null
//         document.head.insertBefore(style, ref)
//     },
//     moduleCache: {
//         vue: Vue
//     }
// }

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
                        msg: 'We currently do not support multiple <code>ui-base</code> nodes in a single flow. <p>Please remove all but one (in the "config" menu on the right-side of Node-RED) and re-deploy.</p>'
                    }
                } else {
                    const pages = Object.values(this.pages)
                    let msg = null
                    for (let i = 0; i < pages.length; i++) {
                        const page = pages[i]
                        if (!dashboards.includes(page.ui)) {
                            // Catch instances of multiple Dashboards, or pages not bound to a Dashboard we know about
                            msg = {
                                type: 'warning',
                                msg: 'You have at least one <code>ui-page</code> that is mapped to a <code>ui-base</code> that we can\'t find. We currently do not support multiple <code>ui-base</code> nodes in a single flow, so can only import one at a time.<p>Please remove all but one (in the "config" menu on the right-side of Node-RED) and re-deploy.</p>'
                            }
                            break
                        }
                    }
                    if (msg) {
                        return msg
                    }
                }
                // check pages overlapping with URL
                if (this.pages) {
                    const endpoints = {}
                    const duplicates = {}
                    Object.values(this.pages).forEach(page => {
                        const route = this.dashboards[page.ui].path + page.path
                        if (endpoints[route]) {
                            if (!duplicates[route]) {
                                // our first instance of a duplicate
                                duplicates[route] = {
                                    pages: [endpoints[route]],
                                    route
                                }
                            }
                            duplicates[route].pages.push(page)
                        } else {
                            endpoints[route] = page
                        }
                    })
                    if (Object.keys(duplicates).length > 0) {
                        let msg = 'Warning: You have multiple pages configured with the same URL.'
                        let list = '<div class="status-duplicates">'
                        Object.values(duplicates).forEach((d) => {
                            d.pages.forEach((p) => {
                                list += `<div>${p.name} (path: ${p.path})</div>`
                            })
                        })
                        list += '</div>'
                        msg += list
                        return {
                            type: 'warning',
                            msg
                        }
                    }
                }
                return null
            } else {
                return {
                    type: 'info',
                    msg: 'Please add and configure your first Dashboard 2.0 node to get started.'
                }
            }
        }
    },
    created () {
        this.$socket.on('ui-config', async (topic, payload) => {
            console.log('ui-config received. topic:', topic, 'payload:', payload)

            // loop over pages, add them to vue router
            Object.values(payload.pages).forEach(page => {
                // check that the page's bound UI is also in our config
                if (payload.dashboards[page.ui]) {
                    const route = payload.dashboards[page.ui].path + page.path
                    const routeName = 'Page:' + page.name
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
            this.$router.push(this.$route.path)

            // loop over the widgets defined in Node-RED,
            // map their respective Vue component for rendering on a page
            Object.keys(payload.widgets).forEach(async id => {
                const widget = payload.widgets[id]
                if (widgetComponents[widget.type]) {
                    // Core Widgets
                    // allow for types not defined in code Dashboard, but assume they're utilising ui-template foundations as recommended
                    widget.component = markRaw(widgetComponents[widget.type])
                } else if (widget.src) {
                    debugger
                    // Third Party Widgets
                    console.log('widget.src', widget.src)
                    // widget.component = defineAsyncComponent(() => loadModule(widget.src.src, options))
                    const c = await import(/* @vite-ignore */ `/resources/${widget.src.package}/${widget.src.name}.mjs`)
                    console.log(c)
                    widget.component = this.use(c)
                } else {
                    // Old Third Party Widgets
                    widget.component = markRaw(widgetComponents['ui-template'])
                }
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
