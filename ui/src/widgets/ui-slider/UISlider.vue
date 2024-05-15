<!-- Error in plugin, @end is supported from Vuetify 3.2.0 -->
<!-- eslint-disable vuetify/no-deprecated-events -->
<template>
    <v-slider
        v-model="value" :disabled="!state.enabled" :label="label" hide-details="auto"
        :class="className" :thumb-label="props.thumbLabel || false"
        :min="props.min"
        :max="props.max" :step="props.step || 1" @update:model-value="onChange" @end="onBlur"
    />
</template>

<script>
import { useDataTracker } from '../data-tracker.mjs' // eslint-disable-line import/order
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUISlider',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    setup (props) {
        useDataTracker(props.id, null, null, this.onDynamicProperties)
    },
    data () {
        return {
            value: null,
            dynamic: {
                label: null,
                thumbLabel: null,
                min: null,
                max: null
            }
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        storeValue: function () {
            return this.messages[this.id]?.payload
        },
        label: function () {
            return this.dynamic.label || this.props.label
        },
        thumbLabel: function () {
            return this.dynamic.thumbLabel || this.props.thumbLabel
        },
        min: function () {
            return this.dynamic.min !== undefined ? this.dynamic.min : this.props.min
        },
        step: function () {
            return this.dynamic.step !== undefined ? this.dynamic.step : this.props.step
        },
        max: function () {
            return this.dynamic.max !== undefined ? this.dynamic.max : this.props.max
        }
    },
    watch: {
        storeValue: function (val, oldVal) {
            if (this.value === val) {
                return // no change
            }
            this.value = val
        }
    },
    mounted () {
        this.value = this.messages[this.id]?.payload
    },
    methods: {
        onChange () {
            if (!this.props.outs || this.props.outs === 'all') {
                this.send()
            }
        },
        onBlur () {
            if (this.props.outs === 'end') {
                this.send()
            }
        },
        send () {
            this.value = Number(this.value)
            const msg = this.messages[this.id] || {}
            msg.payload = this.value
            this.$store.commit('data/bind', msg)
            this.$socket.emit('widget-change', this.id, this.value)
        },
        onDynamicProperties (msg) {
            if (msg.label) {
                this.dynamic.label = msg.label
            }
            if (msg.thumbLabel) {
                this.dynamic.thumbLabel = msg.thumbLabel
            }
            if (msg.min !== undefined) {
                this.dynamic.min = msg.min
            }
            if (msg.max !== undefined) {
                this.dynamic.max = msg.max
            }
            if (msg.step !== undefined) {
                this.dynamic.step = msg.step
            }
        }
    }
}
</script>

<style scoped>
</style>
