<!-- Error in plugin, @end is supported from Vuetify 3.2.0 -->
<!-- eslint-disable vuetify/no-deprecated-events -->
<template>
    <v-slider
        v-model="value" :disabled="!state.enabled" :label="label" hide-details="auto"
        :class="className" :thumb-label="thumbLabel"
        :min="min"
        :max="max" :step="props.step || 1" @update:model-value="onChange" @end="onBlur"
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
            return this.dynamic.label !== null ? this.dynamic.label : this.props.label
        },
        thumbLabel: function () {
            return this.dynamic.thumbLabel !== null ? this.dynamic.thumbLabel : this.props.thumbLabel
        },
        min: function () {
            return this.dynamic.min !== null ? this.dynamic.min : this.props.min
        },
        step: function () {
            return this.dynamic.step !== null ? this.dynamic.step : this.props.step
        },
        max: function () {
            return this.dynamic.max !== null ? this.dynamic.max : this.props.max
        }
    },
    watch: {
        storeValue: function (val, oldVal) {
            if (this.value === val) {
                return // no change
            }
            if (val !== undefined) {
                this.value = val
            }
        }
    },
    created () {
        useDataTracker(this.id, null, this.onLoad, this.onDynamicProperties)
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
            const updates = msg.ui_update
            if (!updates) {
                return
            }
            if (updates.label) {
                this.dynamic.label = updates.label
            }
            if (updates.thumbLabel) {
                this.dynamic.thumbLabel = updates.thumbLabel
            }
            if (updates.min !== undefined) {
                this.dynamic.min = updates.min
            }
            if (updates.max !== undefined) {
                this.dynamic.max = updates.max
            }
            if (updates.step !== undefined) {
                this.dynamic.step = updates.step
            }
        }
    }
}
</script>

<style scoped>
</style>
