<template>
    <BaselineLayout :page-title="$route.meta.title">
        <div :id="'nrdb-page-' + $route.meta.id" class="nrdb-layout--tabs nrdb-ui-page" :class="page?.className">
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

            <v-tabs v-if="orderedGroups" v-model="tab" show-arrows>
                <v-tab v-for="t in orderedGroups" :key="t.id" :value="t.id">{{ t.name }}</v-tab>
            </v-tabs>

            <v-tabs-window v-if="orderedGroups" v-model="tab">
                <v-tabs-window-item v-for="t in orderedGroups" :key="t.id" :value="t.id">
                    <div
                        class="nrdb-ui-group" :class="getGroupClass(t)"
                        :disabled="t.disabled === true ? 'disabled' : null"
                        :style="`grid-column-end: span min(${ t.width }, var(--layout-columns)`"
                    >
                        <v-card variant="outlined" class="bg-group-background">
                            <template #text>
                                <widget-group :group="t" :widgets="widgetsByGroup(t.id)" />
                            </template>
                        </v-card>
                    </div>
                </v-tabs-window-item>
            </v-tabs-window>
        </div>
    </BaselineLayout>
</template>

<script>
// eslint-disable-next-line import/order
import BaselineLayout from './Baseline.vue'
import WidgetGroup from './Group.vue'

// eslint-disable-next-line import/order, sort-imports
import { mapState, mapGetters } from 'vuex'

export default {
    name: 'LayoutTabs',
    components: {
        BaselineLayout,
        WidgetGroup
    },
    data () {
        return {
            tab: 0
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
                .sort((a, b) => {
                    return a.order - b.order
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

.nrdb-layout--tabs {
    --layout-gap: 12px;
    --widget-row-height: 48px;
    --layout-columns: 12;
    padding: var(--page-padding);
}

.v-card {
    width: 100%;
}

@media only screen and (max-width: 1024px) {
    .nrdb-layout--tabs {
        --layout-columns: 9;
    }
}

@media only screen and (max-width: 768px) {
    .nrdb-layout--tabs {
        --layout-columns: 6;
    }
}

@media only screen and (max-width: 576px) {
    .nrdb-layout--tabs {
        --layout-columns: 3;
    }
}

</style>
