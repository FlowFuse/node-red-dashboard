<template>
    <BaselineLayout :page-title="$route.name">
        Grid View:
        <div v-if="widgets && widgets[$route.meta.id]">
            <div v-for="w in widgets[$route.meta.id]" :key="w.id">
                <component :is="w.component" />
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