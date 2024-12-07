<template>
    <div
        class="nrdb-switch"
        :class="computedClass"
        :style="{cursor: lineClickable ? 'pointer' : 'default'}"
        @click="lineClickable ? toggle() : null"
    >
        <label
            v-if="label"
            class="v-label"
        >
            <!-- eslint-disable vue/no-v-html -->
            <span
                class="clickable-label"
                :style="{cursor: textClickable ? 'pointer' : 'default'}"
                @click.stop="textClickable ? toggle() : null"
                v-html="label"
            />
        </label>
        <v-switch
            v-if="!icon" v-model="status"
            :disabled="!state.enabled"
            :class="{'active': status, 'nrdb-ui-switch-default-cursor': !switchClickable}"
            hide-details="auto" color="primary"
            :loading="loading ? (status === true ? 'secondary' : 'primary') : null"
            readonly
            @click.stop="switchClickable ? toggle() : null"
        />
        <v-btn
            v-else-if="!loading"
            variant="text"
            :disabled="!state.enabled"
            :style="{cursor: switchClickable ? 'pointer' : 'default'}"
            :icon="icon"
            :color="color"
            @click.stop="switchClickable ? toggle() : null"
        />
        <v-progress-circular v-else indeterminate color="primary" />
    </div>
</template>

<script>
import DOMPurify from 'dompurify'
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUISwitch',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            selection: null,
            loading: false
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        label () {
            // Sanetize the html to avoid XSS attacks
            return DOMPurify.sanitize(this.getProperty('label'))
        },
        layout () {
            // This spreaded layout will be the default for the existing flows
            // which doesn't have the layout property
            return this.getProperty('layout') || 'row-spread'
        },
        icon () {
            const onicon = this.getProperty('onicon')
            const officon = this.getProperty('officon')

            if (onicon && officon) {
                const icon = this.status ? onicon : officon
                return 'mdi-' + icon.replace(/^mdi-/, '')
            } else {
                return null
            }
        },
        computedClass () {
            return {
                ...(this.layout && { [`nrdb-ui-switch--${this.layout}`]: true }),
                'nrdb-nolabel': !this.label,
                [this.className]: !!this.className
            }
        },
        color () {
            const oncolor = this.getProperty('oncolor')
            const offcolor = this.getProperty('offcolor')

            if (oncolor || offcolor) {
                return this.status ? oncolor : offcolor
            }
            return null
        },
        lineClickable: function () {
            return this.getProperty('clickableArea') === 'line'
        },
        switchClickable: function () {
            return this.getProperty('clickableArea') !== 'none'
        },
        textClickable: function () {
            return this.getProperty('clickableArea') === 'label' || this.getProperty('clickableArea') === 'line'
        },
        value () {
            return this.selection
        },
        status: {
            get () {
                const val = this.value
                if (typeof (val) === 'boolean') {
                    return val
                } else if (typeof (val) === 'object') {
                    // don't make a decision either way, unless it matches, exactly, the defined on/off values
                    if (JSON.stringify(val) === JSON.stringify(this.props.evaluated.on)) {
                        return true
                    } else if (JSON.stringify(val) === JSON.stringify(this.props.evaluated.off)) {
                        return false
                    }
                } else if (this.props.evaluated) {
                    return val === this.props.evaluated.on
                }
                return this.value
            },
            set (val) {
                const msg = this.messages[this.id] || {}
                msg.payload = val
                this.selection = val
                this.messages[this.id] = msg
                if (this.getProperty('decouple')) {
                    this.loading = true
                }
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
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (!updates) {
                return
            }
            this.updateDynamicProperty('label', updates.label)
            this.updateDynamicProperty('layout', updates.layout)
            this.updateDynamicProperty('clickableArea', updates.clickableArea)
            this.updateDynamicProperty('decouple', updates.decouple)
            this.updateDynamicProperty('oncolor', updates.oncolor)
            this.updateDynamicProperty('offcolor', updates.offcolor)
            this.updateDynamicProperty('onicon', updates.onicon)
            this.updateDynamicProperty('officon', updates.officon)
        },
        onInput (msg) {
            // Update our vuex store with the value (in the payload) retrieved from Node-RED.
            if (msg.payload !== undefined) {
                this.$store.commit('data/bind', {
                    widgetId: this.id,
                    msg
                })

                // make sure our v-model is updated to reflect the value from Node-RED
                this.selection = msg.payload
                this.loading = false
            }
        },
        onLoad (msg) {
            if (msg) {
                // update vuex store to reflect server-state
                this.$store.commit('data/bind', {
                    widgetId: this.id,
                    msg
                })
                // make sure we've got the relevant option selected on load of the page
                if (msg.payload !== undefined) {
                    this.selection = msg.payload
                }
            }
        },
        onSync (msg) {
            if (msg && typeof msg.payload !== 'undefined') {
                // make sure we've got the relevant option selected on load of the page
                this.selection = msg.payload
            }
        },
        toggle () {
            if (this.state.enabled) {
                if (this.getProperty('decouple')) {
                    this.loading = true
                    // send the inverse, but don't update the status until we get a response
                    this.$socket.emit('widget-change', this.id, !this.status)
                } else {
                    this.status = !this.status
                    this.$socket.emit('widget-change', this.id, this.status)
                }
            }
        }
    }
}
</script>

<style lang="scss">
.nrdb-switch {
    display: flex;
    gap: 4px;
    .v-switch {
        flex-grow: 0;
    }
    .v-input {
        align-items: center;
        display: flex;
    }
    .v-input__control {
        .v-selection-control {
            justify-content: flex-end;
            min-height: 20px;
            .v-selection-control__wrapper {
                height: 20px;
            }
        }
    }
    &.nrdb-nolabel .v-selection-control {
        justify-content: center;
    }
    > .v-progress-circular > svg {
        width: 24px;
        height: 24px;
    }
}

/* Layouts */
.nrdb-ui-switch {
    &--row-left {
        align-items: center;
        justify-content: flex-start;
    }
    &--row-left-swapped {
        align-items: center;
        justify-content: flex-end;
        flex-direction: row-reverse;
    }
    &--row-spread {
        align-items: center;
        justify-content: space-between;
    }
    &--row-spread-swapped {
        align-items: center;
        justify-content: space-between;
        flex-direction: row-reverse;
    }
}

/* Default cursor */
.nrdb-ui-switch-default-cursor .v-selection-control__input input, .nrdb-ui-switch-default-cursor .v-switch__track {
    cursor:default;
}
</style>
