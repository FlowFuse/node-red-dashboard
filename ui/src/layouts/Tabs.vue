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

            <v-tabs v-model="tab" show-arrows>
                <v-tab v-for="t in tabs" :key="t.id" :value="t.id" @click="selectedTab = t.id">{{ t.name }}</v-tab>
            </v-tabs>

            <v-tabs-window v-model="tab">
                <v-tabs-window-item v-for="t in tabs" :key="t.id" :value="t.id">
                    <div :class="{ 'nrdb-layout--tabs-grid': t.groups.length > 1 }">
                        <div
                            v-for="g in t.groups"
                            :id="'nrdb-ui-group-' + g.id"
                            :key="g.id"
                            class="nrdb-ui-group" :class="getGroupClass(g)"
                            :disabled="g.disabled === true ? 'disabled' : null"
                            :style="`grid-column-end: span min(${ g.width }, var(--layout-columns)`"
                        >
                            <v-card variant="outlined" class="bg-group-background">
                                <template v-if="t.groups.length > 1 && g.showTitle" #title>
                                    {{ g.name }}
                                </template>
                                <template #text>
                                    <widget-group :group="g" :widgets="widgetsByGroup(g.id)" />
                                </template>
                            </v-card>
                        </div>
                    </div>
                </v-tabs-window-item>
            </v-tabs-window>
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
        </div>
    </BaselineLayout>
</template>

<script>
import Responsiveness from '../mixins/responsiveness.js'

// eslint-disable-next-line import/order
import BaselineLayout from './Baseline.vue'
import DialogGroup from './DialogGroup.vue'
import WidgetGroup from './Group.vue'

// eslint-disable-next-line import/order, sort-imports
import { mapState, mapGetters } from 'vuex'

export default {
    name: 'LayoutTabs',
    components: {
        BaselineLayout,
        DialogGroup,
        WidgetGroup
    },
    mixins: [Responsiveness],
    beforeRouteEnter (to, from, next) {
        next(vm => {
            // Select the first tabsheet every time the user arrives on this page
            if (vm.tabs.length > 0) {
                // Check if origin and destination pages are unique
                if (to?.name !== from?.name) {
                    vm.tab = vm.tabs[0].id
                    vm.selectedTab = null
                }
            }
        })
    },
    data () {
        return {
            tab: null,
            selectedTab: null
        }
    },
    computed: {
        ...mapState('ui', ['groups', 'widgets', 'pages']),
        ...mapState('data', ['properties']),
        ...mapGetters('ui', ['groupsByPage', 'tabsByPage', 'widgetsByGroup', 'widgetsByPage']),
        tabs () {
            return this.tabsByPage(this.$route.meta.id)
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
    watch: {
        tabs (tabs) {
            if (tabs.length === 0) {
                return
            }
            if (tabs.some((t) => t.id === this.selectedTab)) {
                this.tab = this.selectedTab
            } else if (!tabs.some((t) => t.id === this.tab)) {
                this.tab = tabs[0].id
            }
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
    --layout-columns: v-bind(columns);
    padding: var(--page-padding);
}

.nrdb-layout--tabs-grid {
    display: grid;
    grid-template-columns: repeat(var(--layout-columns), 1fr);
    gap: var(--group-gap);
}

.v-card {
    width: 100%;
}
</style>
