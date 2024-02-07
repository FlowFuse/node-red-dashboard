<template>
    <svg ref="gauge" :style="{height: gaugeHeight}">
        <defs>
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
        </defs>

        <g id="sections" />
        <g id="backdrop" />
        <g id="arc" />
        <g id="needle-container">
            <rect id="needle-mask" />
            <g id="needle" />
        </g>
        <g id="limits">
            <text ref="limits-min">{{ props.min }}</text>
            <text ref="limits-max" style="text-anchor: end">{{ props.max }}</text>
        </g>
    </svg>
    <div ref="value" class="nrdb-ui-gauge-value" :class="'nrdb-ui-' + props.gtype">
        <span>{{ value || props.min }}</span>
        <label>{{ props.units }}</label>
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
                angle: 0
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
        // had an odd SVG sizing issue, better to draw nextTick
        this.$nextTick(() => {
            console.log('mounted')
            this.draw()
            if (this.value === undefined) {
                this.update(this.props.min)
            } else {
                this.update(this.value)
            }
        })
    },
    methods: {
        draw () {
            // data
            const segments = this.props.segments

            // sizings
            this.resize()

            const gaugeR = this.r - this.sizes.gap - this.sizes.keyThickness

            this.svg = d3.select(this.$refs.gauge)

            let transform = ''

            if (this.props.gtype === 'gauge-half') {
                transform = `translate(${this.width / 2}, ${this.height})`
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
            backdrop.append('path')
                .attr('d', this.arcs.backdrop)
                .attr('transform', transform)
                .style('fill', '#e3e3e3')

            // draw needle
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
            needle.append('circle')
                .attr('r', needleR)
                .attr('transform', () => {
                    const y = -this.r + needleL
                    return `translate(${this.r}, ${y})`
                })
            needle.append('polygon')
                .attr('points', () => {
                    const x = this.r
                    const y = -this.r + needleL
                    return `${x + needleR},${y} ${x - needleR},${y} ${x},${-this.r}`
                })
            // set needle position to default
            this.svg.select('#needle-container')
                .style('transform', () => {
                    const rad = (this.valueToAngle(this.props.min) + (Math.PI / 2) - (this.sizes.angle / 2))
                    const deg = rad * (180 / Math.PI) - 90
                    return `rotate(${deg}deg)`
                })

            // add arc
            const arc = this.svg.select('#arc')
            arc.append('path')
                .attr('transform', transform)

            this.lastAngle = -this.sizes.angle / 2

            const sections = this.svg.select('#sections')
            this.updateSegmentArc()

            sections
                .selectAll('path')
                .data(segments)
                .enter()
                .append('path')
                .attr('d', this.arcs.sections)
                .attr('transform', transform)
                .style('fill', (d) => d.color)
        },
        resize () {
            this.width = this.$refs.gauge.clientWidth
            this.height = this.$refs.gauge.clientHeight

            const minDimension = Math.min(this.width, this.height)

            this.r = this.props.gtype === 'gauge-half' ? minDimension : minDimension / 2
        },
        update (value) {
            const vue = this

            const gaugeR = this.r - this.sizes.gap - this.sizes.keyThickness

            // update backdrop
            this.arcs.backdrop
                .startAngle(-this.sizes.angle / 2)
                .endAngle(this.sizes.angle / 2)
                .cornerRadius(() => {
                    return this.props.gstyle === 'rounded' ? this.sizes.gaugeThickness : 0
                })

            this.svg.select('#backdrop').select('path')
                .attr('d', this.arcs.backdrop)

            // update the gauge
            const arc = this.svg.select('#arc')

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
                .transition().duration(1000)
                .attrTween('d', arcTween)
                .style('fill', this.valueToColor(value))

            // update sections
            const segments = this.props.segments
            this.svg.select('#sections')
                .selectAll('path')
                .data(segments)
                .enter()
                .append('path')

            this.updateSegmentArc()
            this.svg.select('#sections')
                .selectAll('path')
                .data(segments)
                .enter()
                .append('path')

            this.svg.select('#sections').selectAll('path')
                .attr('d', this.arcs.sections)
                // .attr('transform', transform)
                .style('fill', (d) => d.color)

            // update needle
            this.svg.select('#needle-container')
                .style('transform-origin', () => {
                    return this.sizes.angle > Math.PI ? 'center center' : 'center bottom'
                })
                .transition().duration(1000)
                .styleTween('transform', () => {
                    // default transition travels the wrong way if gauage is over 180deg
                    // shortcutting the gauge, so we build our own transition route
                    const start = this.lastAngle
                    const end = this.valueToNeedleAngle(value)
                    function tween (t) {
                        const transform = d3.interpolate(start, end)(t)
                        const deg = transform * (180 / Math.PI)
                        return `rotate(${deg}deg)`
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

.nrdb-ui-gauge-34 {
    top: 0%;
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

.nrdb-ui-gauge #limits {
    opacity: 0.5;
}

.nrdb-ui-gauge #needle-container {
    pointer-events: none;
}

.nrdb-ui-gauge #needle-mask {
    opacity: 0;
}
</style>
