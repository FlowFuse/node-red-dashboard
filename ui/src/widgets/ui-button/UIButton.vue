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
        {{ props.label }}
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
    setup (props) {
        useDataTracker(props.id)
    },
    computed: {
        ...mapState('data', ['messages']),
        prependIcon () {
            const icon = this.makeMdiIcon(this.props.icon)
            return this.props.label && this.props.icon && this.props.iconPosition === 'left' ? icon : undefined
        },
        appendIcon () {
            const icon = this.makeMdiIcon(this.props.icon)
            return this.props.label && this.props.icon && this.props.iconPosition === 'right' ? icon : undefined
        },
        icon () {
            const icon = this.makeMdiIcon(this.props.icon)
            return this.props.label === '' && this.props.icon ? icon : undefined
        }
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
