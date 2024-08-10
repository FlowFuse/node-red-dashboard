<template>
    <div class="nrdb-ui-gauge-water--container">
        <label v-if="props.title" class="nrdb-ui-gauge-title">{{ props.title }}</label>
        <div class="nrdb-ui-gauge-water" :class="`nrdb-ui-gauge-water--${orientation}`" :style="{'--gauge-fill': color, '--gauge-fill-pc': pc + '%', 'color': getTextColor(props.segments, value)}">
            <div class="nrdb-ui-gauge-water--center">
                <div ref="fill" class="nrdb-ui-gauge-water--fill" />
                <svg class="WaveBG" viewBox="0 0 12960 1120">
                    <g style="transform: translateY(25%)">
                        <path d="M9720,320C8100,320,8100,0,6480,0S4860,320,3240,320,1620,0,0,0V1120H12960V0C11340,0,11340,320,9720,320Z">
                            <animate
                                dur="3s"
                                delay="1s"
                                repeatCount="indefinite"
                                attributeName="d"
                                values="
                                    M9720,320C8100,320,8100,0,6480,0S4860,320,3240,320,1620,0,0,0V1120H12960V0C11340,0,11340,320,9720,320Z;
                                    M9720,0C8100,0,8100,319,6480,319S4860,0,3240,0,1620,320,0,320v800H12960V320C11340,320,11340,0,9720,0Z;
                                    M9720,320C8100,320,8100,0,6480,0S4860,320,3240,320,1620,0,0,0V1120H12960V0C11340,0,11340,320,9720,320Z
                                "
                            />
                        </path>
                    </g>
                </svg>
                <svg class="Wave" viewBox="0 0 12960 1120">
                    <g style="transform: translateY(25%)scaleY(2)">
                        <path d="M9720,320C8100,320,8100,0,6480,0S4860,320,3240,320,1620,0,0,0V1120H12960V0C11340,0,11340,320,9720,320Z">
                            <animate
                                dur="5s"
                                repeatCount="indefinite"
                                attributeName="d"
                                values="
                                    M9720,320C8100,320,8100,0,6480,0S4860,320,3240,320,1620,0,0,0V1120H12960V0C11340,0,11340,320,9720,320Z;
                                    M9720,0C8100,0,8100,319,6480,319S4860,0,3240,0,1620,320,0,320v800H12960V320C11340,320,11340,0,9720,0Z;
                                    M9720,320C8100,320,8100,0,6480,0S4860,320,3240,320,1620,0,0,0V1120H12960V0C11340,0,11340,320,9720,320Z
                                "
                            />
                        </path>
                    </g>
                </svg>
                <svg class="mask" width="0" height="0">
                    <defs>
                        <clipPath :id="clipId">
                            <g style="transform: translateY(25%)">
                                <path d="M9720,320C8100,320,8100,0,6480,0S4860,320,3240,320,1620,0,0,0V1120H12960V0C11340,0,11340,320,9720,320Z">
                                    <animate
                                        dur="3s"
                                        delay="1s"
                                        repeatCount="indefinite"
                                        attributeName="d"
                                        values="
                                            M9720,320C8100,320,8100,0,6480,0S4860,320,3240,320,1620,0,0,0V1120H12960V0C11340,0,11340,320,9720,320Z;
                                            M9720,0C8100,0,8100,319,6480,319S4860,0,3240,0,1620,320,0,320v800H12960V320C11340,320,11340,0,9720,0Z;
                                            M9720,320C8100,320,8100,0,6480,0S4860,320,3240,320,1620,0,0,0V1120H12960V0C11340,0,11340,320,9720,320Z
                                        "
                                    />
                                </path>
                            </g>
                            <rect x="0" :y="`${svgOffset}`" :width="`${clipWidth}`" :height="`${clipHeight}`" />
                        </clipPath>
                    </defs>
                </svg>
                <div ref="labels" class="nrdb-ui-gauge-water-labels">
                    <label class="nrdb-ui-gauge-water--fglabel" :style="{'line-height': labelLineHeight, 'clip-path': `url(#${clipId})`}">{{ pc }}%</label>
                    <label class="nrdb-ui-gauge-water--bglabel" :style="{'line-height': labelLineHeight}">{{ pc }}%</label>
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
.Wave,
.WaveBG {
    width: 200%;
    position: absolute;
    animation-name: swell;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    fill: var(--gauge-fill);
    bottom: var(--gauge-fill-pc);
}

.WaveBG {
    opacity: 0.4;
    animation-duration: 2s;
    animation-delay: 1s;
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
    background-color: var(--gauge-fill);
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
}

.nrdb-ui-gauge-water label.nrdb-ui-gauge-water--bglabel {
    color: rgb(var(--v-theme-on-group-background));
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
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
