<template>
    <div class="nrdb-ui-gauge-battery--container">
        <label v-if="props.title" class="nrdb-ui-gauge-title">{{ props.title }}</label>
        <div class="nrdb-ui-gauge-battery" :class="`nrdb-ui-gauge-battery--${orientation}`" :style="{'--gauge-fill': color, '--gauge-fill-pc': pc + '%', 'color': getTextColor(props.segments, value)}">
            <div class="nrdb-ui-gauge-battery--center">
                <div class="nrdb-ui-gauge-battery-icon nrdb-ui-gauge-battery-icon--bg">
                    <BatteryIcon :style="{'color': color}" />
                </div>
                <div ref="fill" class="nrdb-ui-gauge-battery--fill" />
                <svg width="0" height="0">
                    <defs>
                        <clipPath :id="clipId">
                            <rect x="0" :y="`${svgOffset}`" :width="`${clipWidth}`" :height="`${clipHeight}`" />
                        </clipPath>
                    </defs>
                </svg>
                <div class="nrdb-ui-gauge-battery-icon nrdb-ui-gauge-battery-icon--fill">
                    <BatteryIcon />
                </div>
                <div ref="labels" class="nrdb-ui-gauge-battery-labels">
                    <label class="nrdb-ui-gauge-battery--fglabel" :style="{'line-height': labelLineHeight, 'clip-path': `url(#${clipId})`}">{{ pc }}%</label>
                    <label class="nrdb-ui-gauge-battery--bglabel" :style="{'line-height': labelLineHeight}">{{ pc }}%</label>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import BatteryIcon from '../../../components/icons/BatteryIcon.vue'
import UIGaugeMethods from '../ui-gauge.js'

export default {
    name: 'DBUIGaugeTile',
    components: {
        BatteryIcon
    },
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) },
        value: { type: Number, required: true }
    },
    data () {
        return {
            clipWidth: 0,
            clipHeight: 0,
            labelLineHeight: 0,
            svgOffset: 0
        }
    },
    computed: {
        color: function () {
            return UIGaugeMethods.valueToColor(this.props.segments, this.value)
        },
        pc: function () {
            if (typeof this.value !== 'undefined') {
                return Math.max(0, Math.min(Math.round((this.value - this.props.min) / (this.props.max - this.props.min) * 100), 100))
            } else {
                return 0
            }
        },
        orientation: function () {
            const w = parseInt(this.props.width)
            const h = parseInt(this.props.height)
            return w >= h ? 'horizontal' : 'vertical'
        },
        clipId: function () {
            return `clip-${this.id}`
        }
    },
    watch: {
        value: function () {
            this.$nextTick(() => {
                // react to the fill element being updated
                this.updateMask()
            })
        }
    },
    mounted () {
        this.$nextTick(() => {
            this.updateMask()
        })
    },
    methods: {
        getTextColor: UIGaugeMethods.getTextColor,
        updateMask () {
            const h = this.$refs.fill?.clientHeight || 0
            this.clipWidth = `${this.$refs.fill?.clientWidth || 0}px`
            this.clipHeight = `${h}px`
            // read from the DOM if it's ready, otherwise reverse-engineer
            this.labelLineHeight = this.$refs.labels ? `${this.$refs.labels.clientHeight}px` : `${100 * h / this.pc}px`
            // work out if we need to offset our SVG mask
            if (this.orientation === 'vertical' && h >= 0 && this.pc !== 0) {
                this.svgOffset = (h / (this.pc / 100)) - h
            } else {
                this.svgOffset = 0
            }
        }
    }
}
</script>

<style scoped>
.nrdb-ui-gauge-battery--container {
    display: flex;
    flex-direction: column;
}
.nrdb-ui-gauge-battery {
    --battery-margin: 12px;
    --battery-radius: 12px;
    --battery-border: 8px;

    border-radius: var(--battery-radius);
    border-width: var(--battery-border);
    padding: 6px;
    border-color: var(--gauge-fill);
    border-style: solid;
    flex-grow: 1;
    position: relative;
}
.nrdb-ui-gauge-battery--horizontal {
    margin-right: var(--battery-margin);
}
.nrdb-ui-gauge-battery--vertical {
    margin-top: var(--battery-margin);
}
.nrdb-ui-gauge-battery-icon {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    fill-opacity: 0.25;
}
.nrdb-ui-gauge-battery-icon.nrdb-ui-gauge-battery-icon--bg {
    color: black;
}
.nrdb-ui-gauge-battery-icon.nrdb-ui-gauge-battery-icon--fill {
    color: white;
}
.nrdb-ui-gauge-battery-icon.nrdb-ui-gauge-battery-icon--fill svg {
}
.nrdb-ui-gauge-battery-labels {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    container-type: size;
}
.nrdb-ui-gauge-battery label {
    font-weight: bold;
    resize: both;
    font-size: min(2.5rem, 30cqmin);
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    text-align: center;
    white-space: nowrap;
}
.nrdb-ui-gauge-battery label.nrdb-ui-gauge-battery--fglabel {
    clip-path: url(#clip);

}
.nrdb-ui-gauge-battery label.nrdb-ui-gauge-battery--bglabel {
    color: rgb(var(--v-theme-on-group-background));
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
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
}
.nrdb-ui-gauge-battery svg {
    top: 0;
}
.nrdb-ui-gauge-battery svg,
.nrdb-ui-gauge-battery--fill {
    position: absolute;
    left: 0;
}
.nrdb-ui-gauge-battery--horizontal svg,
.nrdb-ui-gauge-battery--horizontal .nrdb-ui-gauge-battery--fill {
    top: 0;
    height: 100%;
    width: var(--gauge-fill-pc);
}
.nrdb-ui-gauge-battery--vertical svg,
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
    right: calc(-1 * var(--battery-margin) - var(--battery-border));
    border-top-right-radius: calc(var(--battery-radius) * 0.5);
    border-bottom-right-radius: calc(var(--battery-radius) * 0.5);
}
.nrdb-ui-gauge-battery--vertical:after {
    width: 40%;
    height: var(--battery-margin);
    top: calc(-1 * var(--battery-margin) - var(--battery-border));
    right: 30%;
    border-top-left-radius: calc(var(--battery-radius) * 0.5);
    border-top-right-radius: calc(var(--battery-radius) * 0.5);
}
.nrdb-ui-gauge-battery-icon svg {
    width: 40%;
    height: 40%;
    position: relative;
}
</style>
