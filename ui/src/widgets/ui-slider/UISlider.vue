<template>
    <v-slider
        v-model="values[id]" :label="props.label" hide-details="auto"
        class="nrdb-ui-widget"
        :min="props.min" :max="props.max" :step="props.step || 1"
    />
</template>

<script>
import { useDataTracker } from '../data-tracker.js' // eslint-disable-line import/order
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUISlider',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
    setup (props) {
        useDataTracker(props.id)
    },
    computed: {
        ...mapState('data', ['values']),
        value: function () {
            return this.values[this.id]
        }
    },
    watch: {
        value: function (val, oldVal) {
            console.log('value changed', val, oldVal)
            this.onChange()
        }
    },
    methods: {
        onChange () {
            console.log('slider moved')
            this.$socket.emit(`widget-change:${this.id}`, this.values[this.id])
        }
    }
}
</script>

<style scoped>
</style>
