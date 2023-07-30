<template>
    <v-text-field
        v-model="values[id]" class="nrdb-ui-widget nrdb-ui-text-field"
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
        ...mapState('data', ['values']),
        label: function () {
            return this.props.label
        },
        type: function () {
            return this.props.mode || 'text'
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
            console.log('blur', this.values[this.id])
            this.$socket.emit(`widget-change:${this.id}`, this.values[this.id])
        }
    }
}
</script>

<style scoped>
</style>
