<template>
    <div>
        <canvas ref="chart" :class="className" />
        <div v-if="radialChart && !hasData" class="nrdb-ui-chart-placeholder">No Data</div>
    </div>
</template>

<script>
import { Chart } from 'chart.js/auto' // eslint-disable-line n/file-extension-in-import
import 'chartjs-adapter-luxon'

import { shallowRef } from 'vue'
import { mapState } from 'vuex'

export default {
    name: 'DBUIChart',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            chart: null,
            hasData: false
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        radialChart () {
            // radial charts have no placeholder in ChartJS - we need to add one
            return this.props.xAxisType === 'radial'
        }
    },
    watch: {
        'props.label': function (value) {
            this.chart.options.plugins.title.text = value
            this.chart.update()
        },
        'props.chartType': function (value) {
            this.chart.config.type = value
            this.chart.update()
        },
        'props.xAxisType': function (value) {
            this.chart.options.scales.x.type = value
            this.chart.update()
        },
        'props.xAxisFormatType': function (value) {
            this.chart.options.scales.x.time.displayFormats = this.getXDisplayFormats(value)
            this.chart.update()
        }
    },
    created () {
        // can't do this in setup as we have custom onInput function
        this.$dataTracker(this.id, this.onMsgInput, this.onLoad)
    },
    mounted () {
        // get a reference to the canvas element
        const el = this.$refs.chart

        // generate parsing options (https://www.chartjs.org/docs/latest/general/data-structures.html#object-using-custom-properties)
        const parsing = {}
        if (this.props.xAxisType !== 'radial') {
            if (this.props.xAxisProperty && this.props.xAxisPropertyType === 'property') {
                parsing.xAxisKey = this.props.xAxisProperty
            }

            if (this.props.categoryType !== 'json' && this.props.yAxisProperty) {
                parsing.yAxisKey = this.props.yAxisProperty
            }
        } else {
            // radial axes - treat "y" as the radial axis
            parsing.key = this.props.yAxisProperty || 'y'
        }

        // do we need the "stacked" property?
        let stacked = false
        if (this.props.stackSeries === true && this.props.chartType === 'bar') {
            stacked = true
        }

        // color options for text and grid
        let textColor = Chart.defaults.color
        let gridColor = Chart.defaults.borderColor

        if (this.props?.textColor) {
            if (this.props.textColorDefault !== undefined) {
                if (this.props.textColorDefault === false) {
                    textColor = this.props.textColor[0]
                }
            }
        }
        if (this.props?.gridColor) {
            if (this.props.gridColorDefault !== undefined) {
                if (this.props.gridColorDefault === false) {
                    gridColor = this.props.gridColor[0]
                }
            }
        }

        // y-axis limits
        const yOptions = {
            title: {
                display: !!this.props.yAxisLabel,
                text: this.props.yAxisLabel,
                color: textColor
            },
            ticks: {
                color: textColor
            },
            grid: {
                color: gridColor
            },
            border: {
                color: gridColor
            },
            stacked
        }
        if (Object.hasOwn(this.props, 'ymin') && this.props.ymin !== '') {
            yOptions.min = parseFloat(this.props.ymin)
        }
        if (Object.hasOwn(this.props, 'ymax') && this.props.ymax !== '') {
            yOptions.max = parseFloat(this.props.ymax)
        }

        const scales = {}
        if (this.props.xAxisType !== 'radial') {
            scales.x = {
                type: this.props.xAxisType || 'linear',
                title: {
                    display: !!this.props.xAxisLabel,
                    text: this.props.xAxisLabel,
                    color: textColor
                },
                time: {
                    displayFormats: this.getXDisplayFormats(this.props.xAxisFormatType)
                },
                ticks: {
                    color: textColor
                },
                grid: {
                    color: gridColor
                },
                border: {
                    color: gridColor
                },
                stacked
            }
            scales.y = yOptions
        }
        // Do we show the legend?
        let showLegend = this.props.showLegend
        if (this.props.categoryType === 'none') {
            // no category, so no legend
            showLegend = false
        }

        // create our ChartJS object
        const config = {
            type: this.props.chartType,
            data: {
                labels: [],
                datasets: []
            },
            options: {
                animation: false,
                maintainAspectRatio: false,
                borderJoinStyle: 'round',
                scales,
                plugins: {
                    title: {
                        display: true,
                        text: this.props.label,
                        color: textColor
                    },
                    legend: {
                        display: showLegend,
                        labels: {
                            color: textColor
                        }
                    }
                },
                parsing
            }
        }
        const chart = new Chart(el, config)

        // don't want chart to be reactive, so we can use shallowRef
        this.chart = shallowRef(chart)
    },
    methods: {
        // given an object, return the value of the category property (which can be nested)
        getLabel (value, category) {
            if (this.props.categoryType !== 'property') {
                return category
            }
            // get nested property value
            if (category) {
                const props = category.split('.')
                props.forEach((prop) => {
                    if (value) {
                        value = value[prop]
                    }
                })
            }
            return value
        },
        onLoad (history) {
            if (history && history.length > 0) {
                // we have received a history of data points
                // we need to add them to the chart
                // clear the chart first, onload is considered to provide all data into a chart
                this.clear()
                // adding is then just the same process as receiving a new msg
                this.onMsgInput(history)
            }
        },
        onMsgInput (msg) {
            if (Array.isArray(msg.payload) && !msg.payload.length) {
                // clear the chart if msg.payload = [] is received
                this.clear()
            } else {
                if (msg.action === 'replace' || (this.props.action === 'replace' && msg.action !== 'append')) {
                    // clear the chart
                    this.clear()
                }
                // update the chart
                this.add(msg)
            }
        },
        getXDisplayFormats (xAxisFormatType) {
            const xDisplayFormats = {}
            if (xAxisFormatType === 'auto' || !xAxisFormatType || xAxisFormatType === '') {
                // If automatic format or no format (backwards compatibility for older nodes)
                xDisplayFormats.millisecond = 'HH:mm:ss'
            } else if (xAxisFormatType === 'custom') {
                // For the custom format, the entered format is stored by the typedInput in its value field
                xDisplayFormats.millisecond = this.props.xAxisFormat
                xDisplayFormats.second = this.props.xAxisFormat
                xDisplayFormats.minute = this.props.xAxisFormat
                xDisplayFormats.hour = this.props.xAxisFormat
                xDisplayFormats.day = this.props.xAxisFormat
                xDisplayFormats.week = this.props.xAxisFormat
                xDisplayFormats.month = this.props.xAxisFormat
                xDisplayFormats.quarter = this.props.xAxisFormat
                xDisplayFormats.year = this.props.xAxisFormat
            } else {
                // For all other formats, the format is stored by the typedInput in the type field
                xDisplayFormats.millisecond = xAxisFormatType
                xDisplayFormats.second = xAxisFormatType
                xDisplayFormats.minute = xAxisFormatType
                xDisplayFormats.hour = xAxisFormatType
                xDisplayFormats.day = xAxisFormatType
                xDisplayFormats.week = xAxisFormatType
                xDisplayFormats.month = xAxisFormatType
                xDisplayFormats.quarter = xAxisFormatType
                xDisplayFormats.year = xAxisFormatType
            }
            return xDisplayFormats
        },
        clear () {
            this.chart.data.labels = []
            this.chart.data.datasets = []
            this.chart.update()
            this.hasData = false
        },
        add (msg) {
            const payload = msg.payload
            // determine what type of msg we have
            if (Array.isArray(msg) && msg.length > 0) {
                // we have received an array of messages (loading from stored history)
                msg.forEach((m, i) => {
                    const p = m.payload
                    const d = m._datapoint // server-side we compute a chart friendly format
                    const label = d.category
                    this.addPoints(p, d, label)
                })
            } else if (Array.isArray(payload) && msg.payload.length > 0) {
                // we have received a message with an array of data points
                // and should append each of them
                payload.forEach((p, i) => {
                    const d = msg._datapoint ? msg._datapoint[i] : null // server-side we compute a chart friendly format where required
                    const label = d.category
                    this.addPoints(p, d, label)
                })
            } else if (payload !== null && payload !== undefined) {
                // we have a single payload value and should append it to the chart
                const d = msg._datapoint // server-side we compute a chart friendly format
                const label = d.category
                this.addPoints(msg.payload, d, label)
            } else {
                // no payload
                console.log('have no payload')
            }
            if (this.props.chartType === 'line' || this.props.chartType === 'scatter') {
                this.limitDataSize()
            }
            this.chart.update()
        },
        addPoints (payload, datapoint, label) {
            const d = {
                ...datapoint,
                ...payload
            }

            if (Array.isArray(label) && label.length > 0) {
                // we have an array of series, meaning we plot multiple data points per data object
                for (let i = 0; i < label.length; i++) {
                    const dd = {
                        ...d
                    }
                    dd.category = d.category[i]
                    dd.y = d.y[i]
                    this.addPoint(payload, dd, label[i])
                }
            } else {
                this.addPoint(payload, datapoint, label)
            }
        },
        addPoint (payload, datapoint, label) {
            const d = {
                ...datapoint,
                ...payload
            }
            this.addToChart(d, label)

            // APPEND our latest data point to the store
            this.$store.commit('data/append', {
                widgetId: this.id,
                msg: {
                    payload,
                    _datapoint: datapoint,
                    series: label
                }
            })
        },
        /**
         * Function to handle adding a datapoint (generated NR-side) to Line Charts
         * @param {*} datapoint
         */
        addToChart (datapoint, label) {
            // record we've added data
            this.hasData = true

            const xLabels = this.chart.data.labels // the x-axis categories
            const sLabels = this.chart.data.datasets.map((d) => d.label) // the data series labels

            // make sure we have the relevant (x-axis) labels added to the chart too
            if (!xLabels.includes(datapoint.x) && (this.props.xAxisType === 'category' || this.props.xAxisType === 'radial')) {
                xLabels.push(datapoint.x)
            }

            const sIndex = sLabels?.indexOf(label)
            // are we adding a new datapoint to an existing x-value
            const xIndex = xLabels.indexOf(datapoint.x)

            // the chart is empty, we're adding a new series
            if (sIndex === -1) {
                // if we have no series, then can color each bar/x a different value, or if it's a radial chart
                const colorByIndex = (this.props.categoryType === 'none' && this.props.chartType === 'bar') || this.props.xAxisType === 'radial'
                const radius = this.props.pointRadius ? this.props.pointRadius : 4

                const data = Array(xLabels.length).fill({}) // initialize the data array
                data[xIndex] = datapoint

                // add the new dataset to the chart
                const d = {
                    backgroundColor: colorByIndex ? this.props.colors : this.props.colors[sLabels.length % this.props.colors.length],
                    pointStyle: this.props.pointShape === 'false' ? false : this.props.pointShape || 'circle',
                    pointRadius: radius,
                    pointHoverRadius: radius * 1.25,
                    label,
                    data
                }

                if (!colorByIndex) {
                    d.borderColor = this.props.colors[sLabels.length]
                }

                this.chart.data.datasets.push(d)
            } else {
                // Update existing series
                if (xIndex >= 0) {
                    // yes, so we need to update the data at this index
                    this.chart.data.datasets[sIndex].data[xIndex] = datapoint
                } else {
                    this.chart.data.datasets[sIndex].data.push(datapoint)
                }
                // ensure we have no "empty" entries in our arrays
                for (let i = 0; i < this.chart.data.datasets[sIndex].data.length; i++) {
                    if (typeof this.chart.data.datasets[sIndex].data[i] === 'undefined') {
                        // assign a value so that ChartJS doesn't fall over
                        this.chart.data.datasets[sIndex].data[i] = {}
                    }
                }
            }
        },
        limitDataSize () {
            let cutoff = null
            let points = null
            if (this.props.xAxisType === 'time' && this.props.removeOlder && this.props.removeOlderUnit) {
                const removeOlder = parseFloat(this.props.removeOlder)
                const removeOlderUnit = parseFloat(this.props.removeOlderUnit)
                const ago = (removeOlder * removeOlderUnit) * 1000 // milliseconds ago
                cutoff = (new Date()).getTime() - ago
            }

            if (this.props.removeOlderPoints) {
                // remove older points
                points = parseInt(this.props.removeOlderPoints)
            }

            // apply data limitations to the chart
            if (points && this.chart.data.datasets.length > 0) {
                for (let i = 0; i < this.chart.data.datasets.length; i++) {
                    const length = this.chart.data.datasets[i].data.length
                    this.chart.data.datasets[i].data = this.chart.data.datasets[i].data.filter((d, i) => {
                        if (cutoff && d.x < cutoff) {
                            return false
                        } else if (i < length - points) {
                            return false
                        }
                        return true
                    })
                }
            }

            // apply data limtations to the vuex store
            this.$store.commit('data/restrict', {
                widgetId: this.id,
                min: cutoff,
                points
            })
        }
    }
}
</script>

<style scoped>
.nrdb-ui-chart-placeholder {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    width: 100%;
    height: 100%;
    color: rgba(var(--v-theme-on-group-background), var(--v-disabled-opacity));
    --pie-slice-1: rgba(var(--v-theme-on-group-background), 0.05);
    --pie-slice-2: rgba(var(--v-theme-on-group-background), 0.1);
    background: radial-gradient(circle closest-side, rgb(var(--v-theme-group-background)) 50%, transparent 0),
        radial-gradient(circle closest-side, transparent 66%, rgb(var(--v-theme-group-background)) 0),
        conic-gradient(var(--pie-slice-1) 0, var(--pie-slice-1) 38%, var(--pie-slice-2) 0, var(--pie-slice-2) 61%);
}
</style>
