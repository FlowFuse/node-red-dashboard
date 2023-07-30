<template>
    <v-btn class="nrdb-ui-widget" block variant="flat" :disabled="!state.enabled" @click="action">{{ props.label }}</v-btn>
</template>

<script>
import { useDataTracker } from '../data-tracker.js' // eslint-disable-line import/order
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
        ...mapState('data', ['values'])
    },
    methods: {
        action ($evt) {
            console.log('button clicked', $evt)
            const evt = {
                clientX: $evt.clientX,
                clientY: $evt.clientY,
                bbox: $evt.target.getBoundingClientRect()
            }
            this.$socket.emit(`widget-action:${this.id}`, {
                event: evt
            })
        }
    }
}
</script>

<style scoped>
</style>
