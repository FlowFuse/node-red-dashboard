<template>
    <v-spacer class="nrdb-spacer" />
</template>

<script>

export default {
    name: 'DBUISpacer',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    created () {
        this.$socket.emit('widget-load', this.id)
    }
}
</script>
