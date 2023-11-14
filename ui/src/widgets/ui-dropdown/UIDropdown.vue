<!-- eslint-disable no-console -->
<template>
    <v-combobox
        v-model="value"
        :class="className"
        :label="props.label"
        :multiple="props.multiple"
        :items="props.options"
        item-title="label"
        item-value="value"
        variant="outlined"
        hide-details="auto"
        :error-messages="props.options?.length ? '' : 'No options available'"
        @update:model-value="onChange"
    />
</template>

<script>
import { mapState } from 'vuex'

import { useDataTracker } from '../data-tracker.mjs'

export default {
    name: 'DBUIDropdown',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            value: null
        }
    },
    computed: {
        ...mapState('data', ['messages'])
    },
    created () {
        // can't do this in setup as we are using custom onInput function that needs access to 'this'
        useDataTracker(this.id, (msg) => {
            let payload = msg.payload

            // When a msg comes in from Node-RED, we need support 2 operations:
            // 1. add/replace the dropdown options (to support dynamic options e.g: nested dropdowns populated from a database)
            // 2. update the selected value(s)
            // additionally, we need to support both single and multi selection

            // For now, we only support selecting which item(s) are selected, not updating the available options

            // if the payload is an array, we assume it is a list of values to select

            // first, if we have a single value, we need to convert it to an array
            if (!Array.isArray(payload)) {
                payload = [payload]
            }

            // now if this is a single selection, we just need to find the option with the matching value
            if (!this.props.multiple) {
                payload = this.props.options.find((o) => {
                    return o.value === payload[0]
                })
            } else {
                // this is a multi selection, we need to find all the options with matching values
                payload = this.props.options.filter((o) => {
                    return payload.includes(o.value)
                })
            }
            // if we didn't find any matching options, we stop here
            if (!payload) {
                return
            }

            // update our vuex store with the value retrieved from Node-RED
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
            // ensure we set our local "value" to match
            this.value = payload
        })

        // let Node-RED know that this widget has loaded
        // useful as Node-RED can return (via msg-input) any stored data
        this.$socket.emit('widget-load', this.id)
    },
    methods: {
        onChange () {
            // ensure our data binding with vuex store is updated
            const msg = this.messages[this.id] || {}
            if (this.props.multiple) {
                // return an array
                msg.payload = this.value.map((option) => {
                    return option.value
                })
            } else if (this.value) {
                // return a single value
                msg.payload = this.value.value
            } else {
                // return null
                msg.payload = null
            }
            this.$store.commit('data/bind', msg)
            this.$socket.emit('widget-change', this.id, msg.payload)
        }
    }
}
</script>

<style scoped>
</style>
