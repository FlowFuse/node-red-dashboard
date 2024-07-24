<!-- Error in plugin, @end is supported from Vuetify 3.2.0 -->
<!-- eslint-disable vuetify/no-deprecated-events -->
<template>
    <v-slider
        v-model="value" :disabled="!state.enabled" :label="label" hide-details="auto"
        :class="className" :style="`--nrdb-slider-track-color:${colorTrack};--nrdb-slider-tick-scaleY:${tickScaleY};--nrdb-slider-tick-scaleX:${tickScaleX};`"
        :thumb-label="thumbLabel"
        :append-icon="iconAppend" :prepend-icon="iconPrepend"
        :min="min" :direction="direction"
        :tick-size="4" :track-size="4"
        :color="color" :track-color="colorTrack" :thumb-color="colorThumb"
        :max="max" :step="step || 1" :show-ticks="showTicks"
        @update:model-value="onChange" @end="onBlur"
    />
</template>

<script>
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUISlider',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
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
        },
        direction: function () {
            return this.props.height > this.props.width ? 'vertical' : 'horizontal'
        },
        tickScaleX: function () {
            return this.props.height > this.props.width ? 3 : 0.5
        },
        tickScaleY: function () {
            return this.props.height > this.props.width ? 0.5 : 3
        },
        label: function () {
            return this.getProperty('label')
        },
        thumbLabel: function () {
            return this.getProperty('thumbLabel')
        },
        showTicks: function () {
            return this.getProperty('showTicks')
        },
        min: function () {
            return this.getProperty('min')
        },
        step: function () {
            return this.getProperty('step')
        },
        max: function () {
            return this.getProperty('max')
        },
        iconPrepend: function () {
            const icon = this.getProperty('iconPrepend')
            if (icon) {
                const mdiIcon = this.makeMdiIcon(icon)
                return mdiIcon
            }
            return null
        },
        iconAppend: function () {
            const icon = this.getProperty('iconAppend')
            if (icon) {
                const mdiIcon = this.makeMdiIcon(icon)
                return mdiIcon
            }
            return null
        },
        color: function () {
            return this.getProperty('color')
        },
        colorTrack: function () {
            return this.getProperty('colorTrack')
        },
        colorThumb: function () {
            return this.getProperty('colorThumb')
        }
    },
    watch: {
        storeValue: function (val, oldVal) {
            if (this.value === val) {
                return // no change
            }
            if (typeof val !== 'undefined') {
                this.value = val
            }
        }
    },
    created () {
        this.$dataTracker(this.id, null, this.onLoad, this.onDynamicProperties)
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
        makeMdiIcon (icon) {
            return 'mdi-' + icon.replace(/^mdi-/, '')
        },
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (!updates) {
                return
            }
            if (typeof updates.label !== 'undefined') {
                this.setDynamicProperties({ label: updates.label })
            }
            if (typeof updates.thumbLabel !== 'undefined') {
                this.setDynamicProperties({ thumbLabel: updates.thumbLabel })
            }
            if (typeof updates.showTicks !== 'undefined') {
                this.setDynamicProperties({ showTicks: updates.showTicks })
            }
            if (typeof updates.min !== 'undefined') {
                this.setDynamicProperties({ min: updates.min })
            }
            if (typeof updates.max !== 'undefined') {
                this.setDynamicProperties({ max: updates.max })
            }
            if (typeof updates.step !== 'undefined') {
                this.setDynamicProperties({ step: updates.step })
            }
            if (typeof updates.iconAppend !== 'undefined') {
                this.setDynamicProperties({ iconAppend: updates.iconAppend })
            }
            if (typeof updates.iconPrepend !== 'undefined') {
                this.setDynamicProperties({ iconPrepend: updates.iconPrepend })
            }
            if (typeof updates.color !== 'undefined') {
                this.setDynamicProperties({ color: updates.color })
            }
            if (typeof updates.colorTrack !== 'undefined') {
                this.setDynamicProperties({ colorTrack: updates.colorTrack })
            }
            if (typeof updates.colorThumb !== 'undefined') {
                this.setDynamicProperties({ colorThumb: updates.colorThumb })
            }
        }
    }
}
</script>

<style scoped>
</style>
