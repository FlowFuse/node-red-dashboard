<template>
    <BaselineLayout :page-title="$route.name">
        Flex View:
        {{ widgets[$route.meta.id] }}
        <div v-for="w in widgets[$route.meta.id]" :key="w.id">
            {{ w.id }} {{  w.type }}
            <!-- <component :is="w.type" /> -->
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