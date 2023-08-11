<template>
    <label v-if="props.label" class="nrdb-ui-form-label">{{ props.label }}</label>
    <v-form @submit.prevent="onSubmit">
        <div class="nrdb-ui-form-rows" :class="{'nrdb-ui-form-rows--split': props.splitLayout}">
            <div v-for="(row, $index) in props.options" :key="$index" class="nrdb-ui-form-row">
                <v-checkbox v-if="row.type === 'checkbox'" :label="row.label" hide-details="auto" />
                <v-switch v-else-if="row.type === 'switch'" v-model="state" class="nrdb-ui-widget" :label="row.label" :class="{'active': state}" hide-details="auto" color="primary" />
                <v-textarea
                    v-else-if="row.type === 'multiline'"
                    class="nrdb-ui-widget nrdb-ui-text-field" :rows="row.rows"
                    :label="row.label" variant="outlined" hide-details="auto"
                />
                <v-text-field
                    v-else
                    class="nrdb-ui-widget nrdb-ui-text-field"
                    :label="row.label" :type="row.type" :rules="validation" variant="outlined" hide-details="auto"
                />
            </div>
        </div>
        <div class="nrdb-ui-form-actions">
            <v-btn type="submit" variant="flat" size="large">{{ props.submit || 'submit' }}</v-btn>
            <v-btn variant="outlined" size="large" @click="clear">{{ props.cancel || 'clear' }}</v-btn>
        </div>
    </v-form>
</template>

<script>

import { useDataTracker } from '../data-tracker.js' // eslint-disable-line import/order
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
    computed: {
        ...mapState('data', ['messages'])
    },
    methods: {
        onSubmit: function () {
            this.$socket.emit('widget-action', this.id, this.value)
        },
        clear () {
            console.log('clear')
        }
    }
}
</script>

<style scoped>
</style>
