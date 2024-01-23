<template>
    <v-text-field
        v-if="type !== 'textarea'" v-model="value"
        :disabled="!state.enabled" class="nrdb-ui-text-field"
        :label="label" :type="type" :rules="validation" variant="outlined" hide-details="auto" @update:model-value="onChange" @keyup.enter="onEnter" @blur="onBlur"
    />
    <v-textarea
        v-else
        v-model="value" :disabled="!state.enabled" class="nrdb-ui-text-field"
        :label="label" variant="outlined" hide-details="auto" @update:model-value="onChange" @blur="send"
    />
</template>

<script>

import { useDataTracker } from '../data-tracker.mjs' // eslint-disable-line import/order
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUIText',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    setup (props) {
        useDataTracker(props.id)
    },
    data () {
        return {
            delayTimer: null
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
        value: {
            get () {
                return this.messages[this.id]?.payload
            },
            set (val) {
                if (this.value === val) {
                    return // no change
                }
                const msg = this.messages[this.id] || {}
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
    methods: {
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
            if (this.props.sendOnBlur && this.value) {
                // check if this value has already been sent, as not going to want it sent twice
                this.send()
            }
        },
        onEnter: function () {
            if (this.props.sendOnEnter) {
                // don't compare previous value, if user has pressed <enter> they want it submitted
                this.send()
            }
        }
    }
}
</script>

<style scoped>
</style>
