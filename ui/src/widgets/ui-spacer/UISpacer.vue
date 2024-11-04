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

<style>
.nrdb-edit-mode .nrdb-spacer {
    background-color: #007cff12;
    border: 1px dashed #71aafc;
    border-radius: 4px;
}

.nrdb-edit-mode .nrdb-spacer:before {
    content: "spacer";
    font-style: italic;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #0049ff75;
}
</style>
