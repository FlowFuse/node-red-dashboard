<template>
    <BaselineLayout :page-title="$route.name">
        Flex View:
        {{ widgets }}
        <div v-for="w in widgets" :key="w.id">
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
            ...mapState('ui', ['widgets'])
        },
        components: {
            BaselineLayout
        }
    }
</script>