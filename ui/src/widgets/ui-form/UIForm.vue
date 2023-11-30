<template>
    <label v-if="props.label" class="nrdb-ui-form-label">{{ props.label }}</label>
    <v-form v-model="isValid" @submit.prevent="onSubmit">
        <div class="nrdb-ui-form-rows" :class="{'nrdb-ui-form-rows--split': props.splitLayout}">
            <div v-for="row in props.options" :key="row.key" class="nrdb-ui-form-row">
                <v-checkbox v-if="row.type === 'checkbox'" v-model="input[row.key]" :label="row.label" hide-details="auto" />
                <v-switch v-else-if="row.type === 'switch'" v-model="input[row.key]" class="nrdb-ui-widget" :label="row.label" :class="{'active': state}" hide-details="auto" color="primary" />
                <v-textarea
                    v-else-if="row.type === 'multiline'"
                    v-model="input[row.key]" :rules="rules(row)"
                    class="nrdb-ui-widget nrdb-ui-text-field" :rows="row.rows"
                    :label="row.label" variant="outlined" hide-details="auto"
                />
                <v-text-field
                    v-else
                    v-model="input[row.key]" :rules="rules(row)"
                    class="nrdb-ui-widget nrdb-ui-text-field"
                    :label="row.label" :type="row.type" variant="outlined" hide-details="auto"
                />
            </div>
        </div>
        <div class="nrdb-ui-form-actions">
            <v-btn type="submit" variant="flat" size="large" :disabled="!isValid">{{ props.submit || 'submit' }}</v-btn>
            <v-btn v-if="props.cancel" variant="outlined" size="large" @click="clear">{{ props.cancel }}</v-btn>
        </div>
    </v-form>
</template>

<script>

import { useDataTracker } from '../data-tracker.mjs' // eslint-disable-line import/order
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUIForm',
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
            input: {},
            isValid: null
        }
    },
    computed: {
        ...mapState('data', ['messages'])
    },
    mounted () {
        this.reset()
    },
    methods: {
        onSubmit: function () {
            this.$socket.emit('widget-action', this.id, {
                payload: this.input
            })
            if (this.props.resetOnSubmit) {
                this.reset()
            }
        },
        clear () {
            this.reset()
        },
        reset () {
            this.props.options.forEach(row => {
            // set defaults
                if (row.type === 'check' || row.type === 'switch') {
                    this.input[row.key] = false
                } else if (row.type === 'number') {
                    this.input[row.key] = 0
                } else {
                    this.input[row.key] = ''
                }
            })
        },
        rules (row) {
            if (row.required) {
                // is required
                return [(v) => {
                    return !!v || row.label + ' is required'
                }]
            } else {
                // no rules
                return []
            }
        }
    }
}
</script>

<style scoped>
</style>
