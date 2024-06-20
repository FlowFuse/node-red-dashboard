<!-- Error in plugin, @end is supported from Vuetify 3.2.0 -->
<!-- eslint-disable vuetify/no-deprecated-events -->
<template>
    <v-slider
        v-model="value" :disabled="!state.enabled" :label="label" hide-details="auto"
        :class="className" :thumb-label="thumbLabel"
        :append-icon="iconAppend" :prepend-icon="iconPrepend"
        @click:prepend="clickPrepend" @click:append="clickAppend"
        :min="min"
        :color="color" :track-color="colorTrack" :thumb-color="colorThumb"
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
                max: null,
                iconAppend: null,
                iconPrepend: null,
                iconClick: null,
                color: null,
                colorTrack: null,
                colorThumb: null
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
        },
<<<<<<< HEAD
        iconPrepend: function () {
            return this.dynamic.iconPrepend !== null ? this.dynamic.iconPrepend : this.props.iconPrepend
        },
        iconAppend: function () {
            return this.dynamic.iconAppend !== null ? this.dynamic.iconAppend : this.props.iconAppend
        },
        iconClick: function () {
            return this.dynamic.iconClick !== null ? this.dynamic.iconClick : this.props.iconClick
        }        
=======
        color: function () {
            return this.dynamic.color !== null ? this.dynamic.color : this.props.color
        },
        colorTrack: function () {
            return this.dynamic.colorTrack !== null ? this.dynamic.colorTrack : this.props.colorTrack
        },
        colorThumb: function () {
            return this.dynamic.colorThumb !== null ? this.dynamic.colorThumb : this.props.colorThumb
        }
>>>>>>> 6247eca257e66279a389c2ec4e1ffcaae66a2dec
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
            if (typeof updates.label !== 'undefined') {
                this.dynamic.label = updates.label
            }
            if (typeof updates.thumbLabel !== 'undefined') {
                this.dynamic.thumbLabel = updates.thumbLabel
            }
            if (typeof updates.min !== 'undefined') {
                this.dynamic.min = updates.min
            }
            if (typeof updates.max !== 'undefined') {
                this.dynamic.max = updates.max
            }
            if (typeof updates.step !== 'undefined') {
                this.dynamic.step = updates.step
            }
            if (typeof updates.iconAppend !== 'undefined') {
                this.dynamic.iconAppend = updates.iconAppend
            } 
            if (typeof updates.iconPrepend !== 'undefined') {
                this.dynamic.iconPrepend = updates.iconPrepend
            }                         
            if (typeof updates.iconClick !== 'undefined') {
                this.dynamic.iconClick = updates.iconClick
            }            
        },
        clickAppend () {
            if (!this.iconClick) return
            // Add step to slider
            this.value = (this.value || 0) + (this.props.step || 1)
            // Prevent to overflow max value
            this.value = Math.min(this.value, this.max)
            this.send()
        },
        clickPrepend () {
            if (!this.iconClick) return
            console.log(this)
            // Add step to slider
            this.value = (this.value || 0) - (this.props.step || 1)
            // Prevent to overflow max value
            this.value = Math.max(this.value, this.min)
            this.send()        
        }          
    }
}
</script>

<style scoped>
</style>
