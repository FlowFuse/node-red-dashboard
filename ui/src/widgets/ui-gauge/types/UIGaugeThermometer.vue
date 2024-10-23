<!-- eslint-disable vue/html-self-closing -->
<template>
    <div ref="container" class="nrdb-ui-gauge-thermometer-wrapper">
        <div ref="thermometerContainer" class="thermometer-container">
            <div ref="thermometer" class="thermometer" :style="thermometerStyles">
                <div class="temperature" :style="tempuratureStyles" :data-value="temperatureValue"></div>
            </div>
            <div class="mercury-bulb" :style="mercuryBulbStyles"></div>
            <div v-if="showTooltip" class="tooltip-container">
                <div :class="`thermometer-tooltip ${tooltipPosition}`" :style="tooltipStyles">{{ temperatureValue }}</div>
            </div>
            <div class="thermometer-range" :class="tooltipPosition">
                <div v-if="max" class="max">{{ max }}</div>
                <div v-if="min" class="min">{{ min }}</div>
            </div>
        </div>
        <label v-if="props.label" ref="title" class="nrdb-ui-gauge-title">{{ props.label }}</label>
    </div>
</template>

<script>
import { mapState } from 'vuex' // eslint-disable-line import/order
import UIGaugeMethods from '../ui-gauge.js'

