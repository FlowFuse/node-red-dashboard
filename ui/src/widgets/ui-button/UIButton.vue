<template>
    <v-btn
        block variant="flat" :disabled="!state.enabled" :prepend-icon="prependIcon"
        :append-icon="appendIcon" :class="{'nrdb-ui-button--icon': iconOnly}"
        :style="{'min-width': icon ?? 'auto'}" @click="action"
    >
        {{ label }}
    </v-btn>
</template>

<script>
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUIButton',
    inject: ['$socket', '$dt'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            dynamic: {
                label: null,
                icon: null,
                iconPosition: null
            }
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        prependIcon () {
            const icon = this.getPropertyValue('icon')
            const mdiIcon = this.makeMdiIcon(icon)
            return icon && this.iconPosition === 'left' ? mdiIcon : undefined
        },
        appendIcon () {
            const icon = this.getPropertyValue('icon')
            const mdiIcon = this.makeMdiIcon(icon)
            return icon && this.iconPosition === 'right' ? mdiIcon : undefined
        },
        label () {
            return this.getPropertyValue('label')
        },
        iconPosition () {
            return this.getPropertyValue('iconPosition')
        },
        iconOnly () {
            return this.getPropertyValue('icon') && !this.getPropertyValue('label')
        }
    },
    created () {
        this.$dataTracker(this.id, null, null, this.onDynamicProperties)
    },
    methods: {
        action ($evt) {
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
        makeMdiIcon (icon) {
            return 'mdi-' + icon.replace(/^mdi-/, '')
        },
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (!updates) {
                return
            }
            if (typeof updates.label !== 'undefined') {
                this.dynamic.label = updates.label
            }
            if (typeof updates.icon !== 'undefined') {
                this.dynamic.icon = updates.icon
            }
            if (typeof updates.iconPosition !== 'undefined') {
                this.dynamic.iconPosition = updates.iconPosition
            }
        },
        getPropertyValue (property) {
            return this.dynamic[property] !== null ? this.dynamic[property] : this.props[property]
        }
    }
}
</script>

<style>
.nrdb-ui-button--icon .v-btn__append {
    margin-left: 0;
}
.nrdb-ui-button--icon .v-btn__prepend {
    margin-right: 0;
}

.nrdb-ui-button .v-btn .v-icon {
    --v-icon-size-multiplier: 1;
}
.nrdb-ui-button .nrdb-ui-button--icon .v-icon {
    --v-icon-size-multiplier: 1.1;
}
</style>
