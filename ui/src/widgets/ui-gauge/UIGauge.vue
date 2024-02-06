<template>
    <svg ref="gauge">
        <g id="sections" />
        <g id="backdrop" />
        <g id="arc" />
        <g id="limits">
            <text ref="limits-min">{{ props.min }}</text>
            <text ref="limits-max" style="text-anchor: end">{{ props.max }}</text>
        </g>
    </svg>
    <div ref="value" class="nrdb-ui-gauge-text nrdb-ui-gauge-value">
        <span>{{ value }}</span>
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
                keyThickness: this.props.sizeKeyThickness
            }
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        value: function () {
            return this.messages[this.id]?.payload
        }
    },
    watch: {
        value: function (val, oldVal) {
            this.update(val)
        }
    },
    mounted () {
        // had an odd SVG sizing issue, better to draw nextTick
        this.$nextTick(() => {
            this.draw()
            this.update(5)
        })
    },
    methods: {
        draw () {
            // data
            const segments = this.props.segments
            const minValue = this.props.min
            const maxValue = this.props.max
            const angle = this.props.angle * Math.PI / 180 // convert to radians

            // sizings
            this.resize()
            const r = this.r

            const gaugeR = r - this.sizes.gap - this.sizes.keyThickness

            this.svg = d3.select(this.$refs.gauge)

            let transform = ''

            if (angle <= 180) {
                transform = `translate(${this.width / 2}, ${this.height})`
            } else {
                transform = `translate(${this.width / 2}, ${this.height / 2})`
            }

            // draw backdrop
            const backdropArc = d3.arc()
                .innerRadius(gaugeR - this.sizes.gaugeThickness)
                .outerRadius(gaugeR)
                .startAngle(-angle / 2)
                .endAngle(angle / 2)
                .cornerRadius(this.props.styleRounded ? this.sizes.gaugeThickness : 0)

            const backdrop = this.svg.select('#backdrop')
            backdrop.append('path')
                .attr('d', backdropArc)
                .attr('transform', transform)
                .style('fill', '#e3e3e3')

            this.$nextTick(() => {
                this.positionMinMaxLabels()
            })

            // add arc
            const arc = this.svg.select('#arc')
            arc.append('path')
                .attr('transform', transform)

            let cAngle = -angle / 2
            this.lastAngle = -angle / 2

            const sectionsArc = d3.arc()
                .innerRadius(r - this.sizes.keyThickness)
                .outerRadius(r)
                .startAngle(() => {
                    return cAngle
                })
                .endAngle((d, i) => {
                    if (segments.length > i + 1) {
                        // go to next segment
                        const to = segments[i + 1].from
                        const segmentSize = to - d.from
                        const segmentAngle = angle * segmentSize / (maxValue - minValue)
                        cAngle += segmentAngle
                        return cAngle
                    } else {
                        // last segment, go to the end
                        return angle / 2
                    }
                })

            const sections = this.svg.select('#sections')

            sections
                .selectAll('path')
                .data(segments)
                .enter()
                .append('path')
                .attr('d', sectionsArc)
                .attr('transform', transform)
                .style('fill', (d) => d.color)
        },
        resize () {
            this.width = this.$refs.gauge.clientWidth
            this.height = this.$refs.gauge.clientHeight

            const minDimension = Math.min(this.width, this.height)

            if (this.props.angle <= 180) {
                this.r = minDimension
            } else {
                // be smarter here for 75% arcs, etc.
                this.r = minDimension / 2
            }
        },
        update (value) {
            const vue = this

            const angle = this.props.angle * Math.PI / 180 // convert to radians
            const gaugeR = this.r - this.sizes.gap - this.sizes.keyThickness

            // update the gauge
            const arc = this.svg.select('#arc')

            const gaugeArc = d3.arc()
                .innerRadius(gaugeR - this.sizes.gaugeThickness)
                .outerRadius(gaugeR)
                .startAngle(-angle / 2)
                .cornerRadius(this.props.styleRounded ? this.sizes.gaugeThickness : 0)

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
                    endAngle: this.valueToAngle(value) + (-angle / 2)
                })
                .transition().duration(1000)
                .attrTween('d', arcTween)
                .style('fill', this.valueToColor(value))
        },
        valueToAngle (value) {
            const angle = this.props.angle * Math.PI / 180 // convert to radians
            return angle * (value - this.props.min) / (this.props.max - this.props.min)
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
            const padding = 8

            const minX = bbox.x + thickness + padding
            min.style.transform = `translate(${minX}px, ${bbox.y + bbox.height}px)`

            const maxX = bbox.x + bbox.width - thickness - padding
            max.style.transform = `translate(${maxX}px, ${bbox.y + bbox.height}px)`
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
.nrdb-ui-gauge-text {
    position: absolute;
    width: 100%;
    height: 100%;
}

.nrdb-ui-gauge-value {
    position: absolute;
    display: flex;
    align-content: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    flex-wrap: wrap;
    top: 25%;
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

.nrdb-ui-gauge-limits label {
    position: absolute;
    bottom: 0;
    opacity: 0.5;
}
</style>
