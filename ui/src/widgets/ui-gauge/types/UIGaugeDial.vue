<template>
    <div ref="container" class="nrdb-ui-gauge-dial" style="display: flex;flex-direction: column;" :class="`nrdb-ui-gauge-size-${size}${iconOnly ? ' nrdb-ui-gauge-icon-only' : ''}`">
        <label v-if="props.title" ref="title" class="nrdb-ui-gauge-title">{{ props.title }}</label>
        <svg ref="gauge" width="0" height="100%">
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
        <div ref="value" class="nrdb-ui-gauge-value" :class="`nrdb-ui-${props.gtype}`">
            <span>{{ props.prefix }}{{ value ?? props.min }}{{ props.suffix }}</span>
            <label v-if="props.icon || props.units"><v-icon v-if="props.icon" :icon="`mdi-${icon}`" />{{ props.units }}</label>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex' // eslint-disable-line import/order

import * as d3 from 'd3' // eslint-disable-line import/order

export default {
    name: 'DBUIGaugeDial',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            svg: null,
            lastAngle: 0,
            r: 0, // radius
            sizes: {
                titleHeight: 0,
                gaugeThickness: this.props.sizeThickness,
                gap: this.props.sizeGap,
                keyThickness: this.props.sizeKeyThickness,
                angle: 0,
                fudge: -6 // padding for half-gauages within the SVG canvas, otherwise needle overhangs
            },
            arcs: {
                backdrop: null,
                sections: null,
                gauge: null
            },
            size: 'default'
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        value: function () {
            return this.messages[this.id]?.payload
        },
        icon () {
            return this.props.icon?.replace(/^mdi-/, '')
        },
        segments () {
            const segments = this.props.segments
            return segments.sort((a, b) => {
                return (a, b) => a.from - b.from
            })
        },
        iconOnly () {
            return this.props.icon && !this.props.units
        },
        gaugeStyle () {
            return this.props.gstyle
        },
        gaugeType () {
            return this.props.gtype
        },
        min () {
            return this.props.min
        },
        max () {
            return this.props.max
        }
    },
    watch: {
        value: function (val) {
            this.update(val)
        }
    },
    mounted () {
        // on resize handler for window resizing
        window.addEventListener('resize', this.onResize)

        // had an odd SVG sizing issue, better to draw nextTick
        this.$nextTick(() => {
            // initial SVG size setting
            this.resize()
            if (this.value === undefined) {
                this.update(this.min, 0)
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
            this.sizes.titleHeight = this.$refs.title ? this.$refs.title.clientHeight : 0

            this.width = this.$refs.container.clientWidth
            this.height = this.props.height ? this.$refs.container.clientHeight - this.sizes.titleHeight : (this.props.gtype === 'gauge-half' ? 150 : 300)

            // heights for the SVG
            const w = this.width
            const h = this.height

            this.$refs.gauge.setAttribute('width', w)

            if (this.props.gtype === 'gauge-half') {
                const minDimension = Math.min(w / 2, h)
                this.r = minDimension + this.sizes.fudge
            } else {
                const minDimension = Math.min(w, h)
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
                    return this.gaugeStyle === 'rounded' ? this.sizes.gaugeThickness : 0
                })

            const backdrop = this.svg.select('#backdrop')
                .attr('transform', transform)

            backdrop.select('path')
                .attr('d', this.arcs.backdrop)

            this.svg.select('#backdrop').select('path')
                .attr('d', this.arcs.backdrop)

            this.svg.select('#limits')
                .attr('transform', transform)

            // get backdrop sizing and place values labelling accordingly
            const bdBbox = this.svg.select('#backdrop').node().getBBox()
            d3.select(this.$refs.value)
                .style('transform', () => {
                    const x = (this.width - bdBbox.width) / 2
                    let y
                    if (this.props.gtype === 'gauge-half') {
                        y = this.height + this.sizes.titleHeight - bdBbox.height
                    } else {
                        y = (this.height + this.sizes.titleHeight - bdBbox.height) / 2
                    }
                    return `translate(${x}px, ${y}px)`
                })
                .style('width', bdBbox.width + 'px')
                .style('height', bdBbox.height + 'px')

            // update the gauge
            const arc = this.svg.select('#arc')
                .attr('transform', transform)

            const gaugeArc = d3.arc()
                .innerRadius(gaugeR - this.sizes.gaugeThickness)
                .outerRadius(gaugeR)
                .startAngle(-this.sizes.angle / 2)
                .cornerRadius(() => {
                    return this.gaugeStyle === 'rounded' ? this.sizes.gaugeThickness : 0
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
                    endAngle: this.valueToAngle(value || 0) + (-this.sizes.angle / 2)
                })
                // .attr('filter', 'url(#innershadow)')
                .transition().duration(duration)
                .attrTween('d', arcTween)
                .style('fill', this.valueToColor(value))

            // update sections
            this.updateSegmentArc()

            const svgPaths = this.svg.select('#sections').selectAll('path')
            const pathNodes = svgPaths._groups[0]
            const segments = this.segments

            // check there are more paths than segments
            if (pathNodes.length !== 0 && pathNodes.length > segments.length) {
                this.svg.select('#sections')
                    .selectAll('path')
                    .data(segments)
                    .enter()
                    .append('path')
                    // remove any extra paths
                    .filter((_d, i) => {
                        return i > segments.length - 1
                    })
                    .remove()
            } else {
                this.svg.select('#sections')
                    .selectAll('path')
                    .data(segments)
                    .enter()
                    .append('path')
            }

            this.svg.select('#sections').selectAll('path')
                .attr('d', this.arcs.sections)
                .attr('transform', transform)
                .style('fill', (d) => d?.color)

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
                    return this.gaugeStyle === 'needle' ? 1 : 0
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
                this.resizeText()
                this.positionMinMaxLabels()
            })
        },
        // in radians
        valueToAngle (value) {
            const angle = this.sizes.angle
            // ensure this does not go over the max or under the min
            const clampedValue = Math.min(Math.max(value, this.min), this.max)
            return angle * (clampedValue - this.min) / (this.max - this.min)
        },
        // in radians
        valueToNeedleAngle (value) {
            const rad = (this.valueToAngle(value) + (Math.PI / 2) - (this.sizes.angle / 2))
            return rad - Math.PI / 2
        },
        valueToColor (value) {
            // loop over ordered segments and find the segment this value lives inside
            let color = ''
            this.segments.forEach((s) => {
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

            let minX = bbox.x + thickness + paddingX
            let maxX = bbox.x + bbox.width - thickness - paddingX

            const valueContainerWidth = this.$refs.value?.clientWidth
            if (valueContainerWidth < 80) {
                minX = minX - 16
                maxX = maxX + 16
            }
            if (valueContainerWidth === 0) {
                minX = minX - 32
                maxX = maxX + 32
            }

            min.style.transform = `translate(${minX}px, ${y}px)`
            max.style.transform = `translate(${maxX}px, ${y}px)`
        },
        resizeText () {
            // work out how much space we have within which to render the value/icon
            const width = this.$refs.value?.clientWidth
            this.size = 'default'
            if (width < 80) {
                this.size = 'xxs'
            } else if (width < 150) {
                this.size = 'xs'
            } else if (width < 225) {
                this.size = 'sm'
            } else if (width < 300) {
                this.size = 'md'
            } else {
                this.size = 'lg'
            }
        },
        updateSegmentArc () {
            const segments = this.segments
            const minValue = this.min
            const maxValue = this.max
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
                        const to = Math.min(Math.max(segments[i + 1].from, minValue), maxValue)
                        const from = Math.min(Math.max(d.from, minValue), maxValue)
                        const segmentSize = to - from
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
                    this.update(this.min, 0)
                } else {
                    this.update(this.value, 0)
                }
            })
        }
    }
}
</script>

