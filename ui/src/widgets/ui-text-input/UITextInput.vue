<template>
    <v-text-field
        v-model="value" class="nrdb-ui-widget nrdb-ui-text-field"
        :label="label" :type="type" :rules="validation" variant="outlined" hide-details="auto" @blur="onBlur"
    />
</template>

<script>

import { useDataTracker } from '../data-tracker.js' // eslint-disable-line import/order
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUIText',
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
        type: function () {
            return this.props.mode || 'text'
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
            }
        },
        validation: function () {
            if (this.type === 'email') {
                return [v => !v || /^[^\s@]+@[^\s@]+$/.test(v) || 'E-mail must be valid']
            } else {
                return []
            }
        }
    },
    methods: {
        onBlur: function () {
            console.log('blur', this.messages[this.id])
            this.$socket.emit(`widget-change:${this.id}`, this.messages[this.id])
        }
    }
}
</script>

<style scoped>
</style>
