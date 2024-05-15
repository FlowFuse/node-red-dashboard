<template>
    <v-combobox
        v-model="value"
        :disabled="!state.enabled"
        :class="className"
        :label="props.label"
        :multiple="props.multiple"
        :items="options"
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
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            value: null,
            items: null
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        options: {
            get () {
                const items = this.items || this.props.options
                return items.map((item) => {
                    if (typeof item !== 'object') {
                        return {
                            label: item,
                            value: item
                        }
                    } else if (!('label' in item) || item.label === '') {
                        return {
                            label: item.value,
                            value: item.value
                        }
                    } else {
                        return item
                    }
                })
            },
            set (value) {
                this.items = value
            }
        }
    },
    created () {
        // can't do this in setup as we are using custom onInput function that needs access to 'this'
        useDataTracker(this.id, null, this.onLoad, this.onDynamicProperties)

        // let Node-RED know that this widget has loaded
        this.$socket.emit('widget-load', this.id)
    },
    methods: {
        // given the last received msg into this node, load the state
        onLoad (msg) {
            // update vuex store to reflect server-state
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
            this.select(this.messages[this.id]?.payload)
        },
        onDynamicProperties (msg) {
            // When a msg comes in from Node-RED, we need support 2 operations:
            // 1. add/replace the dropdown options (to support dynamic options e.g: nested dropdowns populated from a database)
            // 2. update the selected value(s)

            const options = msg.options
            if (options) {
                // 1. add/replace the dropdown options
                // TODO: Error handling if options is not an array
                this.items = options
            }

            const payload = msg.payload
            if (payload !== undefined) {
                // 2. update the selected value(s)
                this.select(payload)
            }
            // additionally, we need to support both single and multi selection
            // For now, we only support selecting which item(s) are selected, not updating the available options
            // if the payload is an array, we assume it is a list of values to select
        },
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
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
            this.$socket.emit('widget-change', this.id, msg.payload)
        },
        select (value) {
            if (value !== undefined) {
                // first, if we have a single value, we need to convert it to an array
                if (!Array.isArray(value)) {
                    value = [value]
                }

                // value [] is used to clear the current selection
                if (value.length > 0) {
                    // now if this is a single selection, we just need to find the option with the matching value
                    if (!this.props.multiple) {
                        value = this.options.find((o) => {
                            return o.value === value[0]
                        })
                    } else {
                        // this is a multi selection, we need to find all the options with matching values
                        value = this.options.filter((o) => {
                            return value.includes(o.value)
                        })
                    }
                    // if we didn't find any matching options, we stop here (unless value is [])
                    if (!value) {
                        return
                    }
                }

                // ensure we set our local "value" to match
                this.value = value
            }
        }
    }
}
</script>

<style scoped>
</style>
