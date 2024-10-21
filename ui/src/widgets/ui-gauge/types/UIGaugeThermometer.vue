<!-- eslint-disable vue/html-self-closing -->
<template>
    <div class="nrdb-ui-gauge-thermometer-wrapper" ref="container">
        <div id="thermometer-container" ref="thermometerContainer">
            <div id="thermometer" ref="thermometer">
                <div id="temperature" :class="`${value && 'tooltip'} tooltip-${tooltipPosition}`" :style="{ height: `${temperatureHeight}%` }" :data-value="temperatureValue"></div>
                <div id="range" :class="tooltipPosition">
                    <div v-if="max" id="max">{{ max }}</div>
                    <div v-if="min" id="min">{{ min }}</div>
                </div>
                <div id="graduations"></div>
            </div>
            <div id="mercury-bulb"></div>
        </div>
        <label v-if="props.label" ref="title" class="nrdb-ui-gauge-title">{{ props.label }}</label>
    </div>
</template>

<script>
import { mapState } from 'vuex' // eslint-disable-line import/order

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
        value: function () {
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
        clampedValue () {
            return Math.min(Math.max(this.value || this.min, this.min), this.max)
        },
        temperatureHeight () {
            return (this.clampedValue - this.min) / (this.max - this.min) * 100
        },
        temperatureValue () {
            return `${this.value}${this.units}`
        },
        tooltipPosition () {
            return this.props.tooltipPosition
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

$TM-borderSize: 4px;
$TM-borderColor: rgb(var(--v-theme-on-group-background));
$TM-width: 20px;
$TM-height: 115px;
$TM-bulbSize: $TM-width * 1.6;
$TM-radius: 20px;
$TM-graduationsStyle: 2px solid rgba(var(--v-theme-on-group-background), 0.5);
$TM-bulbColor: #3dcadf;
$TM-mercuryColor : linear-gradient(#f17a65, $TM-bulbColor) no-repeat bottom;

// Tooltip
$TM-tooltipColor: rgba(0, 0, 0, 0.7);
$TM-tooltipSize: 1em;
$TM-tooltipRadius: 5px;
$TM-tooltipTopShift: 5px;
$TM-tooltipVerticalPadding: 5px;
$TM-tooltipHorizontalPadding: $TM-tooltipVerticalPadding * 2;
$TM-tooltipLeftShift: 100%;
$TM-tooltipArrowWidth: 1.5; // Higher numbers produce smaller width
$TM-tooltipArrowHeight: 2.2; // Higher numbers produce smaller height

@mixin border() { border: $TM-borderSize solid $TM-borderColor; }
@mixin trianlge() {
  border-top: $TM-tooltipSize / $TM-tooltipArrowHeight solid transparent;
  border-bottom: $TM-tooltipSize / $TM-tooltipArrowHeight solid transparent;
  border-right: $TM-tooltipSize / $TM-tooltipArrowWidth solid $TM-tooltipColor;
}

// THERMOMETER ―――――――――――――――――――――――――

#thermometer-container {
  position: relative;
}

#thermometer {
  position: relative;
  width: $TM-width;
  height: $TM-height;
  border-left: $TM-borderSize solid $TM-borderColor;
  border-top: $TM-borderSize solid $TM-borderColor;
  border-right: $TM-borderSize solid $TM-borderColor;
  border-bottom: $TM-borderSize solid $TM-bulbColor;
  border-radius: $TM-radius $TM-radius 0 0;
  z-index: 1;
  background-color: #686868;
  #range {
    position: relative;
    &.right {
      right: 1.1rem;
      #min {
        bottom: 0;
        right: 0;
      }
      #max {
        top: 0;
        right: 0;
      }
    }
    &.left {
      left: 1.1rem;
      #min {
        bottom: 0;
        left: 0;
      }
      #max {
        top: 0;
        left: 0;
      }
    }
    height: 100%;
    #min, #max {
      position: absolute;
      font-size: 0.8em;
      color: rgb(var(--v-theme-on-group-background)) !important;
      font-weight: bold;
    }
  }
  #graduations {
    height: 59%;
    top: 20%;
    width: 50%;

    &, &:before {
      position: absolute;
      border-top: $TM-graduationsStyle;
      border-bottom: $TM-graduationsStyle;
    }

    &:before {
      content: "";
      height: 34%;
      width: 100%;
      top: 32%;
    }
  }

  #temperature {
    bottom: 0;
    background: $TM-mercuryColor;
    width: 100%;
    border-radius: $TM-radius $TM-radius 0 0;
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
        top: calc(1em - 28px);
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
#mercury-bulb {
  position: absolute;
  content: "";
  border-radius: 50%;
  transform: translateX(-50%);
  width: $TM-bulbSize;
  height: $TM-bulbSize;
  background-color: $TM-bulbColor;
  top: calc(100% - 9px);
  @include border;
  z-index: -3;
  left: 50%;
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
