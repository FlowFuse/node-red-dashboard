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
    computed: {
        placeholderText () {
            return `"spacer (${this.props.width}x${this.props.height})"`
        }
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
    content: v-bind(placeholderText);
    font-style: italic;
    display: grid;           /* Switch from flex to grid for wrapped text center aligned support */
    place-items: center;     /* Centers content both horizontally and vertically */
    height: 100%;
    color: #0049ff75;
    white-space: normal;     /* Allows wrapping */
    text-align: center;      /* Ensures wrapped text is centered */
    font-size: 0.8em
}
</style>
