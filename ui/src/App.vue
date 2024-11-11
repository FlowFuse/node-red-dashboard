<template>
    <v-app>
        <div v-if="error" class="nrdb-placeholder-container">
            <div class="nrdb-placeholder">
                <img src="./assets/logo.png">
                <h1>Node-RED Dashboard 2.0</h1>
                <img src="./assets/disconnected.png">
                <!-- eslint-disable-next-line vue/no-v-html -->
                <p :class="'status-warning'" v-html="error.message" />
                <br>
                <h4>What you can try:</h4>
                <div v-if="error.type === 'server unreachable'" style="border: none" class="nrdb-placeholder">
                    <v-btn rounded class="nrdb-placeholder-btns" @click="reloadApp">
                        Reload App
                    </v-btn>
                    <br>
                    <v-btn rounded class="nrdb-placeholder-btns" @click="contactAdmin">
                        Contact Admin
                    </v-btn>
                </div>
                <div v-else-if="error.type === 'no internet'" style="border: none" class="nrdb-placeholder">
                    <v-btn rounded class="nrdb-placeholder-btns" @click="reloadApp">
                        Reload App
                    </v-btn>
                </div>
            </div>
        </div>
        <div v-else-if="loading" class="nrdb-splash-loading">
            <DashboardLoading />
            Loading...
        </div>
        <router-view v-else-if="!status" />
        <div v-else class="nrdb-placeholder-container">
            <div class="nrdb-placeholder">
                <img src="./assets/logo.png">
                <h1>Node-RED Dashboard 2.0</h1>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <p :class="'status-' + status.type" v-html="status.msg" />
            </div>
        </div>
        <PWABadge />
    </v-app>
</template>

<script>
import { mapState } from 'vuex'
import { markRaw } from 'vue' // eslint-disable-line import/order
import { initialise as initEditMode } from './EditTracking.js'

import PWABadge from './components/PWABadge.vue'
import DashboardLoading from './components/loading.vue'
import DebugView from './debug/Debug.vue' // import the Debug View for a Dashboard
import layouts from './layouts/index.mjs' // import all layouts
import { importExternalComponent } from './util.mjs'
import widgetComponents from './widgets/index.mjs' // import all Vue Widget Components\

export default {
    name: 'App',
    components: {
        DashboardLoading,
        PWABadge
    },
    inject: ['$socket'],
    data () {
        return {
            loading: true
        }
    },
    computed: {
        ...mapState('ui', ['dashboards', 'pages', 'widgets']),
        ...mapState('setup', ['setup']),
        ...mapState('setup', ['error']),

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
        this.$socket.on('ui-config', (topic, payload) => {
            this.loading = false
            console.log('ui-config received. topic:', topic, 'payload:', payload)

            // Create Debug Endpoints
            Object.values(payload.dashboards).forEach(ui => {
                // currently, we can only have one ui
                // if we are running on a proxy, we need to change ui.path to whatever our proxy has been configured as
                ui.path = this.setup.basePath

                const path = (ui.path + '/_debug').replace(/\/\//g, '/')
                this.$router?.addRoute({
                    path,
                    name: `${ui.id}_debug`,
                    component: DebugView,
                    meta: {
                        dashboard: ui.id // the dashboard id - to simplify determining which dashboard we're on
                    }
                })
            })

            // Check for edit key in query and if it matches the edit key in the
            // configs meta.wysiwyg object, we can enable WYSIWYG editing mode for the page.
            // The initEditMode setup fn in EditTracking.js module stores this and it is used to enable
            // the WYSIWYG edit tracking for the page in question.
            const editKeyInUrl = new URLSearchParams(window.location.search).get('edit-key')
            const editorPath = new URLSearchParams(window.location.search).get('editor-path')

            const pageIdOk = payload.meta?.wysiwyg?.page && !!payload.pages[payload.meta.wysiwyg.page] && editKeyInUrl === payload.meta.wysiwyg.editKey
            const dashboardIdOk = payload.meta?.wysiwyg?.dashboard && !!payload.dashboards[payload.meta.wysiwyg.dashboard]
            if (payload.meta?.wysiwyg?.enabled && editKeyInUrl && pageIdOk && dashboardIdOk) {
                initEditMode(editKeyInUrl, payload.meta.wysiwyg.page, editorPath)
            }

            // loop over pages, add them to vue router
            Object.values(payload.pages).forEach(page => {
                // check that the page's bound UI is also in our config
                if (payload.dashboards[page.ui]) {
                    // const ui = payload.dashboards[page.ui]
                    // re-write base path in case of proxy & httpNodeRoot
                    const route = (this.setup.basePath + page.path).replace(/\/\//g, '/')

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

            if (payload.pages && Object.values(payload.pages).length > 0) {
                const defaultPage = Object.values(payload.pages).sort((a, b) => a.order - b.order)[0]
                // add catch all - this ensures we navigate to _something_ when the app loads
                // default to the first page added (for now)
                this.$router?.addRoute({
                    path: '/:pathMatch(.*)*',
                    redirect: payload.dashboards[defaultPage.ui].path + defaultPage.path
                })
            }

            // if this is the first time we load the Dashboard, the router hasn't registered the current route properly,
            // so best we just navigate to the existing URL to let router catch up
            this.$router.push(this.$route.fullPath)

            // loop over the widgets defined in Node-RED,
            // map their respective Vue component for rendering on a page
            Object.keys(payload.widgets).forEach(id => {
                const widget = payload.widgets[id]

                // allow for types not defined in code Dashboard, but assume they're utilising ui-template foundations as recommended
                widget.component = markRaw(widgetComponents[widget.type] || widgetComponents['ui-template'])
                if (widgetComponents[widget.type]) {
                    // Core Widgets
                    // allow for types not defined in code Dashboard, but assume they're utilising ui-template foundations as recommended
                    widget.component = markRaw(widgetComponents[widget.type])
                } else if (widget.src) {
                    // Third Party Widgets
                    const resource = `${widget.src.package}/${widget.src.src}`
                    widget.component = markRaw(importExternalComponent(resource, widget.src.name, widget.src.component))
                } else {
                    // Old Third Party Widgets - of which there shouldn't be any in the wild
                    console.warn('No Vue component found for ', widget.type, ' - falling back to ui-template')
                    widget.component = markRaw(widgetComponents['ui-template'])
                }
            })

            // store this data in our VueX store for access across the app
            this.$store.commit('ui/dashboards', payload.dashboards)
            this.$store.commit('ui/pages', payload.pages)
            this.$store.commit('ui/groups', payload.groups)
            this.$store.commit('ui/widgets', payload.widgets)
            this.$store.commit('ui/themes', payload.themes)

            for (const key in payload.themes) {
                // check if "Default Theme" theme exists
                if (payload.themes[key].name === 'Default Theme') {
                    // store the default theme in local storage for use when disconnected from Node-RED
                    localStorage.setItem('defaultNRDBTheme', JSON.stringify(payload.themes[key]))
                    break
                }
            }
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
        },
        reloadApp () {
            location.reload()
        },
        contactAdmin () {
            const email = ''
            const subject = 'Node-RED Dashboard Error'
            const body = 'Insert issue here...'
            const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
            window.open(mailtoLink, '_blank')
        }
    }
}
</script>

<style>
@import "./stylesheets/common.css";
</style>
