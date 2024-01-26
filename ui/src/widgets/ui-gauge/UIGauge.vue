<template>
    Gauge Goes Here
    <svg ref="gauge">
        <g id="sections" />
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
            angle: 180,
            sizes: {
                width: 100,
                height: 100,
                r: 100
            }
        }
    },
    computed: {
        ...mapState('data', ['messages'])
    },
    mounted () {
        this.draw()
    },
    methods: {
        draw () {
            this.resize()
            const r = this.r
            const sectionPadding = 4
            const sectionThickness = 8

            const gaugeR = r - sectionPadding - sectionThickness

            console.log(this.$refs.gauge)
            this.svg = d3.select(this.$refs.gauge)

            const angleRads = this.angle * Math.PI / 180
            let transform = ''
            if (this.angle <= 180) {
                transform = `translate(${this.width / 2},${this.height})`
            } else {
                transform = `translate(${this.width / 2},${this.height / 2})`
            }

            const gaugeArc = d3.arc()
                .innerRadius(gaugeR / 2)
                .outerRadius(gaugeR)
                .startAngle(-angleRads / 2)
                .endAngle(angleRads / 2)

            const arc = this.svg.select('#arc')

            arc.append('path')
                .attr('d', gaugeArc)
                .attr('transform', transform)

            const sectionsArc = d3.arc()
                .innerRadius(r - sectionThickness)
                .outerRadius(r)
                .startAngle(-Math.PI / 2)
                .endAngle(Math.PI / 2)

            const sections = this.svg.select('#sections')

            sections.append('path')
                .attr('d', sectionsArc)
                .attr('transform', transform)
        },
        resize () {
            this.width = this.$refs.gauge.parentElement.clientWidth
            this.height = this.$refs.gauge.parentElement.clientHeight

            const minDimension = Math.min(this.width, this.height)

            if (this.angle <= 180) {
                this.r = minDimension
            } else {
                // be smarter here for 75% arcs, etc.
                this.r = minDimension / 2
            }
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
