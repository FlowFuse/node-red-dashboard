<template>
    <div class="nrdb-ui-gauge-tile" :style="{'background-color': segment.color, 'color': segment.textColor}">
        <label>{{ segment.text }}</label>
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
        value: { type: Number, default: 0 }
    },
    computed: {
        segment () {
            console.log('DBUIGaugeTile segment', this.props.segments, this.value)
            const segment = UIGaugeMethods.getSegment(this.props.segments, this.value)
            let label = segment?.text || ''
            if (segment.textType === 'none') {
                label = ''
            } else if (segment.textType === 'value') {
                label = (this.value ?? '').toString()
            } else if (segment.textType === 'label') {
                label = (this.props.label || '').toString()
            }
            console.log('DBUIGaugeTile segment label', label, segment)
            return {
                text: label,
                color: segment?.color ?? 'var(--v-theme-primary)',
                textColor: segment?.textColor ?? 'var(--v-theme-on-primary)',
                from: segment?.from ?? 0
            }
        }
    }
}
</script>

<style scoped lang="scss">
.nrdb-ui-gauge-tile {
    display: flex;
    justify-content: center;
    align-items: center;
    container-type: size;
    font-weight: bold;
    transition: 0.15s background-color;
    border: 1px solid rgb(var(--v-theme-group-outline));
    label {
        text-align: center;
        font-size: 16px; // fallback for browsers that do not support cqw
        // font-size: 12cqw;
        font-size: min(11cqw, max(40cqmin, .5rem));
        line-height: normal;
    }
}
</style>
