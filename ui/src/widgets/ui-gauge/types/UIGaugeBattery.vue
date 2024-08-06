<template>
    <div class="nrdb-ui-gauge-battery" :class="`nrdb-ui-gauge-battery--${orientation}`" :style="{'--gauge-fill': color, '--gauge-fill-pc': pc + '%', 'color': getTextColor(props.segments, value)}">
        <div class="nrdb-ui-gauge-battery--center">
            <div class="nrdb-ui-gauge-battery--fill" />
            <label>{{ pc }}%</label>
        </div>
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
    computed: {
        color: function () {
            return UIGaugeMethods.valueToColor(this.props.segments, this.value)
        },
        pc: function () {
            return this.value
        },
        orientation: function () {
            const w = parseInt(this.props.width)
            const h = parseInt(this.props.height)
            return w >= h ? 'horizontal' : 'vertical'
        }
    },
    methods: {
        getTextColor: UIGaugeMethods.getTextColor
    }
}
</script>

<style scoped>
.nrdb-ui-gauge-battery {
    --battery-margin: 12px;
    --battery-radius: 12px;

    border-radius: var(--battery-radius);
    border-width: 8px;
    padding: 6px;
    border-color: var(--gauge-fill);
    border-style: solid;
}
.nrdb-ui-gauge-battery--horizontal {
    margin-right: var(--battery-margin);
}
.nrdb-ui-gauge-battery--vertical {
    margin-top: var(--battery-margin);
}
.nrdb-ui-gauge-battery label {
    font-weight: bold;
    font-size: 2.5rem;
    position: relative;
    z-index: 2;
}
.nrdb-ui-gauge-battery--center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    position: relative;
}
.nrdb-ui-gauge-battery--fill {
    background-color: var(--gauge-fill);
    position: absolute;
    left: 0;
}
.nrdb-ui-gauge-battery--horizontal .nrdb-ui-gauge-battery--fill {
    top: 0;
    height: 100%;
    width: var(--gauge-fill-pc);
}
.nrdb-ui-gauge-battery--vertical .nrdb-ui-gauge-battery--fill {
    bottom: 0;
    height: var(--gauge-fill-pc);
    width: 100%;
}
.nrdb-ui-gauge-battery:after {
    content: "";
    background-color: var(--gauge-fill);
    display: block;
    position: absolute;
}
.nrdb-ui-gauge-battery--horizontal:after {
    width: var(--battery-margin);
    height: 40%;
    top: 30%;
    right: 0;
    border-top-right-radius: calc(var(--battery-radius) * 0.66);
    border-bottom-right-radius: calc(var(--battery-radius) * 0.66);
}
.nrdb-ui-gauge-battery--vertical:after {
    width: 40%;
    height: var(--battery-margin);
    top: 0%;
    right: 30%;
    border-top-left-radius: calc(var(--battery-radius) * 0.66);
    border-top-right-radius: calc(var(--battery-radius) * 0.66);
}
</style>
