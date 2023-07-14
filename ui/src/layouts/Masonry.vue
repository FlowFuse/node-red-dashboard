<template>
    <BaselineLayout :page-title="$route.name">
        <div class="nrdb-layout--masonry" v-if="groups && groups[$route.meta.id]">
            <div v-for="g in masonryGroups" :key="g.id" :style="`grid-column-end: span ${ g.width }`">
                <v-card variant="outlined" class="">
                    <template #title v-if="g.disp">
                        {{ g.name }}
                    </template>
                    <template #text>
                        <div class="nrdb-layout--masonry" :style="`grid-template-columns: repeat(${ g.width }, 1fr)`">
                            <div v-for="w in widgets[g.id]" :key="w.id" :style="`grid-column-end: span ${ w.props.width || g.width }`">
                                <component :is="w.component" :id="w.id" :props="w.props" :state="w.state"/>
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
    import { mapState } from 'vuex';

    export default {
        name: 'LayoutMasonry',
        computed: {
            ...mapState('ui', ['groups', 'widgets']),
            masonryGroups: function () {
                console.log(this.groups, this.$route.meta.id)
                const groups = this.groups[this.$route.meta.id]
                console.log(groups)
                const ordered = Object.values(groups).sort((g) => {
                    return g.order
                })
                return ordered
            }
        },
        components: {
            BaselineLayout
        },
        data () {
            return {
                columns: 12
            }
        }
    }
</script>

<style scoped>

.nrdb-layout--masonry {
    --layout-card-width: 320px;
    --layout-gap: 12px;
}
.nrdb-layout--masonry {
    display: grid;
    grid-auto-flow: dense;
    grid-template-columns: repeat(12, 1fr);
    flex-wrap: wrap;
    padding: var(--layout-gap);
    gap: var(--layout-gap);
}

.nrdb-layout--masonry > div {
    width: 100%;
    /* max-width: 100%; */
}

.v-card {
    width: 100%;
}

@media only screen and (max-width: 768px) {
    .nrdb-layout--masonry {
        grid-template-columns: repeat(6, 1fr);
    }
}
</style>