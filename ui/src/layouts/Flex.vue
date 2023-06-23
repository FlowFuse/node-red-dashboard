<template>
    <BaselineLayout :page-title="$route.name">
        <div class="nrdb-layout--flex" v-if="widgets && widgets[$route.meta.id]">
            <div v-for="w in widgets[$route.meta.id]" :key="w.id">
                <v-card variant="outlined" class="">
                    <template #text>
                        <component  :is="w.component" :id="w.id" :props="w.props" :state="w.state"/>
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
        name: 'LayoutFlex',
        computed: {
            ...mapState('ui', ['widgets']),
        },
        components: {
            BaselineLayout
        }
    }
</script>

<style scoped>

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