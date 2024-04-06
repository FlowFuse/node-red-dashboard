<template>
    <ui-gauge-tile v-if="props.gtype === 'gauge-tile'" :id="id" :props="props" :value="value" />
    <ui-gauge-dial v-else :id="id" :props="props" :value="value" />
</template>

<script>
import { useDataTracker } from '../data-tracker.mjs' // eslint-disable-line import/order
import { mapState } from 'vuex' // eslint-disable-line import/order

import UIGaugeDial from './types/UIGaugeDial.vue'
import UIGaugeTile from './types/UIGaugeTile.vue'

export default {
    name: 'DBUIGauge',
    components: {
        'ui-gauge-dial': UIGaugeDial,
        'ui-gauge-tile': UIGaugeTile
    },
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    setup (props) {
        useDataTracker(props.id)
    },
    computed: {
        ...mapState('data', ['messages']),
        value: function () {
            return this.messages[this.id]?.payload
        },
        icon () {
            return this.props.icon?.replace(/^mdi-/, '')
        }
    }
}
</script>

<style>
.nrdb-ui-gauge {
    position: relative;
}
</style>
