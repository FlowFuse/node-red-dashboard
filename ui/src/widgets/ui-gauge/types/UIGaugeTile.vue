<template>
    <div class="nrdb-ui-gauge-tile" :style="{'background-color': valueToColor(value), 'color': getTextColor(value)}">
        {{ props.title }}
    </div>
</template>

<script>

export default {
    name: 'DBUIGaugeTile',
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) },
        value: { type: Number, required: true }
    },
    methods: {
        valueToColor (value) {
            // loop over ordered segments and find the segment this value lives inside
            const segments = this.props.segments
            let color = segments[0].color
            segments.forEach((s) => {
                if (value >= s.from) {
                    color = s.color
                }
            })
            return color
        },
        getTextColor (value) {
            const hex2rgb = (hex) => {
                const r = parseInt(hex.slice(1, 3), 16)
                const g = parseInt(hex.slice(3, 5), 16)
                const b = parseInt(hex.slice(5, 7), 16)

                return [r, g, b]
            }
            const rgb = hex2rgb(this.valueToColor(value))
            if ((rgb[0] * 0.299) + (rgb[1] * 0.587) + (rgb[2] * 0.114) > 186) {
                return 'black'
            } else {
                return 'white'
            }
        }
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
