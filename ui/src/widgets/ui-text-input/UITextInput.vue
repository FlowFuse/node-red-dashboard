<template>
    <v-tooltip :text="tooltip" :disabled="!tooltip?.length" location="bottom">
        <!-- eslint-disable-next-line vue/no-template-shadow -->
        <template #activator="{ props: activatorProps }">
            <v-text-field
                v-if="type !== 'textarea'" v-model="value"
                v-bind="activatorProps"
                :disabled="!state.enabled" class="nrdb-ui-text-field"
                :type="type" :rules="validation" :clearable="clearable" variant="outlined" hide-details="auto"
                :prepend-icon="prependIcon" :append-icon="appendIcon" :append-inner-icon="appendInnerIcon" :prepend-inner-icon="prependInnerIcon" @update:model-value="onChange"
                @keyup.enter="onEnter" @blur="onBlur" @click:clear="onClear"
            >
                <template #label>
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <span v-html="label" />
                </template>
            </v-text-field>
            <v-textarea
                v-else
                v-bind="activatorProps"
                v-model="value" :disabled="!state.enabled" class="nrdb-ui-text-field nrdb-ui-textarea" :style="{ 'grid-row-end': `span ${props.height}` }"
                :prepend-icon="prependIcon" :append-icon="appendIcon" :append-inner-icon="appendInnerIcon" :prepend-inner-icon="prependInnerIcon"
                :clearable="clearable" variant="outlined" hide-details="auto" :rows="props.height || 1" @update:model-value="onChange" @blur="send"
                @click:clear="onClear"
            >
                <template #label>
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <span v-html="label" />
                </template>
            </v-textarea>
        </template>
    </v-tooltip>
</template>

<script>
import DOMPurify from 'dompurify'
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUITextInput',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            delayTimer: null
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        value: {
            get () {
                return this.messages[this.id]?.payload
            },
            set (val) {
                if (!this.messages[this.id]) {
                    this.messages[this.id] = {}
                }
                this.messages[this.id].payload = val
            }
        },
        label: function () {
            // Sanetize the html to avoid XSS attacks
            return DOMPurify.sanitize(this.getTranslatedProperty('label'))
        },
        type: function () {
            return this.getProperty('mode') || 'text'
        },
        tooltip: function () {
            return this.getTranslatedProperty('tooltip')
        },
        clearable: function () {
            return this.getProperty('clearable')
        },
        prependIcon () {
            const icon = this.getProperty('icon')
            if (!icon) {
                return undefined
            }
            const mdiIcon = this.makeMdiIcon(icon)
            return icon && this.iconPosition === 'left' && this.iconInnerPosition === 'outside' ? mdiIcon : undefined
        },
        appendIcon () {
            const icon = this.getProperty('icon')
            if (!icon) {
                return undefined
            }
            const mdiIcon = this.makeMdiIcon(icon)
            return icon && this.iconPosition === 'right' && this.iconInnerPosition === 'outside' ? mdiIcon : undefined
        },
        prependInnerIcon () {
            const icon = this.getProperty('icon')
            if (!icon) {
                return undefined
            }
            const mdiIcon = this.makeMdiIcon(icon)
            return icon && this.iconPosition === 'left' && this.iconInnerPosition === 'inside' ? mdiIcon : undefined
        },
        appendInnerIcon () {
            const icon = this.getProperty('icon')
            if (!icon) {
                return undefined
            }
            const mdiIcon = this.makeMdiIcon(icon)
            return icon && this.iconPosition === 'right' && this.iconInnerPosition === 'inside' ? mdiIcon : undefined
        },
        iconPosition () {
            return this.getProperty('iconPosition')
        },
        iconInnerPosition () {
            return this.getProperty('iconInnerPosition')
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
        this.$dataTracker(this.id, null, null, this.onDynamicProperties)
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
        },
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (!updates) {
                return
            }
            this.updateDynamicProperty('label', updates.label)
            this.updateDynamicProperty('mode', updates.mode)
            this.updateDynamicProperty('clearable', updates.clearable)
            this.updateDynamicProperty('icon', updates.icon)
            this.updateDynamicProperty('iconPosition', updates.iconPosition)
            this.updateDynamicProperty('iconInnerPosition', updates.iconInnerPosition)
        }
    }
}
</script>

<style lang="scss">
.nrdb-ui-textarea {
    height: 100%; /* Ensure the textarea takes full height */
    &.v-input--horizontal{
        &:has(textarea) {
            grid-template-rows: auto 0;
        }
    }
    textarea.v-field__input {
        height:100%;
        resize: none;
    }
}
</style>
