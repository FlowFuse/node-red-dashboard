<template>
    <v-slider
        v-model="value" :label="props.label" hide-details="auto"
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
    data () {
        return {
            value: null
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        storeValue: function () {
            return this.messages[this.id]?.payload
        }
    },
    watch: {
        storeValue: function (val, oldVal) {
            if (this.value === val) {
                return // no change
            }
            this.value = val
        },
        value: function (val, oldVal) {
            if (this.storeValue === val) {
                return // no change
            }
            this.onChange()
        }
    },
    methods: {
        onChange () {
            console.log('slider moved')
            const msg = this.messages[this.id] || {}
            msg.payload = this.value
            this.$store.commit('data/bind', msg)
            this.$socket.emit('widget-change', this.id, this.value)
        }
    }
}
</script>

<style scoped>
</style>
