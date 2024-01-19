<template>
    <BaselineLayout :page-title="$route.meta.title">
        <div v-if="orderedGroups" :id="'nrdb-page-' + $route.meta.id" class="nrdb-layout--flex nrdb-ui-page" :class="page?.className">
            <div
                v-for="g in orderedGroups"
                :id="'nrdb-ui-group-' + g.id"
                :key="g.id"
                class="nrdb-ui-group"
                :disabled="g.disabled === true ? 'disabled' : null"
                :class="getGroupClass(g)"
                :style="{'width': ((rowHeight * 2 * g.width) + 'px')}"
            >
                <v-card variant="outlined" class="bg-group-background" :style="{'min-height': ((rowHeight * g.height) + 'px')}">
                    <template v-if="g.showTitle" #title>
                        {{ g.name }}
                    </template>
                    <template #text>
                        <div class="nrdb-group-widgets nr-db-layout-group--grid" :style="`grid-template-columns: repeat(${ g.width }, 1fr); grid-template-rows: repeat(${g.height}, minmax(${rowHeight}px, auto)); `">
                            <div
                                v-for="w in widgetsByGroup(g.id)"
                                :id="'nrdb-ui-widget-' + w.id"
                                :key="w.id"
                                class="nrdb-ui-widget"
                                :class="getWidgetClass(w)"
                                style="display: grid"
                                :style="`grid-template-rows: repeat(${w.props.height}, minmax(${rowHeight}px, auto)); grid-column-end: span ${ w.props.width || g.width }`"
                            >
                                <component :is="w.component" :id="w.id" :props="w.props" :state="w.state" :style="`grid-row-end: span ${w.props.height}`" />
                            </div>
                        </div>
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
    </BaselineLayout>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import BaselineLayout from './Baseline.vue'

export default {
    name: 'LayoutFlex',
    components: {
        BaselineLayout
    },
    data () {
        return {
            rowHeight: 45
        }
    },
    computed: {
        ...mapState('ui', ['groups', 'widgets', 'pages']),
        ...mapState('data', ['properties']),
        ...mapGetters('ui', ['groupsByPage', 'widgetsByGroup', 'widgetsByPage']),
        orderedGroups: function () {
            // get groups on this page
            const groups = this.groupsByPage(this.$route.meta.id)
                // only show hte groups that haven't had their "visible" property set to false
                .filter((g) => {
                    if ('visible' in g) {
                        return g.visible
                    }
                    return true
                })
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
        getWidgetClass (widget) {
            const classes = []
            // ensure each widget has a class for its type
            classes.push(`nrdb-${widget.type}`)
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
.nrdb-layout--flex {
    --layout-card-width: 320px;
    --layout-gap: 12px;
}
.nrdb-layout--flex {
    display: flex;
    flex-wrap: wrap;
    padding: var(--layout-gap);
    gap: var(--layout-gap);
}

.nrdb-layout--flex > div {
    width: var(--layout-card-width);
    max-width: 100%;
}

.v-card {
    width: 100%;
}
</style>
