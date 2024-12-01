<!-- Error in plugin, @end is supported from Vuetify 3.2.0 -->
<!-- eslint-disable vuetify/no-deprecated-events -->
<template>
    <v-slider
        v-model="sliderValue" :disabled="!state.enabled" hide-details="auto"
        :class="className" :style="`--nrdb-slider-track-color:${colorTrack};--nrdb-slider-tick-scaleY:${tickScaleY};--nrdb-slider-tick-scaleX:${tickScaleX};`"
        :thumb-label="thumbLabel"
        :append-icon="iconAppend" :prepend-icon="iconPrepend"
        :min="min" :max="max" :step="step || 1"
        :direction="direction" :show-ticks="showTicks"
        :tick-size="4" :track-size="4"
        :color="color" :track-color="colorTrack" :thumb-color="colorThumb"
        @update:model-value="onSliderChange" @end="onSliderBlur"
    >
        <template #label>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-html="label" />
        </template>
        <template v-if="showTextField" #append>
            <v-text-field
                id="nrdb-ui-widget-dashboard-ui-slider-text-field"
                v-model.number="textFieldValue"
                density="compact"
                style="width: 80px"
                type="number"
                variant="outlined"
                hide-details
                :min="min" :max="max"
                @blur="onTextFieldBlur"
                @keyup.enter="onEnter"
            />
        </template>
    </v-slider>
</template>

<script>
import DOMPurify from 'dompurify'
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
            sliderValue: null,
            textFieldValue: null
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
            // Sanitize the html to avoid XSS attacks
            return DOMPurify.sanitize(this.getProperty('label'))
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
        },
        showTextField: function () {
            return this.getProperty('showTextField')
        }
    },
    watch: {
        storeValue: function (val, oldVal) {
            if (this.sliderValue === val && this.textFieldValue === val) {
                return // no change
            }
            if (typeof val !== 'undefined') {
                this.sliderValue = val
                this.textFieldValue = val
            }
        },
        sliderValue: function (val) {
            this.textFieldValue = val
        }
    },
    created () {
        this.$dataTracker(this.id, null, this.onLoad, this.onDynamicProperties)
    },
    mounted () {
        const val = this.messages[this.id]?.payload
        if (typeof val !== 'undefined') {
            this.sliderValue = val
            this.textFieldValue = val
        }
    },
    methods: {
        onSliderChange (val) {
            this.sliderValue = val
            if (!this.props.outs || this.props.outs === 'all') {
                this.send()
            }
        },
        onSliderBlur () {
            if (this.props.outs === 'end') {
                this.send()
            }
        },
        onTextFieldBlur () {
            this.validateInput()
            if (this.sliderValue !== this.textFieldValue) {
                this.sliderValue = this.textFieldValue
                this.send()
            }
        },
        onEnter: function () {
            this.validateInput()
            if (this.sliderValue !== this.textFieldValue) {
                this.sliderValue = this.textFieldValue
            }
            // don't compare previous value, if user has pressed <enter> they want it submitted
            this.send()
        },
        send () {
            const val = Number(this.sliderValue)
            const msg = this.messages[this.id] || {}
            msg.payload = val
            this.$store.commit('data/bind', msg)
            this.$socket.emit('widget-change', this.id, val)
        },
        makeMdiIcon (icon) {
            return 'mdi-' + icon.replace(/^mdi-/, '')
        },
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (!updates) {
                return
            }
            this.updateDynamicProperty('label', updates.label)
            this.updateDynamicProperty('thumbLabel', updates.thumbLabel)
            this.updateDynamicProperty('showTicks', updates.showTicks)
            this.updateDynamicProperty('min', updates.min)
            this.updateDynamicProperty('max', updates.max)
            this.updateDynamicProperty('step', updates.step)
            this.updateDynamicProperty('iconAppend', updates.iconAppend)
            this.updateDynamicProperty('iconPrepend', updates.iconPrepend)
            this.updateDynamicProperty('color', updates.color)
            this.updateDynamicProperty('colorTrack', updates.colorTrack)
            this.updateDynamicProperty('colorThumb', updates.colorThumb)
            this.updateDynamicProperty('showTextField', updates.showTextField)
        },
        // Validate the text field input
        validateInput () {
            this.textFieldValue = this.roundToStep(this.textFieldValue)
            if (this.textFieldValue < this.min) {
                this.textFieldValue = this.min
            } else if (this.textFieldValue > this.max) { this.textFieldValue = this.max }
        },
        roundToStep (value) {
            const step = this.step || 1
            return Math.round(value / step) * step
        }
    }
}
</script>

<style scoped></style>