<style lang="scss">
.nrdb-ui-gauge {
    position: relative;
}
.nrdb-ui-gauge svg {
    flex-grow: 1;
    max-width: 100%;
    position: relative;
}

.nrdb-ui-gauge-title {
    display: block;
    text-align: center;
    font-weight: bold;
    font-size: 1rem;
    padding-bottom: 4px;
}

/* general styling od the payload & units */
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
    padding-top: 12px;
    container-type: size;
}

.nrdb-ui-gauge-value span {
    font-weight: bold;
}

.nrdb-ui-gauge-value label {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* path styling */
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
    container-type: size;
    text {
        font-size: min(1rem,max(2cqmin,0.8rem));
    }
}

/* needle styling */

.nrdb-ui-gauge #needle-container {
    pointer-events: none;
}

.nrdb-ui-gauge #needle-mask {
    opacity: 0;
}

.nrdb-ui-gauge #needle circle,
.nrdb-ui-gauge #needle polygon {
    fill: rgb(var(--v-theme-on-group-background));
}

/* payload value font */
.nrdb-ui-gauge-value span {
    font-size: 2rem;
    line-height: 2.25rem;
}
/* units font */
.nrdb-ui-gauge-value label {
    font-size: 0.75rem;
    line-height: 0.825rem;
    gap: 4px;
}
.nrdb-ui-gauge-icon-only i {
    font-size: 1.75em;
}

/* Size Overrides */

/* xxs */
/* hide gauge textual contents as they are not visible to naked eye in this grid size */
.nrdb-ui-gauge-size-xxs .nrdb-ui-gauge-value,
.nrdb-ui-gauge-size-xxs #limits {
    visibility: hidden;
}

/* xs */
.nrdb-ui-gauge-size-xs .nrdb-ui-gauge-value span {
    font-size: min(1.5rem,max(2cqmin,0.8rem));
    line-height: min(1.5rem,max(2cqmin,1rem));
}
.nrdb-ui-gauge-size-xs .nrdb-ui-gauge-value {
    font-size: min(.75rem,max(2cqmin,.5rem));
    line-height: min(.825rem,max(2cqmin,.65rem));
}

/* sm */
.nrdb-ui-gauge-size-sm .nrdb-ui-gauge-value span {
    font-size: 2rem;
    line-height: 2.25rem;
}

/* md */
.nrdb-ui-gauge-size-md .nrdb-ui-gauge-value span {
    font-size: 2.5rem;
    line-height: 3rem;
}
.nrdb-ui-gauge-size-md .nrdb-ui-gauge-value label {
    font-size: 1rem;
    line-height: 1.25rem;
}

/* lg */
.nrdb-ui-gauge-size-lg .nrdb-ui-gauge-value span {
    font-size: 3rem;
    line-height: 3.25rem;
}
</style>
