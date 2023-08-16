<template>
    <v-radio-group
        v-model="value" class="nrdb-ui-widget nrdb-ui-radio-group"
        :class="'nrdb-ui-radio-group--cols-' + props.columns"
        :label="label" variant="outlined" hide-details="auto"
    >
        <v-radio
            v-for="option in props.options" :key="option.value"
            :label="option.label" :value="option.value"
        />
    </v-radio-group>
</template>

<script>

import { useDataTracker } from '../data-tracker.js' // eslint-disable-line import/order
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUIRadioGroup',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
    setup (props) {
        useDataTracker(props.id)
    },
    computed: {
        ...mapState('data', ['messages']),
        label: function () {
            return this.props.label
        },
        value: {
            get () {
                return this.messages[this.id]?.payload
            },
            set (val) {
                if (this.value === val) {
                    return // no change
                }
                const msg = this.messages[this.id] || {}
                msg.payload = val
                this.messages[this.id] = msg
                this.$socket.emit('widget-change', this.id, val)
            }
        }
    }
}
</script>
