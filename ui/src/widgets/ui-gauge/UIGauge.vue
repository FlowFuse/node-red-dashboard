<template>
    Gauge Goes Here
    <svg ref="gauge">
        <g id="sections" />
        <g id="backdrop" />
        <g id="arc" />
        <g id="labels" /></svg>
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
                sectionPadding: 4,
                sectionThickness: 8,
                gaugeThickness: 16
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
        this.draw()
        this.update(5)
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

            const gaugeR = r - this.sizes.sectionPadding - this.sizes.sectionThickness

            console.log(this.$refs.gauge)
            this.svg = d3.select(this.$refs.gauge)

            let transform = ''
            if (angle <= 180) {
                transform = `translate(${this.width / 2},${this.height})`
            } else {
                transform = `translate(${this.width / 2},${this.height / 2})`
            }

            // draw backdrop
            const backdropArc = d3.arc()
                .innerRadius(gaugeR - this.sizes.gaugeThickness)
                .outerRadius(gaugeR)
                .startAngle(-angle / 2)
                .endAngle(angle / 2)
                .cornerRadius(this.sizes.gaugeThickness)

            const backdrop = this.svg.select('#backdrop')
            backdrop.append('path')
                .attr('d', backdropArc)
                .attr('transform', transform)
                .style('fill', '#e3e3e3')

            // add arc
            const arc = this.svg.select('#arc')
            arc.append('path')
                .attr('transform', transform)

            // draw segments
            console.log(segments)

            let cAngle = -angle / 2
            this.lastAngle = -angle / 2

            const sectionsArc = d3.arc()
                .innerRadius(r - this.sizes.sectionThickness)
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
            this.width = this.$refs.gauge.parentElement.clientWidth
            this.height = this.$refs.gauge.parentElement.clientHeight

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
            console.log('value', value)

            const angle = this.props.angle * Math.PI / 180 // convert to radians
            const gaugeR = this.r - this.sizes.sectionPadding - this.sizes.sectionThickness

            // update the gauge
            const arc = this.svg.select('#arc')

            const gaugeArc = d3.arc()
                .innerRadius(gaugeR - this.sizes.gaugeThickness)
                .outerRadius(gaugeR)
                .startAngle(-angle / 2)
                .cornerRadius(20)

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
        }
    }
}
</script>

<style scoped>
.nrdb-ui-gauge svg {
    width: 100%;
    height: 100%;
}
</style>
