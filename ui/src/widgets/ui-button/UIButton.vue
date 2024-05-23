<template>
    <div v-if="icon" class="nrdb-btn-icon">
        <v-btn
            ref="icon-button"
            variant="flat" :disabled="!state.enabled" :icon="icon"
            style="min-width': auto" @click="action"
        />
    </div>
    <v-btn
        v-else
        block variant="flat" :disabled="!state.enabled" :prepend-icon="prependIcon"
        :icon="icon" :append-icon="appendIcon" :style="{'min-width': icon ? 'auto' : null}" @click="action"
    >
        {{ label }}
    </v-btn>
</template>

<script>
import { useDataTracker } from '../data-tracker.mjs' // eslint-disable-line import/order
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUIButton',
    inject: ['$socket'],
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
            return this.getPropertyValue('label') && icon && this.iconPosition === 'left' ? mdiIcon : undefined
        },
        appendIcon () {
            const icon = this.getPropertyValue('icon')
            const mdiIcon = this.makeMdiIcon(icon)
            return this.getPropertyValue('label') && icon && this.iconPosition === 'right' ? mdiIcon : undefined
        },
        icon () {
            const icon = this.getPropertyValue('icon')
            const mdiIcon = this.makeMdiIcon(icon)
            return this.getPropertyValue('label') === '' && icon ? mdiIcon : undefined
        },
        label () {
            return this.getPropertyValue('label')
        },
        iconPosition () {
            return this.getPropertyValue('iconPosition')
        }
    },
    created () {
        useDataTracker(this.id, null, null, this.onDynamicProperties)
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
            if (updates.label !== undefined) {
                this.dynamic.label = updates.label
            }
            if (updates.icon !== undefined) {
                this.dynamic.icon = updates.icon
            }
            if (updates.iconPosition !== undefined) {
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
.nrdb-btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
}
.nrdb-btn-icon .v-btn.v-btn--density-default {
    height: calc(var(--v-btn-height) + 12px);
}
.nrdb-ui-button .v-btn .v-icon {
    --v-icon-size-multiplier: 1;
}
</style>
