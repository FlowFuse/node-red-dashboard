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
            /** @type {Chart} */
            chart: null,
            hasData: false,
            histogram: [], // populate later for bins per series
            chartUpdateDebounceTimeout: null,
            tooltipDataset: []
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        chartType () {
            // ChartJS doesn't support Histograms, so we render it as a bar chart,
            // but maintain the ref to our own config
            if (this.props.chartType === 'histogram') {
                return 'bar'
            }
            return this.props.chartType
        },
        xAxisType () {
            // we use this to decide on some custom calculations of the categories in Histograms,
            // but ChartJS needs the 'category; type for the axis still
            if (this.props.xAxisType === 'bins') {
                return 'category'
            }
            return this.props.xAxisType
        },
        radialChart () {
            // radial charts have no placeholder in ChartJS - we need to add one
            return this.props.xAxisType === 'radial'
        },
        interpolation () {
            return this.props.interpolation
        }
    },
    watch: {
        chartType: function (value) {
            this.chart.config.type = value
            this.update(false)
        },
        'props.label': function (value) {
            this.chart.options.plugins.title.text = value
            this.update(false)
        },
        'props.chartType': function (value) {
            this.chart.config.type = value
            this.updateInteraction()
            this.update(false)
        },
        'props.xAxisType': function (value) {
            this.chart.options.scales.x.type = value
            this.update(false)
        },
        'props.xAxisFormatType': function (value) {
            this.chart.options.scales.x.time.displayFormats = this.getXDisplayFormats(value)
            this.update(false)
        },
        interpolation (value) {
            this.setInterpolation(value)
            this.update(false)
        }
    },
    created () {
        // can't do this in setup as we have custom onInput function
        this.$dataTracker(this.id, this.onMsgInput, this.onLoad)
    },
    mounted () {
        if (window.Cypress) {
            // when testing, we expose the chart object to the window object
            // so we can do an end-to-end test and ensure the right data is applied
            window.uiCharts = window.uiCharts || {}
            window.uiCharts[this.id] = this
        }
        // get a reference to the canvas element
        const el = this.$refs.chart

        // generate parsing options (https://www.chartjs.org/docs/latest/general/data-structures.html#object-using-custom-properties)
        const parsing = {}
        if (this.props.xAxisType !== 'radial') {
            if (this.props.xAxisProperty && this.props.xAxisPropertyType === 'property') {
                parsing.xAxisKey = this.props.xAxisProperty
            }

            if (this.props.categoryType !== 'json' && this.props.yAxisProperty && this.props.yAxisPropertyType === 'property') {
                parsing.yAxisKey = this.props.yAxisProperty
            }
        } else {
            // radial axes - treat "y" as the radial axis
            parsing.key = this.props.yAxisProperty || 'y'
        }

        // do we need the "stacked" property?
        let stacked = false
        if (this.props.stackSeries === true && this.chartType === 'bar') {
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
                type: this.xAxisType || 'linear',
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
            type: this.chartType,
            data: {
                labels: [],
                datasets: []
            },
            options: {
                animation: false,
                maintainAspectRatio: false,
                borderJoinStyle: 'round',
                interaction: {},
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
                    },
                    tooltip: {
                        itemSort: (a, b) => {
                            if (this.props.chartType === 'histogram') {
                                return b.parsed.y - a.parsed.y
                            }
                            return true
                        },
                        filter: (tooltipItem, tooltipIndex) => {
                            if (this.props.chartType === 'histogram' || (this.props.chartType === 'bar' && this.props.stackSeries)) {
                                // don't show tooltips for empty data points
                                return tooltipItem.parsed.y !== undefined && tooltipItem.parsed.y > 0
                            } else if (this.props.chartType === 'line') {
                                if (tooltipIndex === 0) {
                                    // first element in the loop
                                    this.tooltipDataset = []
                                }
                                if (this.tooltipDataset.indexOf(tooltipItem.datasetIndex) === -1) {
                                    this.tooltipDataset.push(tooltipItem.datasetIndex)
                                    return true
                                } else {
                                    return false
                                }
                            }
                            return true
                        }
                    }
                },
                parsing
            }
        }
        const chart = new Chart(el, config)

        // Useful for debugging: uncomment to expose the chart object to the window
        // window.uiChart = window.uiChart || {}
        // window.uiChart[this.id] = chart

        // don't want chart to be reactive, so we can use shallowRef
        this.chart = shallowRef(chart)

        // ensure the chart is updated with the correct interaction mode
        // based on the type of chart we are creating
        this.updateInteraction()
    },
    methods: {
        updateInteraction () {
            switch (this.chart.config.type) {
            case 'line':
                delete this.chart.options.interaction.axis
                this.chart.options.interaction.mode = 'x'
                break
            case 'scatter':
                this.chart.options.interaction.axis = 'x'
                this.chart.options.interaction.mode = 'nearest'
                break
            default:
                delete this.chart.options.interaction.axis
                this.chart.options.interaction.mode = 'index' // default
                break
            }
        },
        update (immediate = true) {
            // for data adding, we want to update immediately
            // but in some cases, like updating multiple props, we want to debounce
            if (immediate) {
                if (this.chartUpdateDebounceTimeout) {
                    clearTimeout(this.chartUpdateDebounceTimeout)
                    this.chartUpdateDebounceTimeout = null
                }
                this.chart.update()
                return
            }
            if (this.chartUpdateDebounceTimeout) {
                return
            }
            this.chartUpdateDebounceTimeout = setTimeout(() => {
                try {
                    this.chart.update()
                } finally {
                    this.chartUpdateDebounceTimeout = null
                }
            }, 30)
        },
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
            this.histogram = []
            this.update()
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
                    if (label !== null && label !== undefined) {
                        this.addPoints(p, d, label)
                    }
                })
            } else if (Array.isArray(payload) && msg.payload.length > 0) {
                // we have received a message with an array of data points
                // and should append each of them
                payload.forEach((p, i) => {
                    const d = msg._datapoint ? msg._datapoint[i] : null // server-side we compute a chart friendly format where required
                    const label = d.category
                    if (label !== null && label !== undefined) {
                        this.addPoints(p, d, label)
                    }
                })
            } else if (payload !== null && payload !== undefined) {
                // we have a single payload value and should append it to the chart
                const d = msg._datapoint // server-side we compute a chart friendly format
                const label = d.category
                if (label !== null && label !== undefined) {
                    this.addPoints(msg.payload, d, label)
                }
            } else {
                // no payload
                console.log('have no payload')
            }
            if (this.chartType === 'line' || this.chartType === 'scatter') {
                this.limitDataSize()
            }
            this.update()
        },
        addPoints (payload, datapoint, label) {
            const d = { ...datapoint, ...payload }
            if (!this.chart.config?.options?.parsing?.xAxisKey) {
                d.x = datapoint.x // if there is no mapping key, ensure server side computed datapoint.x is used
            }
            if (!this.chart.config?.options?.parsing?.yAxisKey) {
                d.y = datapoint.y // if there is no mapping key, ensure server side computed datapoint.y is used
            }

            if (Array.isArray(label) && label.length > 0) {
                // we have an array of series, meaning we plot multiple data points per data object
                for (let i = 0; i < label.length; i++) {
                    const dd = {
                        ...d
                    }
                    dd.category = d.category[i]
                    dd.y = d.y[i]
                    this.addToChart(dd, label[i])
                    this.commit(payload, dd, label[i])
                }
            } else {
                this.addToChart(d, label)
                this.commit(payload, datapoint, label)
            }
        },
        addPoint (payload, datapoint, label) {
            const d = {
                ...datapoint,
                ...payload
            }
            this.addToChart(d, label)
        },
        commit (payload, datapoint, label) {
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

            if (this.props.chartType === 'histogram') {
                this.addToHistogram(datapoint, label)
                return
            }

            const xLabels = this.chart.data.labels // the x-axis categories
            const sLabels = this.chart.data.datasets.map((d) => d.label) // the data series labels

            // make sure we have the relevant (x-axis) labels added to the chart too
            if (!xLabels.includes(datapoint.x) && (this.props.xAxisType === 'category' || this.props.xAxisType === 'radial')) {
                xLabels.push(datapoint.x)
            }

            const sIndex = sLabels?.indexOf(label)
            // are we adding a new datapoint to an existing x-value
            const xIndex = xLabels.indexOf(datapoint.x)

            // this series doesn't exist yet in our chart
            if (sIndex === -1) {
                // if we have no series, then can color each bar/x a different value, or if it's a radial chart
                const colorByIndex = (this.props.categoryType === 'none' && this.chartType === 'bar') || this.props.xAxisType === 'radial'
                const radius = this.props.pointRadius ? this.props.pointRadius : 4

                // ensure we have a datapoint for each of the known x-value
                // ChartsJS doesn't like undefined data points
                const data = Array(xLabels.length).fill({})
                if (xIndex === -1) {
                    // Add data to the end of the array
                    data.push(datapoint)
                } else {
                    // we've got a new series, but a previously seen x-value
                    data[xIndex] = datapoint
                }
                // add the new dataset/series to the chart
                const series = {
                    backgroundColor: colorByIndex ? this.props.colors : this.props.colors[sLabels.length % this.props.colors.length],
                    pointStyle: this.props.pointShape === 'false' ? false : this.props.pointShape || 'circle',
                    pointRadius: radius,
                    pointHoverRadius: radius * 1.25,
                    label,
                    data
                }

                if (!colorByIndex) {
                    series.borderColor = this.props.colors[sLabels.length]
                }

                this.chart.data.datasets.push(series)
            } else {
                // have we seen this x-value before?
                if (xIndex >= 0 && (this.props.xAxisType === 'category' || this.props.xAxisType === 'radial')) {
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
            if (this.chartType === 'line') {
                this.setInterpolation(this.interpolation)
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
            if ((cutoff || points) && this.chart.data.datasets.length > 0) {
                for (let i = 0; i < this.chart.data.datasets.length; i++) {
                    const length = this.chart.data.datasets[i].data.length
                    this.chart.data.datasets[i].data = this.chart.data.datasets[i].data.filter((d, i) => {
                        if (cutoff && d.x < cutoff) {
                            return false
                        } else if (points && (i < length - points)) {
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
        },
        calculateBins () {
            if (this.props.chartType !== 'histogram') {
                return []
            }
            // given the x-min, x-max and number of bins (bins), calculate the bins
            const bins = []

            if (this.props.xAxisType === 'bins') {
                const minX = this.props.xmin || 0
                const maxX = this.props.xmax || 100
                const numBins = this.props.bins || 10
                const binSize = (maxX - minX) / numBins
                for (let i = 0; i < numBins; i++) {
                    const min = minX + (i * binSize)
                    const max = minX + ((i + 1) * binSize)
                    bins.push({
                        label: `${min}-${max}`,
                        min,
                        max,
                        count: 0
                    })
                }
            }
            return bins
        },
        getBinIndex (bins, datapoint) {
            if (this.props.xAxisType === 'bins') {
                const binSize = Math.floor((this.props.xmax - this.props.xmin) / this.props.bins)
                return Math.min(Math.floor((datapoint.x - this.props.xmin) / binSize), bins.length - 1)
            } else {
                // categorical
                return this.chart.data.labels.indexOf(datapoint.x)
            }
        },
        addToHistogram (datapoint, label) {
            // handle multi-series in the histogram
            const sLabels = this.chart.data.datasets.map((d) => d.label) // the existing data series labels
            const seriesLabel = datapoint.category
            const sIndex = sLabels.indexOf(seriesLabel)

            const binLabels = this.chart.data.labels // the x-axis categories

            let bins = []

            if (this.props.xAxisType === 'category') {
                // make sure we have the relevant (x-axis) labels added to the chart
                if (!binLabels.includes(datapoint.x)) {
                    binLabels.push(datapoint.x)
                }
            }
            let series = null
            if (sIndex === -1) {
                series = {
                    label: seriesLabel,
                    backgroundColor: this.props.colors[sLabels.length % this.props.colors.length]
                }
                if (this.props.xAxisType === 'bins') {
                    this.histogram.push({
                        bins: this.calculateBins()
                    })
                } else {
                    // we will have one "bin" per category
                    this.histogram.push({
                        bins: binLabels.map((label, index) => ({
                            label,
                            count: 0
                        }))
                    })
                }
                bins = this.histogram[this.histogram.length - 1].bins
            } else {
                series = this.chart.data.datasets[sIndex]
                // have we seen this x-value/bin before?
                bins = this.histogram[sIndex].bins
            }

            const binIndex = this.getBinIndex(bins, datapoint)
            if (this.props.xAxisType === 'category' && !bins[binIndex]) {
                // sometimes data comes in an awkward order,
                // so we aren't aware of all bins for categorical x-axis when creating older series
                bins[binIndex] = {
                    label: datapoint.x,
                    count: 0
                }
            }
            bins[binIndex].count++

            // define x-labels
            const labels = bins.map((b) => b.label)
            const values = bins.map((b) => b.count)

            this.chart.data.labels = labels
            series.data = values
            if (sIndex === -1) {
                this.chart.data.datasets.push(series)
            } else {
                this.chart.data.datasets[sIndex] = series
            }
        },
        setInterpolation (interpolationType) {
            // Updated chart configs for interpolation as per the new chart.js version
            // https://www.chartjs.org/docs/latest/samples/line/interpolation.html
            const getInterpolation = (type) => {
                switch (type) {
                case 'cubic': {
                    return {
                        cubicInterpolationMode: 'default',
                        tension: 0.4
                    }
                }
                case 'cubicMono': {
                    return {
                        cubicInterpolationMode: 'monotone',
                        tension: 0.4
                    }
                }
                case 'linear': {
                    return {
                        tension: 0
                    }
                }
                case 'bezier': {
                    return {
                        tension: 0.4
                    }
                }
                case 'step': {
                    return {
                        stepped: true
                    }
                }
                }
            }
            const interpolation = getInterpolation(interpolationType)
            this.chart.data.datasets = this.chart.data.datasets.map((d) => {
                return {
                    ...d,
                    ...interpolation
                }
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
