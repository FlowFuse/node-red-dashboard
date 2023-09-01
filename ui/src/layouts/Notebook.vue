<template>
    <BaselineLayout :page-title="$route.meta.title">
        <div v-if="orderedGroups" class="nrdb-layout--notebook">
            <div v-for="g in orderedGroups" :key="g.id">
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
            return groups
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
