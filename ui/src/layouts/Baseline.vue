<template>
    <v-app class="nrdb-app nrdb-app--baseline" :style="customThemeDefinitions">
        <div v-for="siteTemplate in siteTemplates($route.meta.dashboard)" :key="siteTemplate.id" style="display: none">
            Loaded site template '{{ siteTemplate.id }}'
            <component :is="siteTemplate.component" :id="siteTemplate.id" :props="siteTemplate.props" :state="siteTemplate.state" />
        </div>
        <div v-for="pageTemplate in pageTemplates($route.meta.id)" :key="pageTemplate.id" style="display: none">
            Loaded site template '{{ pageTemplate.id }}'
            <component :is="pageTemplate.component" :id="pageTemplate.id" :props="pageTemplate.props" :state="pageTemplate.state" />
        </div>
        <v-app-bar :elevation="1">
            <template v-if="!['none', 'fixed', 'hidden'].includes(navigationStyle)" #prepend>
                <v-app-bar-nav-icon @click="handleNavigationClick" />
            </template>
            <v-app-bar-title>{{ pageTitle }}</v-app-bar-title>
            <template #append>
                <div id="app-bar-actions" />
            </template>
        </v-app-bar>

        <v-main>
            <v-navigation-drawer
                v-if="navigationStyle !== 'hidden'"
                v-model="drawer"
                :rail="rail"
                :rail-width="68"
                data-el="nav-drawer"
                :mobile-breakpoint="['none', 'fixed'].includes(navigationStyle) ? '0' : 'md'"
                :temporary="navigationStyle === 'temporary'"
                :permanent="navigationStyle === 'icon'"
            >
                <v-list nav>
                    <v-list-item
                        v-for="page in orderedPages" :key="page.id" active-class="v-list-item--active"
                        :disabled="page.disabled || undefined"
                        :prepend-icon="`mdi-${page.icon?.replace(/^mdi-/, '') || 'home'}`"
                        :title="getPageLabel(page)"
                        :to="{name: page.route.name}" link
                        :data-nav="page.id"
                    />
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
                    id="inline-alert" ref="alert"
                    :props="{position: 'top right', showCountdown: alert.showCountdown, displayTime: alert.displayTime, raw: true, allowDismiss: alert.allowDismiss}"
                />
            </div>
        </v-main>
    </v-app>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

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
            return Object.values(this.pages)
                .filter((p) => {
                    if ('visible' in p && !p.visible) {
                        return false
                    }
                    return true
                })
                .sort((a, b) => a.order - b.order)
        },
        uiWidgets: function () {
            // get widgets scoped to the UI, not a group/page
            const widgets = Object.values(this.widgets).filter(w => {
                return Object.hasOwn(w.props, 'ui') && !!w.props.ui && !w.props.group && !w.props.page
            })
            return widgets
        },
        dashboard: function () {
            const dId = Object.keys(this.dashboards)[0]
            return this.dashboards[dId]
        },
        navigationStyle: function () {
            const style = this.dashboard.navigationStyle
            if (![null, 'default', 'fixed', 'icon', 'temporary', 'none'].includes(style)) {
                console.warn(`Invalid navigationStyle value: ${style}`)
                return 'default'
            }
            return style
        }
    },
    watch: {
        theme: function () {
            this.updateTheme()
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
        }
    },
    mounted () {
        this.updateTheme()
        Alerts.subscribe((title, description, color, alertOptions) => {
            this.$refs.alert.close()
            this.alert = alertOptions
            this.$nextTick(() => {
                this.$refs.alert.onMsgInput({
                    payload: `<h3>${title}</h3><p>${description}</p>`,
                    color
                })
            })
        })
    },
    methods: {
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
            }
        },
        getPageLabel (page) {
            return page.name + (this.dashboard.showPathInSidebar ? ` (${page.path})` : '')
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
        }
    }
}
</script>