export default {
    name: 'DBUIGaugeThermometer',
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            resizeObserver: null
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        value () {
            return this.messages[this.id]?.payload
        },
        min () {
            return this.props.min
        },
        max () {
            return this.props.max
        },
        units () {
            return this.props.units
        },
        segments () {
            return this.props.segments
        },
        clampedValue () {
            return Math.min(Math.max(this.value, this.min), this.max)
        },
        temperatureHeight () {
            return (this.clampedValue - this.min) / (this.max - this.min) * 100
        },
        temperatureValue () {
            return `${this.value}${this.units}`
        },
        tooltipPosition () {
            return this.props.tooltipPosition
        },
        color () {
            return UIGaugeMethods.valueToColor(this.segments, this.value)
        },
        tooltipStyles () {
            return { bottom: `calc(${parseInt(this.temperatureHeight)}% - 8px)` }
        },
        tempuratureStyles () {
            return {
                backgroundColor: this?.color,
                height: `${this.temperatureHeight}%`
            }
        },
        thermometerStyles () {
            return {
                borderLeft: `4px solid ${this?.color}`,
                borderTop: `4px solid ${this?.color}`,
                borderRight: `4px solid ${this?.color}`,
                borderBottom: '4px solid transparent'
            }
        },
        mercuryBulbStyles () {
            return {
                backgroundColor: this?.color,
                border: `4px solid ${this?.color}`
            }
        },
        showTooltip () {
            return this.value !== undefined
        }
    },
    mounted () {
        this.initResizeObserver()
    },
    unmounted () {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
            this.resizeObserver = null
        }
    },
    methods: {
        initResizeObserver () {
            this.resizeObserver = new ResizeObserver(entries => {
                for (const entry of entries) {
                    if (entry.target === this.$refs.container || entry.target === this.$el.parentElement) {
                        this.resize()
                    }
                }
            })
            this.resizeObserver.observe(this.$refs.container)
            this.resizeObserver.observe(this.$el.parentElement) // Observe the parent element
        },
        resize () {
            const container = this.$el.parentElement
            const thermometer = this.$refs.thermometerContainer

            if (container && thermometer) {
                const containerHeight = container.clientHeight
                const containerWidth = container.clientWidth

                const originalHeight = 180 // Original height of thermometer
                const originalWidth = 20 // Original width of thermometer

                // Calculate scale factors for width and height
                const scaleX = containerWidth / originalWidth
                const scaleY = containerHeight / originalHeight

                // Use the smaller scale to maintain aspect ratio
                const scale = Math.min(scaleX, scaleY)

                // Apply the scale transform
                thermometer.style.transform = `scale(${scale})`
                thermometer.style.transformOrigin = 'top center'
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.nrdb-ui-gauge-thermometer-wrapper {
margin: auto;
display: flex;
flex-direction: column;
align-items: center;
justify-content: flex-start;
position: relative;
width: 100%;
height: 100%;
}

$TM-width: 20px;
$TM-height: 115px;
$TM-bulbSize: $TM-width * 1.6;
$TM-radius: 20px;

// Tooltip
$TM-tooltipColor: rgba(0, 0, 0, 0.7);
$TM-tooltipSize: 1em;
$TM-tooltipRadius: 5px;
$TM-tooltipVerticalPadding: 5px;
$TM-tooltipHorizontalPadding: $TM-tooltipVerticalPadding * 2;
$TM-tooltipArrowHeight: 2.2; // Higher numbers produce smaller height

@mixin trianlge() {
border-top: 0.4rem solid transparent;
border-bottom: 0.36rem solid transparent;
border-right: 0.4rem solid $TM-tooltipColor;
}

// THERMOMETER ―――――――――――――――――――――――――

.thermometer-container {
position: relative;
.tooltip-container {
  position: absolute;
  height: calc(100% - 12px);
  bottom: 8px;
  width: 100%;
  .thermometer-tooltip {
    position: absolute;
    transition: all 0.2s ease-in-out;
    background: $TM-tooltipColor;
    color: white;
    z-index: 2;
    padding: 0.2rem;
    border-radius: 0.2rem;
    font-size: 0.8em;
    line-height: 1;
    white-space: nowrap;
    &.right {
      left: 1.6rem;
      &:before {
        content: "";
        @include trianlge;
        position: absolute;
        right: 100%;
      }
    }
    &.left {
      right: 1.6rem;
      &:before {
        content: "";
        @include trianlge;
        transform: rotate(180deg);
        position: absolute;
        left: 100%;
      }
    }
  }
}
}

.thermometer {
position: relative;
width: $TM-width;
height: $TM-height;
border-radius: $TM-radius $TM-radius 0 0;
z-index: 1;
overflow: hidden;
transition: all 0.2s ease-in-out;

.temperature {
  bottom: 0;
  width: calc(100% - 6px);
  left: 3px;
  background-size: 100% $TM-height;
  transition: all 0.2s ease-in-out;

  &, &:before, &:after {
    position: absolute;
  }

  &.tooltip {
    &:before {
      content: attr(data-value);
      background: $TM-tooltipColor;
      color: white;
      z-index: 2;
      padding: $TM-tooltipVerticalPadding $TM-tooltipHorizontalPadding;
      border-radius: $TM-tooltipRadius;
      font-size: $TM-tooltipSize;
      line-height: 1;
      white-space: nowrap;
      top: calc(-#{$TM-tooltipSize} / #{$TM-tooltipArrowHeight} - 6px);
    }
    &:after {
      content: "";
      top: calc(-#{$TM-tooltipSize} / #{$TM-tooltipArrowHeight} - 1px);
    }
    &.tooltip-right {
      &:before {
        left: calc(100% + 13px);
      }
      &:after {
        @include trianlge;
        left: calc(100% + 4px);
      }
    }
    &.tooltip-left {
      &:before {
        right: calc(100% + 13px);
      }
      &:after {
        @include trianlge;
        transform: rotate(180deg);
        right: calc(100% + 4px);
      }
    }
  }
}
}
.mercury-bulb {
position: absolute;
content: "";
border-radius: 50%;
transform: translateX(-50%);
width: $TM-bulbSize;
height: $TM-bulbSize;
top: calc(100% - 9px);
z-index: -3;
left: 50%;
transition: all 0.2s ease-in-out;
}

.thermometer-range {
  position: absolute;
  height: 100%;
  top: 0;
  &.right {
    left: -0.25rem;
    .min {
      bottom: 0;
      right: 0;
    }
    .max {
      top: 0;
      right: 0;
    }
  }
  &.left {
    right: -0.25rem;
    .min {
      bottom: 0;
      left: 0;
    }
    .max {
      top: 0;
      left: 0;
    }
  }
  .min,
  .max {
    position: absolute;
    font-size: 0.8em;
    color: rgb(var(--v-theme-on-group-background)) !important;
    font-weight: bold;
  }
}

.nrdb-ui-gauge-title {
position: absolute;
top: 80%;
display: block;
text-align: center;
font-weight: bold;
font-size: 1rem;
padding-bottom: 4px;
font-size: min(1rem,max(2cqmin,0.8rem));
display: -webkit-box;
-webkit-box-orient: vertical;
overflow: hidden;
-webkit-line-clamp: 1;
}
</style>
