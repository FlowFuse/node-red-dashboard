<template>
    <v-combobox
        v-if="typeIsComboBox === true" v-model="value" :disabled="!state.enabled" :class="className"
        :multiple="multiple" :chips="chips" :clearable="clearable" :items="options" item-title="label"
        item-value="value" variant="outlined" hide-details="auto" auto-select-first
        :error-messages="options?.length ? '' : 'No options available'" @update:model-value="onChange"
        @blur="onBlur"
    >
        <template #label>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-html="label" />
        </template>
    </v-combobox>
    <v-select
        v-else v-model="value" :disabled="!state.enabled" :class="className" :multiple="multiple"
        :chips="chips" :clearable="clearable" :items="options" item-title="label" item-value="value" variant="outlined"
        hide-details="auto" :error-messages="options?.length ? '' : 'No options available'"
        @update:model-value="onChange" @blur="onBlur"
    >
        <template #label>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-html="label" />
        </template>
    </v-select>
</template>

<script>
import DOMPurify from 'dompurify'
import { mapState } from 'vuex'

export default {
    name: 'DBUIDropdown',
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
        },
        multiple: function () {
            return this.getProperty('multiple')
        },
        chips: function () {
            return this.getProperty('chips')
        },
        clearable: function () {
            return this.getProperty('clearable')
        },
        label: function () {
            // Sanetize the html to avoid XSS attacks
            return DOMPurify.sanitize(this.getProperty('label'))
        },
        typeIsComboBox: function () {
            return this.props.typeIsComboBox ?? true
        }
    },
    created () {
        // can't do this in setup as we are using custom onInput function that needs access to 'this'
        this.$dataTracker(this.id, null, this.onLoad, this.onDynamicProperties, this.onSync)

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
        onDynamicProperties (msg) {
            // When a msg comes in from Node-RED, we need support 2 operations:
            // 1. add/replace the dropdown options (to support dynamic options e.g: nested dropdowns populated from a database)
            // 2. update the selected value(s)

            // keep options out for backward compatibility
            // Check for booth possible methods to setup the options
            const options = msg.options || msg.ui_update?.options
            if (options) {
                // 1. add/replace the dropdown options
                if (Array.isArray(options)) {
                    this.items = options
                }
            }

            const payload = msg.payload
            if (payload !== undefined) {
                // 2. update the selected value(s)
                this.select(payload)
            }

            // update the UI with any other changes
            const updates = msg.ui_update

            if (updates) {
                this.updateDynamicProperty('label', updates.label)
                this.updateDynamicProperty('multiple', updates.multiple)
                this.updateDynamicProperty('chips', updates.chips)
                this.updateDynamicProperty('clearable', updates.clearable)
                this.updateDynamicProperty('msgTrigger', updates.msgTrigger)
            }
        },
        onSync (msg) {
            // update the UI with any changes
            if (typeof msg?.payload !== 'undefined') {
                if (this.typeIsComboBox) {
                    this.value = this.options.find((o) => o.value === msg.payload)
                } else {
                    this.value = msg.payload
                }
            }
        },
        onChange () {
            // ensure our data binding with vuex store is updated
            const msg = this.messages[this.id] || {}
            if (this.multiple) {
                // return an array
                msg.payload = this.value.map((option) => {
                    if (this.props.typeIsComboBox === false) {
                        return option
                    }
                    return option.value
                })
            } else if (typeof this.value !== 'undefined') {
                // return a single value
                if (this.props.typeIsComboBox === false) {
                    msg.payload = this.value
                } else {
                    msg.payload = this.value.value
                }
            } else {
                // return null
                msg.payload = null
            }
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })

            const msgTrigger = this.getProperty('msgTrigger') || 'onChange'
            if (msgTrigger === 'onChange') {
                this.$socket.emit('widget-change', this.id, msg.payload)
            }
        },
        onBlur () {
            // The onBlur event is triggered when an element loses focus (e.g. when being closed),
            // which can be used as an indicator that the user has finished interacting with the dropdown.
            if (this.getProperty('msgTrigger') === 'onClose') {
                const msg = this.messages[this.id] || {}
                this.$socket.emit('widget-change', this.id, msg.payload)
            }
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

<style scoped></style>
