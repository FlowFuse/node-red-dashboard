<template>
    <v-tooltip :text="tooltip" :disabled="!tooltip?.length" location="bottom">
        <!-- eslint-disable-next-line vue/no-template-shadow -->
        <template #activator="{ props }">
            <v-text-field
                v-if="type !== 'textarea'" v-model="value"
                v-bind="props"
                :disabled="!state.enabled" class="nrdb-ui-text-field"
                :label="label" :type="type" :rules="validation" :clearable="clearable" variant="outlined" hide-details="auto"
                :prepend-icon="prependIcon" :append-icon="appendIcon" :append-inner-icon="appendInnerIcon" :prepend-inner-icon="prependInnerIcon" @update:model-value="onChange"
                @keyup.enter="onEnter" @blur="onBlur" @click:clear="onClear"
            />
            <v-textarea
                v-else
                v-bind="props"
                v-model="value" :disabled="!state.enabled" class="nrdb-ui-text-field"
                :label="label" :prepend-icon="prependIcon" :append-icon="appendIcon" :append-inner-icon="appendInnerIcon" :prepend-inner-icon="prependInnerIcon"
                :clearable="clearable" variant="outlined" hide-details="auto" @update:model-value="onChange" @blur="send"
                @click:clear="onClear"
            />
        </template>
    </v-tooltip>
</template>

<script>
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUIText',
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
        label: function () {
            return this.props.label
        },
        type: function () {
            return this.props.mode || 'text'
        },
        tooltip: function () {
            return this.props.tooltip
        },
        clearable: function () {
            return this.props.clearable
        },
        prependIcon () {
            const icon = this.props?.icon
            if (!icon) {
                return undefined
            }
            const mdiIcon = this.makeMdiIcon(icon)
            return icon && this.props.iconPosition === 'left' && this.props.iconInnerPosition === 'outside' ? mdiIcon : undefined
        },
        appendIcon () {
            const icon = this.props?.icon
            if (!icon) {
                return undefined
            }
            const mdiIcon = this.makeMdiIcon(icon)
            return icon && this.props.iconPosition === 'right' && this.props.iconInnerPosition === 'outside' ? mdiIcon : undefined
        },
        prependInnerIcon () {
            const icon = this.props?.icon
            if (!icon) {
                return undefined
            }
            const mdiIcon = this.makeMdiIcon(icon)
            return icon && this.props.iconPosition === 'left' && this.props.iconInnerPosition === 'inside' ? mdiIcon : undefined
        },
        appendInnerIcon () {
            const icon = this.props?.icon
            if (!icon) {
                return undefined
            }
            const mdiIcon = this.makeMdiIcon(icon)
            return icon && this.props.iconPosition === 'right' && this.props.iconInnerPosition === 'inside' ? mdiIcon : undefined
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
        validation: function () {
            if (this.type === 'email') {
                return [v => !v || /^[^\s@]+@[^\s@]+$/.test(v) || 'E-mail must be valid']
            } else {
                return []
            }
        }
    },
    created () {
        // can't do this in setup as we are using custom onInput function that needs access to 'this'
        this.$dataTracker(this.id, this.onInput, this.onLoad, null)
    },
    methods: {
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
            if (msg.payload !== undefined) {
                this.textValue = msg.payload
            }
        },
        send: function () {
            this.$socket.emit('widget-change', this.id, this.value)
        },
        onChange: function () {
            if (this.props.sendOnDelay) {
                // is send on delay enabled, if so, set a timeout to send the message
                if (this.delayTimer) {
                    // reset the timer to count from the latest change
                    clearTimeout(this.delayTimer)
                }
                this.delayTimer = setTimeout(this.send, this.props.delay)
            }
        },
        onBlur: function () {
            if (this.props.sendOnBlur) {
                // don't compare previous value, if user has clicked away they want it submitted
                this.send()
            }
        },
        onEnter: function () {
            if (this.props.sendOnEnter) {
                // don't compare previous value, if user has pressed <enter> they want it submitted
                this.send()
            }
        },
        onClear: function () {
            if (this.props.sendOnClear) {
                // don't compare previous value, if user has cleared the field they want it submitted
                this.send()
            }
        },
        makeMdiIcon (icon) {
            return 'mdi-' + icon.replace(/^mdi-/, '')
        }
    }
}
</script>

<style scoped></style>
