<template>
    <div class="nrdb-ui-gauge-water--container">
        <label v-if="props.title" class="nrdb-ui-gauge-title">{{ props.title }}</label>
        <div
            class="nrdb-ui-gauge-water" :class="`nrdb-ui-gauge-water--${orientation}`"
            :style="{'--gauge-fill': color, '--gauge-fill-pc': pc + '%', 'color': getTextColor(props.segments, value)}"
        >
            <div class="nrdb-ui-gauge-water--center">
                <div ref="fill" class="nrdb-ui-gauge-water--fill" />
                <svg class="WaveBG" :style="`bottom: 0;height: ${svgBottom}`" :viewBox="`0 ${amplitude} 1000 ${Math.min(100, svgScaleRatio * svgBottom)}`" preserveAspectRatio="xMinYMin meet">
                    <path :d="waves[0]">
                        <animate
                            dur="5s"
                            repeatCount="indefinite"
                            attributeName="d"
                            :values="`${waves[0]}; ${waves[1]}; ${waves[0]};`"
                        />
                    </path>
                </svg>
                <svg class="Wave" :style="`bottom: 0;height: ${svgBottom}`" :viewBox="`0 ${amplitude} 1000 ${Math.min(100, svgScaleRatio * svgBottom)}`" preserveAspectRatio="xMinYMin meet">
                    <path :d="waves[0]">
                        <animate
                            dur="5s"
                            repeatCount="indefinite"
                            attributeName="d"
                            :values="`${waves[0]}; ${waves[1]}; ${waves[0]};`"
                        />
                    </path>
                </svg>
                <div ref="labels" class="nrdb-ui-gauge-water-labels">
                    <label class="nrdb-ui-gauge-water--fglabel" :style="{'line-height': labelLineHeight}">{{ pc }}%</label>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import UIGaugeMethods from '../ui-gauge.js'

export default {
    name: 'DBUIGaugeWaterTank',
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
            svgOffset: 0,
            svgBottom: 0,
            amplitude: 15,
            svgScaleRatio: 1
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
        },
        waves: function () {
            const amplitude = this.amplitude * this.svgScaleRatio
            const svgBottom = this.svgBottom
            const svgScaleRatio = this.svgScaleRatio
            return [
                `M750,${amplitude} c -125,0 -125,-${amplitude} -250,-${amplitude} s -125,${amplitude} -250,${amplitude} S 125,0, 0,0 v${svgScaleRatio * (svgBottom + amplitude)}h1000 V0 c-125,0 -125,${amplitude} -250,${amplitude}Z`,
                `M750,0 c -125,0 -125,${amplitude} -250,${amplitude} S 375,0 250,0, S 125,${amplitude}, 0,${amplitude} v${svgScaleRatio * svgBottom}h1000 V${amplitude} c-125,0 -125-${amplitude} -250-${amplitude}Z`
            ]
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
            const w = this.$refs.fill?.clientWidth || 0
            this.clipWidth = `${w}px`
            this.clipHeight = `${h}px`
            // read from the DOM if it's ready, otherwise reverse-engineer
            this.labelLineHeight = this.$refs.labels ? `${this.$refs.labels.clientHeight}px` : `${100 * h / this.pc}px`
            // work out if we need to offset our SVG mask
            if (this.orientation === 'vertical' && h >= 0 && this.pc !== 0) {
                this.svgOffset = (h / (this.pc / 100)) - h
                this.svgBottom = h
                this.svgScaleRatio = w !== 0 ? 1000 / w : 1
            } else {
                this.svgOffset = 0
                this.svgBottom = 0
                this.svgScaleRatio = 1
            }
        }
    }
}
</script>

<style scoped>
.Wave,
.WaveBG {
    width: 200%;
    position: absolute;
    overflow: visible;
    animation-name: swell;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    fill: var(--gauge-fill);
    bottom: var(--gauge-fill-pc);
}

.WaveBG {
    opacity: 0.4;
    /* offset the animation so that the wave's standing nodes never overlap */
    animation-duration: 1.5s;
    animation-delay: 1.2s;
}
.Wave {
    animation-duration: 2s;
}

@keyframes swell {
  0% {
    transform: scaleX(2) translateX(25%) translateY(1px);
  }
  100% {
    transform: scaleX(2) translateX(-25%) translateY(1px);
  }
}

.nrdb-ui-gauge-water--container {
    display: flex;
    flex-direction: column;
}
.nrdb-ui-gauge-water {
    --water-margin: 12px;
    --water-radius: 12px;
    --water-border: 8px;

    border-radius: var(--water-radius);
    border-width: var(--water-border);
    padding: 6px;
    border-color: var(--gauge-fill);
    border-style: solid;
    flex-grow: 1;
    position: relative;
}
.nrdb-ui-gauge-water--fill {
    background-color: transparent;
}
.nrdb-ui-gauge-water--horizontal {
    margin-right: var(--water-margin);
}
.nrdb-ui-gauge-water--vertical {
    margin-top: var(--water-margin);
}
.nrdb-ui-gauge-water-labels {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    container-type: size;
}
.nrdb-ui-gauge-water label {
    font-weight: bold;
    resize: both;
    font-size: min(2.5rem, 30cqmin);
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    text-align: center;
    white-space: nowrap;
    color: black;
}

.nrdb-ui-gauge-water--center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    position: relative;
    overflow: hidden;
}

/* text mask */
.nrdb-ui-gauge-water svg.mask {
    top: 0;
}
.nrdb-ui-gauge-water svg.mask,
.nrdb-ui-gauge-water--fill {
    position: absolute;
    left: 0;
}
.nrdb-ui-gauge-water--horizontal svg.mask,
.nrdb-ui-gauge-water--horizontal .nrdb-ui-gauge-water--fill {
    top: 0;
    height: 100%;
    width: var(--gauge-fill-pc);
}
.nrdb-ui-gauge-water--vertical svg.mask,
.nrdb-ui-gauge-water--vertical .nrdb-ui-gauge-water--fill {
    bottom: 0;
    height: var(--gauge-fill-pc);
    width: 100%;
}
</style>
