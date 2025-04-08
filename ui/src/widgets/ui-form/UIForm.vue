<template>
    <label v-if="label" class="nrdb-ui-form-label">{{ label }}</label>
    <v-form ref="form" v-model="isValid" :disabled="!state.enabled" validate-on="input" @submit.prevent="onSubmit">
        <div class="nrdb-ui-form-rows" :class="{'nrdb-ui-form-rows--split': props.splitLayout}">
            <div v-for="row in options" :key="row.key" class="nrdb-ui-form-row" :data-form="`form-row-${row.key}`">
                <v-checkbox
                    v-if="row.type === 'checkbox'"
                    v-model="input[row.key]"
                    :label="row.label"
                    hide-details="auto"
                />
                <v-select
                    v-else-if="row.type === 'dropdown'"
                    v-model="input[row.key]"
                    class="nrdb-ui-widget"
                    :label="row.label"
                    :class="{'active': state}"
                    hide-details="auto" :rules="rules(row)"
                    color="primary" variant="outlined"
                    :items="filteredDropdownOptions(row.key)"
                    item-title="label"
                    item-value="value"
                />
                <v-switch
                    v-else-if="row.type === 'switch'"
                    v-model="input[row.key]"
                    class="nrdb-ui-widget"
                    :label="row.label"
                    :class="{'active': state}"
                    hide-details="auto"
                    color="primary"
                />
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
            <v-btn data-action="form-submit" type="submit" variant="flat" size="large" :disabled="submitEnabled">{{ props.submit || 'submit' }}</v-btn>
            <v-btn v-if="props.cancel" data-action="form-clear" variant="outlined" :disabled="!state.enabled" size="large" @click="clear">{{ props.cancel }}</v-btn>
        </div>
    </v-form>
</template>

<script>
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUIForm',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            input: {},
            isValid: null
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        label: function () {
            return this.getProperty('label')
        },
        options: function () {
            return this.getProperty('options') || []
        },
        dropdownOptions: function () {
            return this.getProperty('dropdownOptions') || []
        },
        submitEnabled: function () {
            return !(this.isValid && !!this.getProperty('enabled'))
        }
    },
    created () {
        // can't do this in setup as we are using custom onInput function that needs access to 'this'
        this.$dataTracker(this.id, this.onInput, null, this.onDynamicProperties)
    },
    mounted () {
        this.reset()
    },
    methods: {
        onSubmit: function () {
            const options = this.options
            // Clear unused keys from `input`, to prevent sending old keys on next submit
            const allowed = options.map(opt => opt.key)
            this.input = Object.keys(this.input)
                .filter(key => allowed.includes(key))
                .reduce((obj, key) => {
                    return {
                        ...obj,
                        [key]: this.input[key]
                    }
                }, {})
            // Prevent sending null for switch and checkbox, if type number send as Number or null if nothing present on text field and if other fields not present, send empty string
            options.forEach(opt => {
                if (opt.type === 'checkbox' || opt.type === 'switch') {
                    if (typeof (this.input[opt.key]) === 'undefined' || this.input[opt.key] === null) {
                        this.input[opt.key] = false
                    }
                } else if (opt.type === 'number') {
                    if (typeof (this.input[opt.key]) === 'undefined' || this.input[opt.key] === null) {
                        this.input[opt.key] = null
                    } else {
                        if (isNaN(this.input[opt.key])) {
                            this.input[opt.key] = null
                        } else {
                            this.input[opt.key] = Number(this.input[opt.key])
                        }
                    }
                } else {
                    if (typeof (this.input[opt.key]) === 'undefined' || this.input[opt.key] === null) {
                        this.input[opt.key] = ''
                    }
                }
            })

            this.$socket.emit('widget-action', this.id, {
                payload: this.input,
                _event: 'submit'
            })
            if (this.props.resetOnSubmit) {
                this.reset()
            }
        },
        clear () {
            this.reset()
        },
        reset () {
            this.$refs.form.reset()
        },
        validate () {
            this.$refs.form.validate()
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
        },
        onInput (msg) {
            if (msg.payload) {
                const payload = msg.payload
                for (const key in payload) {
                    this.input[key] = payload[key]
                }
                this.$nextTick(() => { this.validate() })
            }
        },
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (updates) {
                this.updateDynamicProperty('label', updates.label)
                this.updateDynamicProperty('options', updates.options)
                this.updateDynamicProperty('dropdownOptions', updates.dropdownOptions)
            }
        },
        filteredDropdownOptions (dropdownName) {
            return this.dropdownOptions.filter(obj => obj.dropdown === dropdownName)
        }
    }
}
</script>

<style scoped>
</style>
