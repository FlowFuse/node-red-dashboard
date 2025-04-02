<template>
    <v-radio-group
        v-model="value" class="nrdb-ui-radio-group" :disabled="!state.enabled"
        :class="'nrdb-ui-radio-group--cols-' + columns + ' ' + className"
        variant="outlined" hide-details="auto"
        @update:model-value="onChange"
    >
        <template #label>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-html="label" />
        </template>
        <v-radio
            v-for="option in options" :key="option.value"
            :label="option.label" :value="option.value"
        />
    </v-radio-group>
</template>

<script>
import DOMPurify from 'dompurify'
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUIRadioGroup',
    inject: ['$socket', '$dataTracker'],
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
        label: function () {
            // Sanetize the html to avoid XSS attacks
            return DOMPurify.sanitize(this.getProperty('label'))
        },
        columns: function () {
            return this.getProperty('columns')
        },
        options: {
            get () {
                const items = this.items || this.getProperty('options')
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
        this.$dataTracker(this.id, this.onInput, this.onLoad, this.onDynamicProperties, this.onSync)

        // let Node-RED know that this widget has loaded
        this.$socket.emit('widget-load', this.id)
    },
    methods: {
        // given the last received msg into this node, load the state
        onLoad (msg) {
            if (msg) {
                // update vuex store to reflect server-state
                this.$store.commit('data/bind', {
                    widgetId: this.id,
                    msg
                })
                this.select(this.messages[this.id]?.payload)
            }
        },
        onInput (msg) {
            // update our vuex store with the value retrieved from Node-RED
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })

            // When a msg comes in from Node-RED, we need support 2 operations:
            // 1. add/replace the radio options (to support dynamic options e.g: radiobuttons populated from a database)
            // 2. update the selected value(s)

            const options = msg.options
            if (options) {
                // 1. add/replace the radio options
                // TODO: Error handling if options is not an array
                this.items = options
            }

            // 2. update the selected value(s)
            const payload = msg.payload
            if (payload !== undefined) {
                this.select(payload)
            }
        },
        onChange () {
            // ensure our data binding with vuex store is updated
            const msg = this.messages[this.id] || {}
            // return a single value
            msg.payload = this.value
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
            this.$socket.emit('widget-change', this.id, msg.payload)
        },
        select (value) {
            // An empty string value can be used to clear the current selection
            if (value !== '' && typeof (value) !== 'undefined') {
                const option = this.options.find((o) => {
                    return o.value === value
                })

                // if we didn't find any matching options, we stop here
                if (!option) {
                    return
                }
            }

            // ensure we set our local "value" to match
            this.value = value
        },
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (!updates) {
                return
            }
            this.updateDynamicProperty('label', updates.label)
            this.updateDynamicProperty('columns', updates.columns)
            this.updateDynamicProperty('options', updates.options)
        },
        onSync (msg) {
            this.select(msg.payload)
        }
    }
}
</script>

<style>
.nrdb-ui-radio-group .v-radio-group .v-input__control .v-label {
    margin-inline-start: 0;
}
</style>
