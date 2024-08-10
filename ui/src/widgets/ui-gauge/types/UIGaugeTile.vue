<template>
    <div class="nrdb-ui-gauge-tile" :style="{'background-color': valueToColor(props.segments, value), 'color': getTextColor(props.segments, value)}">
        {{ props.title }}
    </div>
</template>

<script>

import UIGaugeMethods from '../ui-gauge.js'

export default {
    name: 'DBUIGaugeTile',
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) },
        value: { type: Number, required: true }
    },
    methods: {
        valueToColor: UIGaugeMethods.valueToColor,
        getTextColor: UIGaugeMethods.getTextColor
    }
}
</script>

<style scoped>
.nrdb-ui-gauge-tile {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2.5rem;
    font-weight: bold;
    transition: 0.15s background-color;
    border: 1px solid rgb(var(--v-theme-group-outline));
}
</style>
