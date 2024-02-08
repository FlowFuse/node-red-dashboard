<template>
    <div style="display: flex;flex-direction: column; gap: 4px;">
        <label v-if="props.title" class="nrdb-ui-gauge-title">{{ props.title }}</label>
        <svg ref="gauge" :style="{'min-height': gaugeHeight}">
            <!-- <defs>
                <filter id="innershadow" x0="-50%" y0="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                    <feOffset dy="2" dx="3" />
                    <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />

                    <feFlood flood-color="#444444" flood-opacity="0.75" />
                    <feComposite in2="shadowDiff" operator="in" />
                    <feComposite in2="SourceGraphic" operator="over" result="firstfilter" />

                    <feGaussianBlur in="firstfilter" stdDeviation="3" result="blur2" />
                    <feOffset dy="-2" dx="-3" />
                    <feComposite in2="firstfilter" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />

                    <feFlood flood-color="#444444" flood-opacity="0.75" />
                    <feComposite in2="shadowDiff" operator="in" />
                    <feComposite in2="firstfilter" operator="over" />
                </filter>
            </defs> -->

            <g id="sections" />
            <g id="backdrop">
                <path /></g>
            <g id="arc">
                <path />
            </g>
            <g id="needle-container">
                <rect id="needle-mask" />
                <g id="needle">
                    <circle />
                    <polygon />
                </g>
            </g>
            <g id="limits">
                <text ref="limits-min">{{ props.min }}</text>
                <text ref="limits-max" style="text-anchor: end">{{ props.max }}</text>
            </g>
        </svg>
        <div ref="value" class="nrdb-ui-gauge-value" :class="'nrdb-ui-' + props.gtype">
            <span>{{ props.prefix }}{{ value || props.min }}{{ props.suffix }}</span>
            <label>{{ props.units }}</label>
        </div>
    </div>
</template>

<script>
import { useDataTracker } from '../data-tracker.mjs' // eslint-disable-line import/order
import { mapState } from 'vuex' // eslint-disable-line import/order

import * as d3 from 'd3' // eslint-disable-line import/order

