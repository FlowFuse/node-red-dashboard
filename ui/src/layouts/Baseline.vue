<template>
    <v-app class="nrdb-app nrdb-app--baseline" :class="`nrdb-view-density--${density}`" :style="customThemeDefinitions">
        <v-app-bar v-if="appBarStyle !== 'hidden'" :style="{'position': navPosition}" :elevation="1">
            <template v-if="!['none', 'fixed', 'hidden'].includes(navigationStyle)" #prepend>
                <v-app-bar-nav-icon @click="handleNavigationClick" />
            </template>
            <v-app-bar-title>
                <template v-if="dashboard.headerContent !== 'none' && dashboard.headerContent !== false">
                    {{ computedPageTitle }}
                </template>
                <div id="app-bar-title" />
            </v-app-bar-title>
            <template #append>
                <div id="app-bar-actions" />
            </template>
        </v-app-bar>

        <v-main :class="{'nrdb-edit-mode': editMode}">
            <v-navigation-drawer
                v-if="navigationStyle !== 'hidden'"
                v-model="drawer"
                :rail="rail"
                :rail-width="68"
                data-el="nav-drawer"
                :mobile-breakpoint="['none', 'fixed'].includes(navigationStyle) ? '0' : 'md'"
                :temporary="navigationStyle === 'temporary'"
                :permanent="navigationStyle === 'icon'"
                :style="{'position': navPosition}"
            >
                <v-list nav>
                    <v-list-item
                        v-for="page in orderedPages" :key="page.id" active-class="v-list-item--active"
                        :disabled="page.disabled || undefined"
                        :prepend-icon="`mdi-${page.icon?.replace(/^mdi-/, '') || 'home'}`"
                        :title="getPageLabel(page)"
                        :href="page.type === 'ui-link' ? page.path : null"
                        :to="page.type === 'ui-page' ? { name: page.route.name } : null"
                        :data-nav="page.id"
                        @click="closeNavigationDrawer()"
                    >
                        <template #append>
                            <v-icon v-if="page.editMode" class="mdi-pencil mdi item-edit-mode-icon" />
                        </template>
                    </v-list-item>
                </v-list>
            </v-navigation-drawer>
            <slot class="nrdb-layout" />
            <div class="nrdb-layout-overlay">
                <!-- Render any widgets with a 'ui' scope, e.g. ui-notification, ui-event, ui-control -->
                <component
                    :is="widget.component"
                    v-for="widget in uiWidgets"
                    :id="widget.id"
                    :key="widget.id"
                    :props="widget.props"
                    :state="widget.state"
                />
                <!-- Explicitly render a notification widget for our own internal alerting -->
                <ui-notification
                    id="ui-inline-alert" ref="alert"
                    :props="{position: 'top right', showCountdown: alert.showCountdown, displayTime: alert.displayTime, raw: true, allowDismiss: alert.allowDismiss}"
                    @mounted="subscribeAlerts"
                />
            </div>
        </v-main>
    </v-app>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import { editMode, editPage } from '../EditTracking.js'

import Alerts from '../services/alerts'
import UINotification from '../widgets/ui-notification/UINotification.vue'

/**
 * Convert a hex to RGB color
 * @param {String(hex)} hex
 */
