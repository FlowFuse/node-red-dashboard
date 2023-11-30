<template>
    <v-btn block variant="flat" :disabled="!state.enabled" @click="action">{{ props.label }}</v-btn>
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
        ...mapState('data', ['messages'])
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
        }
    }
}
</script>

<style scoped>
</style>
