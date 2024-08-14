<template>
    <v-tooltip :text="tooltip" :disabled="!tooltip?.length" location="bottom">
        <!-- eslint-disable-next-line vue/no-template-shadow -->
        <template #activator="{ props }">
            <v-number-input
                v-model="value" :reverse="false" controlVariant="default" :hideInput="false" :inset="false"
                v-bind="props" :disabled="!state.enabled" class="nrdb-ui-number-field" :label="label"
                :rules="validation" :clearable="clearable" variant="outlined" hide-details="auto"
                :prepend-icon="prependIcon" :append-icon="appendIcon" :append-inner-icon="appendInnerIcon"
                :prepend-inner-icon="prependInnerIcon" @update:model-value="onChange" @click:clear="onClear"
            />
        </template>
    </v-tooltip>
</template>

<script>
// eslint-disable-next-line import/no-unresolved
import { VNumberInput } from 'vuetify/labs/VNumberInput'
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUITextInput',
    components: {
        VNumberInput
    },
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            delayTimer: null,
            textValue: null
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        label () {
            return this.props.label
        },
        tooltip () {
            return this.props.tooltip
        },
        clearable () {
            return this.props.clearable
        },
        prependIcon () {
            const icon = this.getProperty('icon')
            const mdiIcon = this.makeMdiIcon(icon)
            if (!icon) {
                return undefined
            }
            return icon && this.iconPosition === 'left' && this.iconInnerPosition === 'outside' ? mdiIcon : undefined
        },
        appendIcon () {
            const icon = this.getProperty('icon')
            const mdiIcon = this.makeMdiIcon(icon)
            if (!icon) {
                return undefined
            }
            return icon && this.iconPosition === 'right' && this.iconInnerPosition === 'outside' ? mdiIcon : undefined
        },
        prependInnerIcon () {
            const icon = this.getProperty('icon')
            const mdiIcon = this.makeMdiIcon(icon)
            if (!icon) {
                return undefined
            }
            return icon && this.iconPosition === 'left' && this.iconInnerPosition === 'inside' ? mdiIcon : undefined
        },
        appendInnerIcon () {
            const icon = this.getProperty('icon')
            const mdiIcon = this.makeMdiIcon(icon)
            if (!icon) {
                return undefined
            }
            return icon && this.iconPosition === 'right' && this.iconInnerPosition === 'inside' ? mdiIcon : undefined
        },
        iconPosition () {
            return this.getProperty('iconPosition')
        },
        iconInnerPosition () {
            return this.getProperty('iconInnerPosition')
        },
        value: {
            get () {
                return this.textValue
            },
            set (val) {
                if (this.value === val) {
                    return // no change
                }
                const msg = this.messages[this.id] || {}
                this.textValue = val
                msg.payload = val
                this.messages[this.id] = msg
            }
        },
        validation () {
            if (this.type === 'email') {
                return [v => !v || /^[^\s@]+@[^\s@]+$/.test(v) || 'E-mail must be valid']
            } else {
                return []
            }
        }
    },
    created () {
        // can't do this in setup as we are using custom onInput function that needs access to 'this'
        this.$dataTracker(this.id, this.onInput, this.onLoad, this.onDynamicProperties)
    },
    methods: {
        tempLog (str) {
            const currentTime = new Date()
            const formattedTime = currentTime.toISOString().replace('T', ' ').split('.')[0] + '.' + currentTime.getMilliseconds()
            console.log(str, formattedTime, this.value)
        },
        onInput (msg) {
            // update our vuex store with the value retrieved from Node-RED
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
            // make sure our v-model is updated to reflect the value from Node-RED
            if (msg.payload !== undefined) {
                this.textValue = msg.payload
            }
        },
        onLoad (msg) {
            // update vuex store to reflect server-state
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
            // make sure we've got the relevant option selected on load of the page
            if (msg?.payload !== undefined) {
                this.textValue = msg.payload
            }
        },
        send () {
            this.tempLog('sent')
            this.$socket.emit('widget-change', this.id, this.value)
        },
        onChange () {
            this.tempLog('initiated')
            // delay enabled and set 300ms by default as the number input emits value after each change.
            if (this.delayTimer) {
                // reset the timer to count from the latest change
                clearTimeout(this.delayTimer)
            }
            this.delayTimer = setTimeout(this.send, this.props.delay)
        },
        onClear () {
            this.send()
        },
        makeMdiIcon (icon) {
            return 'mdi-' + icon.replace(/^mdi-/, '')
        },
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (!updates) {
                return
            }
            this.updateDynamicProperty('icon', updates.icon)
            this.updateDynamicProperty('iconPosition', updates.iconPosition)
            this.updateDynamicProperty('iconInnerPosition', updates.iconInnerPosition)
        }
    }
}
</script>

<style lang="scss">
.nrdb-ui-number-field {
    .v-field__prepend-inner {
        > .v-icon {
            margin-left: 12px;
        }
    }
    .v-field__append-inner {
        > .v-icon {
            margin-right: 12px;
        }
    }

    button {
        color: var(--red-ui-form-input-border-color);
    }
}
</style>