export default {
    name: 'DBUIGauge',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    setup (props) {
        useDataTracker(props.id)
    },
    data () {
        return {
            svg: null,
            lastAngle: 0,
            sizes: {
                gaugeThickness: this.props.sizeThickness,
                gap: this.props.sizeGap,
                keyThickness: this.props.sizeKeyThickness,
                angle: 0,
                fudge: -6 // padding for half-gauages within the SVG canvas
            },
            arcs: {
                backdrop: null,
                sections: null,
                gauge: null
            }
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        value: function () {
            return this.messages[this.id]?.payload
        },
        gaugeHeight: function () {
            return this.props.gtype === 'gauge-half' ? '150px' : '300px'
        }
    },
    watch: {
        value: function (val, oldVal) {
            this.resize()
            this.update(val)
        }
    },
    mounted () {
        // on resize handler for window resizing
        window.addEventListener('resize', this.onResize)

        // had an odd SVG sizing issue, better to draw nextTick
        this.$nextTick(() => {
            this.resize()
            if (this.value === undefined) {
                this.update(this.props.min, 0)
            } else {
                this.update(this.value, 0)
            }
        })
    },
    unmounted () {
        window.removeEventListener('resize', this.onResize)
    },
    methods: {
        resize () {
            this.width = this.$refs.gauge.clientWidth
            this.height = this.$refs.gauge.clientHeight

            if (this.props.gtype === 'gauge-half') {
                const minDimension = Math.min(this.width / 2, this.height)
                this.r = minDimension + this.sizes.fudge
            } else {
                const minDimension = Math.min(this.width, this.height)
                this.r = minDimension / 2
            }
        },
        update (value, duration = 1000) {
            this.svg = d3.select(this.$refs.gauge)
            const vue = this

            const gaugeR = this.r - this.sizes.gap - this.sizes.keyThickness

            let transform = ''

            if (this.props.gtype === 'gauge-half') {
                transform = `translate(${this.width / 2}, ${this.height + this.sizes.fudge})`
                this.sizes.angle = Math.PI
            } else {
                transform = `translate(${this.width / 2}, ${this.height / 2})`
                this.sizes.angle = 0.7 * 2 * Math.PI
            }

            // draw backdrop
            this.arcs.backdrop = d3.arc()
                .innerRadius(gaugeR - this.sizes.gaugeThickness)
                .outerRadius(gaugeR)
                .startAngle(-this.sizes.angle / 2)
                .endAngle(this.sizes.angle / 2)
                .cornerRadius(() => {
                    return this.props.gstyle === 'rounded' ? this.sizes.gaugeThickness : 0
                })

            const backdrop = this.svg.select('#backdrop')
            backdrop.select('path')
                .attr('d', this.arcs.backdrop)
                .attr('transform', transform)

            this.svg.select('#backdrop').select('path')
                .attr('d', this.arcs.backdrop)

            // update the gauge
            const arc = this.svg.select('#arc')

            arc.select('path')
                .attr('transform', transform)

            const gaugeArc = d3.arc()
                .innerRadius(gaugeR - this.sizes.gaugeThickness)
                .outerRadius(gaugeR)
                .startAngle(-this.sizes.angle / 2)
                .cornerRadius(() => {
                    return this.props.gstyle === 'rounded' ? this.sizes.gaugeThickness : 0
                })

            const arcTween = function (to) {
                const from = {
                    endAngle: vue.lastAngle
                }
                const interpolate = d3.interpolate(from, to)
                return function (t) {
                    const newArc = interpolate(t)
                    vue.lastAngle = newArc.endAngle
                    return gaugeArc(interpolate(t))
                }
            }

            arc.select('path')
                .datum({
                    endAngle: this.valueToAngle(value) + (-this.sizes.angle / 2)
                })
                // .attr('filter', 'url(#innershadow)')
                .transition().duration(duration)
                .attrTween('d', arcTween)
                .style('fill', this.valueToColor(value))

            // update sections
            this.updateSegmentArc()

            const segments = this.props.segments
            this.svg.select('#sections')
                .selectAll('path')
                .data(segments)
                .enter()
                .append('path')

            this.svg.select('#sections')
                .selectAll('path')
                .data(segments)
                .enter()
                .append('path')

            this.svg.select('#sections').selectAll('path')
                .attr('d', this.arcs.sections)
                .attr('transform', transform)
                .style('fill', (d) => d.color)

            // update needle
            const needleMask = this.svg.select('#needle-mask')
            const needleR = 3
            const needleL = parseFloat(this.sizes.gaugeThickness) + parseFloat(this.sizes.gap) + parseFloat(this.sizes.keyThickness)

            needleMask
                .attr('width', this.r * 2)
                .attr('height', () => {
                    return this.sizes.angle > Math.PI ? this.r * 2 : this.r
                })
                .style('transform-box', 'fill-box')
                .style('transform-origin', () => {
                    return this.sizes.angle > Math.PI ? 'center center' : 'center bottom'
                })
                .style('transform', () => {
                    return `translate(${(this.width / 2) - this.r}px, ${0}px)`
                })

            const needle = this.svg.select('#needle')
                .style('opacity', () => {
                    return this.props.gstyle === 'needle' ? 1 : 0
                })
                .style('transform', () => {
                    const x = (this.width / 2) - this.r
                    const y = this.sizes.angle > Math.PI ? this.height / 2 : this.height
                    return `translate(${x}px, ${y}px)`
                })
            needle.select('circle')
                .attr('r', needleR)
                .attr('transform', () => {
                    const y = -this.r + needleL
                    return `translate(${this.r}, ${y})`
                })
            needle.select('polygon')
                .attr('points', () => {
                    const x = this.r
                    const y = -this.r + needleL
                    return `${x + needleR},${y} ${x - needleR},${y} ${x},${-this.r}`
                })

            // set needle position to default
            // this.svg.select('#needle-container')

            this.svg.select('#needle-container')
                .style('transform-origin', () => {
                    return this.sizes.angle > Math.PI ? 'center center' : 'center bottom'
                })
                .transition().duration(duration)
                .styleTween('transform', () => {
                    // default transition travels the wrong way if gauage is over 180deg
                    // shortcutting the gauge, so we build our own transition route
                    const start = this.lastAngle
                    const end = this.valueToNeedleAngle(value)
                    function tween (t) {
                        const rotate = d3.interpolate(start, end)(t)
                        const deg = rotate * (180 / Math.PI)
                        // -6 is fudge factor to ensure needle is visible and doesn't have half hanging out of SVG window
                        return `translate(0, ${vue.props.gtype === 'gauge-half' ? vue.sizes.fudge.toString() : '0'}px)rotate(${deg}deg)`
                    }
                    return tween
                })

            this.$nextTick(() => {
                this.positionMinMaxLabels()
            })
        },
        // in radians
        valueToAngle (value) {
            const angle = this.sizes.angle
            return angle * (value - this.props.min) / (this.props.max - this.props.min)
        },
        // in radians
        valueToNeedleAngle (value) {
            const rad = (this.valueToAngle(value) + (Math.PI / 2) - (this.sizes.angle / 2))
            return rad - Math.PI / 2
        },
        valueToColor (value) {
            // loop over ordered segments and find the segment this value lives inside
            const segments = this.props.segments
            let color = ''
            segments.forEach((s) => {
                if (value >= s.from) {
                    color = s.color
                }
            })
            return color
        },
        positionMinMaxLabels () {
            const min = this.$refs['limits-min']
            const max = this.$refs['limits-max']

            // get the backdrop bounding box
            const bbox = this.svg.select('#backdrop').node().getBBox()

            // position min in the botom-left
            const thickness = parseFloat(this.props.sizeThickness)
            const paddingX = this.props.gtype === 'gauge-half' ? 8 : 16
            const paddingY = this.props.gtype === 'gauge-half' ? 0 : 12

            const y = bbox.y + bbox.height + paddingY

            const minX = bbox.x + thickness + paddingX
            min.style.transform = `translate(${minX}px, ${y}px)`

            const maxX = bbox.x + bbox.width - thickness - paddingX
            max.style.transform = `translate(${maxX}px, ${y}px)`
        },
        updateSegmentArc () {
            const segments = this.props.segments
            const minValue = this.props.min
            const maxValue = this.props.max
            let cAngle = -this.sizes.angle / 2

            this.arcs.sections = d3.arc()
                .innerRadius(this.r - this.sizes.keyThickness)
                .outerRadius(this.r)
                .startAngle(() => {
                    return cAngle
                })
                .endAngle((d, i) => {
                    if (segments.length > i + 1) {
                        // go to next segment
                        const to = segments[i + 1].from
                        const segmentSize = to - d.from
                        const segmentAngle = this.sizes.angle * segmentSize / (maxValue - minValue)
                        cAngle += segmentAngle
                        return cAngle
                    } else {
                        // last segment, go to the end
                        return this.sizes.angle / 2
                    }
                })
        },
        onResize () {
            this.$nextTick(() => {
                this.resize()
                if (this.value === undefined) {
                    this.update(this.props.min, 0)
                } else {
                    this.update(this.value, 0)
                }
            })
        }
    }
}
</script>

<style>
.nrdb-ui-gauge {
    position: relative;
}
.nrdb-ui-gauge svg {
    width: 100%;
    height: 100%;
}

.nrdb-ui-gauge-title {
    display: block;
    text-align: center;
    font-weight: bold;
    font-size: 1rem;
}

.nrdb-ui-gauge-34 {
    top: 2%;
    gap: 4px;
}

.nrdb-ui-gauge-half {
    top: 25%;
}

.nrdb-ui-gauge-value {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-content: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    flex-wrap: wrap;
}

.nrdb-ui-gauge-value span {
    font-weight: bold;
    font-size: 2.5rem;
    line-height: 2.75rem;
}

.nrdb-ui-gauge-value label {
    font-size: 0.75rem;
    line-height: 0.825rem;
}

.nrdb-ui-gauge #backdrop path {
    fill: rgb(var(--v-theme-background));
}

.nrdb-ui-gauge #sections path {
    stroke: rgb(var(--v-theme-group-background));
    stroke-width: 2px;
}

.nrdb-ui-gauge #limits {
    opacity: 0.5;
    fill: rgb(var(--v-theme-on-group-background));
}

.nrdb-ui-gauge #needle-container {
    pointer-events: none;
}

/*
    Adds shaadow to the needle, went back and forth on whether looks better,
    leaving in case for future
*/
/* .nrdb-ui-gauge #needle {
    filter: drop-shadow(0px 0px 2px rgb(0 0 0 / 0.4));
} */

.nrdb-ui-gauge #needle-mask {
    opacity: 0;
}

.nrdb-ui-gauge #needle circle,
.nrdb-ui-gauge #needle polygon {
    fill: rgb(var(--v-theme-on-group-background));
}
</style>
