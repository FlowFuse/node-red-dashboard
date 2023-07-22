<template>
    <BaselineLayout :page-title="$route.name">
        <div class="nrdb-layout--grid" v-if="gridGroups">
            <div v-for="g in gridGroups" :key="g.id" :style="`grid-column-end: span ${ g.width }`">
                <v-card variant="outlined" class="bg-group-background">
                    <template #title v-if="g.disp">
                        {{ g.name }}
                    </template>
                    <template #text>
                        <div class="nr-db-layout-group--grid" :style="`grid-template-columns: repeat(${ g.width }, 1fr); grid-template-rows: repeat(${g.height}, minmax(${rowHeight}, auto)); `">
                            <div v-for="w in widgetsByGroup(g.id)" :key="w.id" style="display: grid" :style="`grid-template-rows: repeat(${w.props.height}, ${rowHeight}); grid-column-end: span ${ w.props.width || g.width }`">
                                <component :is="w.component" :id="w.id" :props="w.props" :state="w.state" :style="`grid-row-end: span ${w.props.height}`"/>
                            </div>
                        </div>
                    </template>
                </v-card>
            </div>
        </div>
    </BaselineLayout>
</template>

<script>
    import BaselineLayout from './Baseline.vue'
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'LayoutGrid',
        computed: {
            ...mapState('ui', ['groups', 'widgets']),
            ...mapGetters('ui', ['groupsByPage', 'widgetsByGroup']),
            gridGroups: function () {
                const groups = this.groupsByPage(this.$route.meta.id)
                const ordered = groups.sort((a, b) => {
                    // if order = 0, prioritise groups where order _is_ set
                    const aOrder = a.order || Number.MAX_SAFE_INTEGER
                    const bOrder = b.order || Number.MAX_SAFE_INTEGER
                    return aOrder - bOrder
                })
                return ordered
            }
        },
        components: {
            BaselineLayout
        },
        data () {
            return {
                columns: 12,
                rowHeight: '48px'
            }
        }
    }
</script>

<style scoped>

@import "./grid-groups.css";

.nrdb-layout--grid {
    --layout-card-width: 320px;
    --layout-gap: 12px;
    --widget-row-height: 48px;
}
.nrdb-layout--grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    flex-wrap: wrap;
    padding: var(--layout-gap);
    gap: var(--layout-gap);
}

.nrdb-layout--grid > div {
    width: 100%;
    /* max-width: 100%; */
}

.v-card {
    width: 100%;
}

@media only screen and (max-width: 1024px) {
    .nrdb-layout--grid {
        grid-template-columns: repeat(9, 1fr);
    }
}

@media only screen and (max-width: 768px) {
    .nrdb-layout--grid {
        grid-template-columns: repeat(6, 1fr);
    }
}

</style>