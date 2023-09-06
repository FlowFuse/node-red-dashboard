<template>
    <BaselineLayout :page-title="$route.meta.title">
        <div v-if="orderedGroups" class="nrdb-layout--notebook">
            <div
                v-for="g in orderedGroups"
                :id="'nrdb-ui-group-' + g.id"
                :key="g.id"
                class="nrdb-ui-group"
                :class="getGroupClass(g)"
            >
                <v-card variant="outlined" class="bg-group-background" :style="{'min-height': ((rowHeight * g.height) + 'px')}">
                    <template v-if="g.disp" #title>
                        {{ g.name }}
                    </template>
                    <template #text>
                        <div class="nr-db-layout-group--grid" :style="`grid-template-columns: repeat(${ g.width }, 1fr); grid-template-rows: repeat(${g.height}, minmax(${rowHeight}px, auto)); `">
                            <div
                                v-for="w in widgetsByGroup(g.id)"
                                :id="'nrdb-ui-widget-' + w.id"
                                :key="w.id"
                                class="nrdb-ui-widget"
                                :class="getWidgetClass(w)"
                                style="display: grid"
                                :style="`grid-template-rows: repeat(${w.props.height}, ${rowHeight}px); grid-column-end: span ${ w.props.width || g.width }`"
                            >
                                <component :is="w.component" :id="w.id" :props="w.props" :state="w.state" :style="`grid-row-end: span ${w.props.height}`" />
                            </div>
                        </div>
                    </template>
                </v-card>
            </div>
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
        ...mapState('ui', ['groups', 'widgets']),
        ...mapState('data', ['properties']),
        ...mapGetters('ui', ['groupsByPage', 'widgetsByGroup']),
        orderedGroups: function () {
            const groups = this.groupsByPage(this.$route.meta.id)
            return groups
        }
    },
    methods: {
        getWidgetClass (widget) {
            const classes = []
            // ensure each widget has a class for its type
            classes.push(`nrdb-${widget.type}`)
            // add any class set in the widget's properties
            const widgetProperties = this.properties[widget.id]
            if (widget.props.className) {
                classes.push(widget.props.className)
            }
            // add dynamically set class
            if (widgetProperties && widgetProperties.class) {
                classes.push(widgetProperties.class)
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
    padding: var(--layout-gap);
}
.nrdb-layout--notebook > div {
    width: 100%;
    margin-bottom: var(--layout-gap);
}

.v-card {
    width: 100%;
}
</style>
