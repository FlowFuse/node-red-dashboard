<template>
    <BaselineLayout :page-title="$route.meta.title">
        <div v-if="orderedGroups" :id="'nrdb-page-' + $route.meta.id" class="nrdb-layout--notebook nrdb-ui-page" :class="page?.className">
            <div
                v-for="g in orderedGroups"
                :id="'nrdb-ui-group-' + g.id"
                :key="g.id"
                class="nrdb-ui-group"
                :disabled="g.disabled === true ? 'disabled' : null"
                :class="getGroupClass(g)"
            >
                <v-card variant="outlined" class="bg-group-background" :style="{'min-height': ((rowHeight * g.height) + 'px')}">
                    <template v-if="g.showTitle" #title>
                        {{ getGroupName(g) }}
                    </template>
                    <template #text>
                        <widget-group :group="g" :widgets="widgetsByGroup(g.id)" />
                    </template>
                </v-card>
            </div>
        </div>
        <div>
            <!-- Render any widgets with a 'page' scope -->
            <component
                :is="widget.component"
                v-for="widget in pageWidgets"
                :id="widget.id"
                :key="widget.id"
                :props="widget.props"
                :state="widget.state"
            />
        </div>
        <div v-if="dialogGroups">
            <div
                v-for="g in dialogGroups"
                :id="'nrdb-ui-group-' + g.id"
                :key="g.id"
                class="nrdb-ui-group"
                :disabled="g.disabled === true ? 'disabled' : null"
                :class="getGroupClass(g)"
                :style="`grid-column-end: span min(${ g.width }, var(--layout-columns)`"
            >
                <DialogGroup :group="g">
                    <widget-group :group="g" :widgets="widgetsByGroup(g.id)" />
                </DialogGroup>
            </div>
        </div>
    </BaselineLayout>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import Responsiveness from '../mixins/responsiveness.js'

import BaselineLayout from './Baseline.vue'
import DialogGroup from './DialogGroup.vue'
import WidgetGroup from './Group.vue'

export default {
    name: 'LayoutNotebook',
    components: {
        BaselineLayout,
        DialogGroup,
        WidgetGroup
    },
    mixins: [Responsiveness],
    data () {
        const rowHeight = getComputedStyle(document.body).getPropertyValue('--widget-row-height')
        return {
            rowHeight: parseFloat(rowHeight)
        }
    },
    computed: {
        ...mapState('ui', ['groups', 'widgets', 'pages']),
        ...mapState('data', ['properties']),
        ...mapGetters('ui', ['groupsByPage', 'widgetsByGroup', 'widgetsByPage']),
        ...mapGetters('i18n', ['currentLocale']),
        orderedGroups: function () {
            // get groups on this page
            const groups = this.groupsByPage(this.$route.meta.id)
                // only show the groups that haven't had their "visible" property set to false
                .filter((g) => {
                    if ('visible' in g) {
                        return g.visible && g.groupType !== 'dialog'
                    }
                    return true
                })
                .sort((a, b) => {
                    return a.order - b.order
                })
            return groups
        },
        dialogGroups () {
            const groups = this.groupsByPage(this.$route.meta.id).filter((g) => g.groupType === 'dialog')
            return groups
        },
        pageWidgets: function () {
            return this.widgetsByPage(this.$route.meta.id)
        },
        page: function () {
            return this.pages[this.$route.meta.id]
        }
    },
    methods: {
        getGroupName (group) {
            if (!group.name) return ''
            if (typeof group.name === 'string') {
                return group.name
            }
            if (typeof group.name === 'object') {
                // Try current locale first
                if (group.name[this.currentLocale]) {
                    return group.name[this.currentLocale]
                }
                // Fallback to English
                if (group.name.en) {
                    return group.name.en
                }
                // Fallback to original
                if (group.name.original) {
                    return group.name.original
                }
                // Fallback to first available translation
                const keys = Object.keys(group.name)
                if (keys.length > 0) {
                    return group.name[keys[0]]
                }
            }
            return String(group.name)
        },
        getWidgetClass (widget) {
            const classes = []
            // ensure each widget has a class for its type
            classes.push(`nrdb-${widget.type}`)
            // add any class set in the widget's properties
            if (widget.props.className) {
                classes.push(widget.props.className)
            }
            if (widget.state.class) {
                classes.push(widget.state.class)
            }
            return classes.join(' ')
        },
        getGroupClass (group) {
            const classes = []
            // add any class set in the group's properties
            if (group.className) {
                classes.push(group.className)
            }
            // add dynamically set class(es)
            const properties = this.properties[group.id]
            if (properties && properties.class) {
                classes.push(properties.class)
            }
            return classes.join(' ')
        }
    }
}
</script>

<style scoped>

@import "./grid-groups.css";
.nrdb-layout--notebook {
    --layout-card-width: 1024px;
    --layout-gap: 12px;
}
.nrdb-layout--notebook {
    margin: auto;
    width: 100%;
    max-width: var(--layout-card-width);
    min-height: 100%;
    flex-wrap: wrap;
    padding: var(--page-padding);
    --layout-columns: v-bind(columns);
}
.nrdb-layout--notebook > div {
    width: 100%;
    margin-bottom: var(--group-gap);
}

.v-card {
    width: 100%;
}
</style>
