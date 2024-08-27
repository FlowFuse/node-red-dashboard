<template>
    <component :is="gaugeType" :id="id" :props="dynamicProps" :value="value" />
</template>

<script>
import { mapState } from 'vuex' // eslint-disable-line import/order

import UIGaugeBattery from './types/UIGaugeBattery.vue'
import UIGaugeDial from './types/UIGaugeDial.vue'
import UIGaugeTank from './types/UIGaugeTank.vue'
import UIGaugeTile from './types/UIGaugeTile.vue'

export default {
    name: 'DBUIGauge',
    components: {
        'ui-gauge-battery': UIGaugeBattery,
        'ui-gauge-tank': UIGaugeTank,
        'ui-gauge-dial': UIGaugeDial,
        'ui-gauge-tile': UIGaugeTile
    },
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    computed: {
        ...mapState('data', ['messages']),
        gaugeType () {
            return `ui-${this.gtype}` || 'ui-gauge-dial'
        },
        value: function () {
            return this.messages[this.id]?.payload
        },
        title () {
            return this.getProperty('title')
        },
        gtype () {
            return this.getProperty('gtype')
        },
        gstyle () {
            return this.getProperty('gstyle')
        },
        prefix () {
            return this.getProperty('prefix')
        },
        suffix () {
            return this.getProperty('suffix')
        },
        units () {
            return this.getProperty('units')
        },
        icon () {
            return this.getProperty('icon')
        },
        segments () {
            return this.getProperty('segments')
        },
        min () {
            return this.getProperty('min')
        },
        max () {
            return this.getProperty('max')
        },
        dynamicProps () {
            const props = {
                ...this.props,
                title: this.title,
                gtype: this.gtype,
                gstyle: this.gstyle,
                prefix: this.prefix,
                suffix: this.suffix,
                units: this.units,
                icon: this.icon,
                segments: this.segments,
                min: this.min,
                max: this.max
            }
            console.log('props', this.props, props)
            return props
        }
    },
    created () {
        this.$dataTracker(this.id, null, null, this.onDynamicProperties)
    },
    methods: {
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (!updates) {
                return
            }
            this.updateDynamicProperty('title', updates.title)
            this.updateDynamicProperty('gtype', updates.gtype)
            this.updateDynamicProperty('gstyle', updates.gstyle)
            this.updateDynamicProperty('prefix', updates.prefix)
            this.updateDynamicProperty('suffix', updates.suffix)
            this.updateDynamicProperty('units', updates.units)
            this.updateDynamicProperty('icon', updates.icon)
            this.updateDynamicProperty('segments', updates.segments)
            this.updateDynamicProperty('min', updates.min)
            this.updateDynamicProperty('max', updates.max)
        }
    }
}
</script>

<style>
.nrdb-ui-gauge {
    position: relative;
}
</style>