function hexToRgb (hex) {
    const bigint = parseInt(hex.replace('#', ''), 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return [r, g, b]
}

/**
 * Given a hex color code to represent a bg, return an appropriately contrasting text color
 * @param {String(hex)} bg
 */
function getContrast (bg) {
    const bgRgb = hexToRgb(bg)

    // http://www.w3.org/TR/AERT#color-contrast
    const brightness = Math.round(((parseInt(bgRgb[0]) * 299) +
        (parseInt(bgRgb[1]) * 587) +
        (parseInt(bgRgb[2]) * 114)) / 1000)

    const textColor = (brightness > 125) ? '#000000' : '#ffffff'
    return textColor
}

export default {
    name: 'BaslineLayout',
    components: {
        'ui-notification': UINotification
    },
    props: {
        pageTitle: {
            type: String,
            default: 'Page Title Here'
        }
    },
    data () {
        return {
            drawer: false,
            rail: false,
            customThemeDefinitions: {},
            alert: {
                displayTime: 0,
                allowDismiss: false,
                showCountdown: false
            }
        }
    },
    computed: {
        ...mapState('ui', ['dashboards', 'pages', 'themes', 'pageData', 'widgets']),
        ...mapState('i18n', ['locale']),
        ...mapGetters('ui', ['siteTemplates', 'pageTemplates']),
        theme: function () {
            const page = this.pages[this.$route.meta.id]
            if (page) {
                return this.themes[page?.theme]
            } else {
                return null
            }
        },
        orderedPages: function () {
            const pages = Object.values(this.pages)
                .filter((p) => {
                    if ('visible' in p && !p.visible) {
                        return false
                    }
                    return true
                })
                .sort((a, b) => a.order - b.order)
            if (editMode.value) {
                return pages.map((p) => {
                    return {
                        ...p,
                        editMode: p.id === editPage.value
                    }
                })
            }
            return pages
        },
        uiWidgets: function () {
            // get widgets scoped to the UI, not a group/page
            const allWidgets = Object.values(this.widgets)

            const widgets = allWidgets.filter(w => {
                const hasUi = Object.hasOwn(w.props, 'ui') && !!w.props.ui && !w.props.group && !w.props.page
                return hasUi
            })
            return widgets
        },
        dashboard: function () {
            const dId = Object.keys(this.dashboards)[0]
            return this.dashboards[dId]
        },
        appBarStyle: function () {
            return this.dashboard.titleBarStyle || 'default'
        },
        appIcon () {
            return this.dashboard.appIcon
        },
        navigationStyle: function () {
            const style = this.dashboard.navigationStyle
            if (![null, 'default', 'fixed', 'icon', 'temporary', 'none'].includes(style)) {
                console.warn(`Invalid navigationStyle value: ${style}`)
                return 'default'
            }
            return style
        },
        navPosition: function () {
            return this.appBarStyle === 'fixed' ? 'fixed' : 'absolute'
        },
        density: function () {
            return this.theme?.sizes.density || 'default'
        },
        currentEditPage: function () {
            if (editMode.value && this.orderedPages?.length) {
                return this.orderedPages.find(p => p.id === editPage.value)
            }
            return null
        },
        editMode: function () {
            return editMode.value
        },
        computedPageTitle: function () {
            // Get current page
            const page = this.pages[this.$route.meta.id]
            if (!page) return this.pageTitle

            // Handle page name translations
            let pageName = page.name
            if (page.name && typeof page.name === 'object') {
                const locale = this.locale || 'en'
                pageName = page.name[locale] || page.name.en || page.name[Object.keys(page.name)[0]] || 'Untitled'
            }

            // Apply header content style
            const headerStyle = this.dashboard.headerContent
            if (headerStyle === 'dashboard') {
                return this.dashboard.name
            } else if (headerStyle === 'dashpage') {
                return `${this.dashboard.name} (${pageName})`
            }
            return pageName
        }
    },
    watch: {
        theme: function () {
            this.updateTheme()
        },
        locale: function () {
            // Force update of the component when locale changes
            this.$forceUpdate()
        },
        navigationStyle: {
            immediate: true,
            handler () {
                if (['fixed', 'icon'].includes(this.navigationStyle)) {
                    this.drawer = true
                }

                if (['icon'].includes(this.navigationStyle)) {
                    this.rail = true
                }
            }
        },
        appIcon: {
            immediate: true,
            handler (url) {
                // extract the file extension from the URL
                const getFileTypeFromURL = (url) => {
                    const segments = url.split('.')
                    const extension = segments[segments.length - 1]
                    return extension.toLowerCase()
                }
                // The existing rel types in the index.html
                const relTypes = ['icon', 'alternate icon', 'apple-touch-icon']
                if (url) {
                    const fileType = getFileTypeFromURL(url)
                    relTypes.forEach((relType) => {
                        // iterate through the rel types and update the link tag
                        const link = document.querySelector(`link[rel="${relType}"]`)
                        if (link) {
                            // set the type and href attributes
                            link.setAttribute('type', `image/${fileType}`)
                            link.setAttribute('href', url)
                        }
                    })
                } else {
                    relTypes.forEach((relType) => {
                        // iterate through the rel types and update the link tag
                        const link = document.querySelector(`link[rel="${relType}"]`)
                        if (relType === 'icon') {
                            link.setAttribute('type', 'image/x-icon')
                            link.setAttribute('href', '/dashboard/favicon.ico')
                        } else if (relType === 'alternate icon') {
                            link.setAttribute('type', 'image/svg+xml')
                            link.setAttribute('href', '/dashboard/favicon.svg')
                        } else if (relType === 'apple-touch-icon') {
                            link.setAttribute('type', 'image/png')
                            link.setAttribute('href', '/dashboard/apple-touch-icon.png')
                        }
                    })
                }
            }
        }
    },
    mounted () {
        this.updateTheme()
    },
    methods: {
        subscribeAlerts (context) {
            Alerts.subscribe((title, description, color, alertOptions) => {
                context.close()
                this.alert = alertOptions
                this.$nextTick(() => {
                    context.onMsgInput({
                        payload: `<h3>${title}</h3><p>${description}</p>`,
                        color
                    })
                })
            })
        },
        go: function (name) {
            this.$router.push({
                name
            })
        },
        updateTheme () {
            const colors = this.$vuetify.theme.themes.nrdb.colors // Modify the Vuetify Theming
            const sizes = this.customThemeDefinitions // Implement some of our own Theming
            // convert NR Theming to Vuetify Theming
            if (this.theme) {
                colors['navigation-background'] = this.theme.colors.surface
                // primary bg
                colors.primary = this.theme.colors.primary
                // primary font - auto calculated
                colors['on-primary'] = getContrast(this.theme.colors.primary)
                // UI Background
                colors.background = this.theme.colors.bgPage
                // Group Styling
                colors['group-background'] = this.theme.colors.groupBg
                colors['group-outline'] = this.theme.colors.groupOutline
                // widget background
                colors.surface = this.theme.colors.groupBg

                // sizes
                sizes['--page-padding'] = this.theme.sizes.pagePadding
                sizes['--group-gap'] = this.theme.sizes.groupGap
                sizes['--group-border-radius'] = this.theme.sizes.groupBorderRadius
                sizes['--widget-gap'] = this.theme.sizes.widgetGap

                this.$vuetify.defaults.global.density = this.density
            }
        },
        getPageLabel (page) {
            // Handle translations
            let pageName = page.name
            if (page.name && typeof page.name === 'object') {
                const locale = this.$store.state.i18n?.locale || 'en'
                pageName = page.name[locale] || page.name.en || page.name[Object.keys(page.name)[0]] || 'Untitled'
            }
            return pageName + (this.dashboard.showPathInSidebar ? ` (${page.path})` : '')
        },
        handleNavigationClick () {
            if (this.navigationStyle === 'fixed') {
                return
            }

            if (this.navigationStyle === 'icon') {
                // Toggle display of list item, rather than entire drawer
                this.rail = !this.rail
            } else {
                this.drawer = !this.drawer
            }
        },
        closeNavigationDrawer () {
            if (this.navigationStyle === 'default') {
                this.drawer = false
            }
        }
    }
}
</script>

<style scoped>
.item-edit-mode-icon {
    color: rgb(var(--v-theme-warning)) !important;
    font-size: 1.25rem;
}
</style>
