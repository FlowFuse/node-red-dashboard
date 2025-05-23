<template>
    <v-btn
        block variant="flat" :disabled="!state.enabled" :prepend-icon="prependIcon" :append-icon="appendIcon"
        :class="{ 'nrdb-ui-button--icon': iconOnly }" :color="buttonColor" :style="{ 'min-width': iconOnly ?? 'auto' }"
        @click="action"
        @pointerdown="pointerdown"
        @pointerup="pointerup"
        @pointercancel="pointerup"
        @pointermove="checkIsPointerOverButton"
    >
        <template v-if="prependIcon" #prepend>
            <v-icon :color="iconColor" />
        </template>
        <template v-if="appendIcon" #append>
            <v-icon :color="iconColor" />
        </template>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-if="label" :style="{'color': textColor}" v-html="label" />
    </v-btn>
</template>

<script>

import DOMPurify from 'dompurify'
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUIButton',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            isPointerOverButton: true // Tracks if the pointer is still over the button
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        prependIcon () {
            const icon = this.getProperty('icon')
            const mdiIcon = this.makeMdiIcon(icon)
            return icon && this.iconPosition === 'left' ? mdiIcon : undefined
        },
        appendIcon () {
            const icon = this.getProperty('icon')
            const mdiIcon = this.makeMdiIcon(icon)
            return icon && this.iconPosition === 'right' ? mdiIcon : undefined
        },
        label () {
            // Sanetize the html to avoid XSS attacks
            return DOMPurify.sanitize(this.getProperty('label'))
        },
        iconPosition () {
            return this.getProperty('iconPosition')
        },
        iconOnly () {
            return this.getProperty('icon') && !this.getProperty('label')
        },
        buttonColor () {
            return this.getProperty('buttonColor')
        },
        iconColor () {
            return this.getProperty('iconColor')
        },
        textColor () {
            return this.getProperty('textColor')
        }
    },
    created () {
        this.$dataTracker(this.id, null, null, this.onDynamicProperties)
    },
    methods: {
        action ($evt) {
            if (!this.isPointerOverButton || !this.props.enableClick) {
                return
            }
            const evt = {
                type: $evt.type,
                clientX: $evt.clientX,
                clientY: $evt.clientY,
                bbox: $evt.target.getBoundingClientRect()
            }
            const msg = this.messages[this.id] || {}
            msg._event = evt
            this.$socket.emit('widget-action', this.id, msg)
        },
        pointerdown: function ($evt) {
            if (!this.props.enablePointerdown) {
                return
            }
            const evt = {
                type: $evt.type,
                clientX: $evt.clientX,
                clientY: $evt.clientY,
                bbox: $evt.target.getBoundingClientRect()
            }
            const msg = this.messages[this.id] || {}
            msg._event = evt
            $evt.target.setPointerCapture($evt.pointerId)
            this.$socket.emit('widget-action', this.id, msg)
        },
        pointerup: function ($evt) {
            if (!this.props.enablePointerup) {
                return
            }
            const evt = {
                type: $evt.type,
                clientX: $evt.clientX,
                clientY: $evt.clientY,
                bbox: $evt.target.getBoundingClientRect()
            }
            const msg = this.messages[this.id] || {}
            msg._event = evt
            $evt.target.releasePointerCapture($evt.pointerId)
            this.$socket.emit('widget-action', this.id, msg)
        },
        checkIsPointerOverButton: function ($evt) {
            // Check if pointer is still over the button
            const buttonRect = $evt.target.getBoundingClientRect()
            this.isPointerOverButton = (
                $evt.clientX >= buttonRect.left &&
                $evt.clientX <= buttonRect.right &&
                $evt.clientY >= buttonRect.top &&
                $evt.clientY <= buttonRect.bottom
            )
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
            this.updateDynamicProperty('icon', updates.icon)
            this.updateDynamicProperty('iconPosition', updates.iconPosition)
            this.updateDynamicProperty('buttonColor', updates.buttonColor)
            this.updateDynamicProperty('textColor', updates.textColor)
            this.updateDynamicProperty('iconColor', updates.iconColor)
        }
    }
}
</script>

<style>
.nrdb-ui-button--icon .v-btn__append {
    margin-left: 0;
    margin-inline: initial;
}

.nrdb-ui-button--icon .v-btn__prepend {
    margin-right: 0;
    margin-inline: initial;
}

.nrdb-ui-button .v-btn .v-icon {
    --v-icon-size-multiplier: 1;
}

.nrdb-ui-button .nrdb-ui-button--icon .v-icon {
    --v-icon-size-multiplier: 1.1;
}
</style>
