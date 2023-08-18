<template>
    <BaselineLayout :page-title="$route.meta.title">
        <div v-if="orderedGroups" class="nrdb-layout--flex">
            <div v-for="g in orderedGroups" :key="g.id" :style="{'width': ((rowHeight * 2 * g.width) + 'px')}">
                <v-card variant="outlined" class="bg-group-background" :style="{'min-height': ((rowHeight * g.height) + 'px')}">
                    <template v-if="g.disp" #title>
                        {{ g.name }}
                    </template>
                    <template #text>
                        <div class="nr-db-layout-group--grid" :style="`grid-template-columns: repeat(${ g.width }, 1fr); grid-template-rows: repeat(${g.height}, minmax(${rowHeight}px, auto)); `">
                            <div v-for="w in widgetsByGroup(g.id)" :key="w.id" style="display: grid" :style="`grid-template-rows: repeat(${w.props.height}, ${rowHeight}px); grid-column-end: span ${ w.props.width || g.width }`">
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
        ...mapGetters('ui', ['groupsByPage', 'widgetsByGroup']),
        orderedGroups: function () {
            const groups = this.groupsByPage(this.$route.meta.id)
            groups.sort((a, b) => {
                // if order = 0, prioritise groups where order _is_ set
                const aOrder = a.order || Number.MAX_SAFE_INTEGER
                const bOrder = b.order || Number.MAX_SAFE_INTEGER
                return aOrder - bOrder
            })
            return groups
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
