<template>
    <div class="nrdb-ui-chart-container">
        <div ref="chart" :class="className" class="nrdb-ui-chart" />
        <div v-if="radialChart && !hasData" class="nrdb-ui-chart-placeholder">No Data</div>
    </div>
</template>

<script>
import * as echarts from 'echarts'

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
            /** @type {echarts.ECharts} */
            chart: null,
            hasData: false,
            histogram: [], // populate later for bins per series
            chartUpdateDebounceTimeout: null,
            tooltipDataset: [],
            resizeObserver: null
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        chartType () {
            // eCharts supports histograms natively, but we still map for compatibility
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
            // radial charts (pie/doughnut) in eCharts
            return this.props.xAxisType === 'radial'
        },
        interpolation () {
            return this.props.interpolation
        }
    },
    watch: {
        chartType: function (value) {
            const option = this.chart.getOption()
            option.series.forEach(series => {
                series.type = this.getEChartsSeriesType()
            })
            this.chart.setOption(option)
            this.update(false)
        },
        'props.label': function (value) {
            const option = this.chart.getOption()
            option.title.text = value
            this.chart.setOption(option)
            this.update(false)
        },
        'props.chartType': function (value) {
            const option = this.chart.getOption()
            option.series.forEach(series => {
                series.type = this.getEChartsSeriesType()
            })
            this.chart.setOption(option)
            this.updateInteraction()
            this.update(false)
        },
        'props.xAxisType': function (value) {
            const option = this.chart.getOption()
            if (option.xAxis) {
                option.xAxis.type = this.getEChartsAxisType(value)
            }
            this.chart.setOption(option)
            this.update(false)
        },
        'props.xAxisFormatType': function (value) {
            // eCharts handles time formatting differently
            // This would need more complex implementation for time axes
            this.update(false)
        },
        interpolation (value) {
            this.setInterpolation(value)
            this.update(false)
        }
    },
    beforeUnmount () {
        // Cleanup resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
        }
        // Dispose of eCharts instance
        if (this.chart) {
            this.chart.dispose()
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
        // get a reference to the div element
        const el = this.$refs.chart

        // do we need the "stacked" property?
        let stacked = false
        if (this.props.stackSeries === true && this.chartType === 'bar') {
            stacked = true
        }

        // color options for text and grid
        let textColor = '#666'
        let gridColor = '#e0e0e0'

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

        // Do we show the legend?
        let showLegend = this.props.showLegend
        if (this.props.categoryType === 'none' || this.props.category === '') {
            // no category, so no legend
            showLegend = false
        }

        // create our eCharts object
        const chart = echarts.init(el)

        // Initialize with basic option structure
        const option = this.getEChartsOption(textColor, gridColor, showLegend, stacked)
        chart.setOption(option)

        // don't want chart to be reactive, so we can use shallowRef
        this.chart = shallowRef(chart)

        // Ensure chart resizes properly
        this.$nextTick(() => {
            chart.resize()
        })

        // Handle window resize
        const resizeObserver = new ResizeObserver(() => {
            chart.resize()
        })
        resizeObserver.observe(el)

        // Store resize observer for cleanup
        this.resizeObserver = resizeObserver

        // Add click event to log series data
        chart.on('click', () => {
            const option = this.chart.getOption()
            console.log('Chart series:', option.series)
        })
    },
    methods: {
        getEChartsOption (textColor, gridColor, showLegend, stacked) {
            const isRadial = this.props.xAxisType === 'radial'

            if (isRadial) {
                // Pie/Doughnut chart
                return {
                    title: {
                        text: this.props.label,
                        textStyle: {
                            color: textColor
                        }
                    },
                    tooltip: {
                        trigger: 'item'
                    },
                    legend: {
                        show: showLegend,
                        top: 40,
                        textStyle: {
                            color: textColor
                        }
                    },
                    series: [{
                        name: this.props.label,
                        type: 'pie',
                        radius: this.chartType === 'doughnut' ? ['40%', '70%'] : '70%',
                        data: []
                    }]
                }
            } else {
                // Regular charts (line, bar, scatter)
                const option = {
                    title: {
                        text: this.props.label,
                        textStyle: {
                            color: textColor,
                            fontSize: 14 // taken from ChartJS default
                        }
                    },
                    tooltip: {
                        trigger: (this.chartType === 'line' || this.chartType === 'bar') ? 'axis' : 'item'
                    },
                    grid: {
                        left: '3%',
                        right: '4%'
                    },
                    legend: {
                        show: showLegend,
                        top: 40,
                        textStyle: {
                            color: textColor
                        }
                    },
                    xAxis: {
                        type: this.getEChartsAxisType(this.xAxisType),
                        name: this.props.xAxisLabel,
                        nameLocation: 'middle', // label position
                        nameTextStyle: {
                            color: textColor   // label color
                        },
                        splitLine: {
                            lineStyle: {
                                color: gridColor
                            }
                        },
                        minorSplitLine: {
                            show: true,
                            lineStyle: {
                                color: gridColor
                            }
                        }
                    },
                    yAxis: {
                        type: 'value',
                        name: this.props.yAxisLabel,
                        nameLocation: 'middle', // label position
                        nameTextStyle: {
                            color: textColor
                        },
                        axisLine: {
                            show: true,
                        },
                        axisLabel: {
                            color: textColor
                        },
                        splitLine: {
                            lineStyle: {
                                color: gridColor
                            }
                        }
                    },
                    series: []
                }

                // Apply y-axis limits
                if (Object.hasOwn(this.props, 'ymin') && this.props.ymin !== '') {
                    option.yAxis.min = parseFloat(this.props.ymin)
                }
                if (Object.hasOwn(this.props, 'ymax') && this.props.ymax !== '') {
                    option.yAxis.max = parseFloat(this.props.ymax)
                }

                // Handle stacked bars
                if (stacked && this.chartType === 'bar') {
                    option.series.forEach(series => {
                        series.stack = 'total'
                    })
                }

                return option
            }
        },
        getEChartsAxisType (axisType) {
            switch (axisType) {
            case 'linear':
                return 'value'
            case 'time':
                return 'time'
            case 'category':
            case 'bins':
                return 'category'
            default:
                return 'category'
            }
        },
        updateInteraction () {
            // eCharts handles interaction through tooltip configuration
            const option = this.chart.getOption()
            switch (this.chartType) {
            case 'line':
                option.tooltip.trigger = 'axis'
                break
            case 'scatter':
                option.tooltip.trigger = 'item'
                break
            default:
                option.tooltip.trigger = 'item'
                break
            }
            this.chart.setOption(option)
        },
        update (immediate = true) {
            // for data adding, we want to update immediately
            // but in some cases, like updating multiple props, we want to debounce
            if (immediate) {
                if (this.chartUpdateDebounceTimeout) {
                    clearTimeout(this.chartUpdateDebounceTimeout)
                    this.chartUpdateDebounceTimeout = null
                }
                this.chart.setOption(this.chart.getOption(), true)
                return
            }
            if (this.chartUpdateDebounceTimeout) {
                return
            }
            this.chartUpdateDebounceTimeout = setTimeout(() => {
                try {
                    this.chart.setOption(this.chart.getOption(), true)
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
            const option = this.chart.getOption()
            if (this.props.xAxisType === 'radial') {
                option.series[0].data = []
            } else {
                option.series = []
                if (option.xAxis.type === 'category') {
                    option.xAxis.data = []
                }
            }
            this.histogram = []
            this.chart.setOption(option)
            this.hasData = false
        },
        /**
         * Add a message to the chart
         * @param {*} msg
         */
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
                if (Array.isArray(msg._datapoint)) {
                    // single message has multiple datapoints to render (e.g. when Series is set to JSON)
                    msg._datapoint.forEach((d) => {
                        const label = d.category
                        if (label !== null && label !== undefined) {
                            this.addPoints(msg.payload, d, label)
                        }
                    })
                } else {
                    const d = msg._datapoint // server-side we compute a chart friendly format
                    const label = d.category
                    if (label !== null && label !== undefined) {
                        this.addPoints(msg.payload, d, label)
                    }
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
        /**
         * Add points to the chart
         * @param {*} payload
         * @param {*} datapoint
         * @param {*} label
         */
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
            // merge the calculated (server-side) datapoint with the msg payload
            const d = {
                ...datapoint,
                ...payload
            }
            // add it to the chart
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
         * Function to handle adding a datapoint (generated NR-side) to eCharts
         * @param {*} datapoint
         */
        addToChart (datapoint, label) {
            // record we've added data
            this.hasData = true

            if (this.props.chartType === 'histogram') {
                this.addToHistogram(datapoint, label)
                return
            }

            const option = this.chart.getOption()

            if (this.props.xAxisType === 'radial') {
                // Handle pie/doughnut charts
                const existingData = option.series[0].data || []
                const existingIndex = existingData.findIndex(item => item.name === label)

                if (existingIndex >= 0) {
                    existingData[existingIndex].value = datapoint.y
                } else {
                    existingData.push({
                        name: label,
                        value: datapoint.y
                    })
                }
                option.series[0].data = existingData
            } else {
                // Handle regular charts (line, bar, scatter)
                const sLabels = option.series.map(s => s.name)
                let sIndex = sLabels.indexOf(label)

                // Handle category axis data
                if (option.xAxis.type === 'category') {
                    option.xAxis.data = option.xAxis.data || []
                    if (!option.xAxis.data.includes(datapoint.x)) {
                        option.xAxis.data.push(datapoint.x)
                    }
                }

                // Create new series if it doesn't exist
                if (sIndex === -1) {
                    const colorIndex = option.series.length
                    const series = {
                        name: label,
                        type: this.getEChartsSeriesType(),
                        stack: this.props.stackSeries ? 'total' : null,
                        data: [],
                        itemStyle: {
                            color: this.props.colors[colorIndex % this.props.colors.length]
                        }
                    }

                    if (this.chartType === 'line') {
                        series.symbolSize = this.props.pointRadius || 4
                        series.symbol = this.getEChartsSymbol()
                    }

                    option.series.push(series)
                    sIndex = option.series.length - 1
                }

                // Add data point
                if (option.xAxis.type === 'category') {
                    const xIndex = option.xAxis.data.indexOf(datapoint.x)
                    option.series[sIndex].data[xIndex] = datapoint.y
                } else {
                    option.series[sIndex].data.push([datapoint.x, datapoint.y])
                }
            }

            this.chart.setOption(option)

            console.log(this.chart)

            if (this.chartType === 'line') {
                this.setInterpolation(this.interpolation)
            }
        },
        getEChartsSeriesType () {
            switch (this.chartType) {
            case 'line':
                return 'line'
            case 'bar':
            case 'histogram':
                return 'bar'
            case 'scatter':
                return 'scatter'
            default:
                return 'line'
            }
        },
        getEChartsSymbol () {
            if (this.props.pointShape === 'false') {
                return 'none'
            }
            switch (this.props.pointShape) {
            case 'circle':
                return 'circle'
            case 'rect':
            case 'rectangle':
                return 'rect'
            case 'triangle':
                return 'triangle'
            case 'diamond':
                return 'diamond'
            default:
                return 'circle'
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
            const option = this.chart.getOption()
            const sLabels = option.series.map(s => s.name)
            const seriesLabel = datapoint.category
            const sIndex = sLabels.indexOf(seriesLabel)

            let bins = []

            if (this.props.xAxisType === 'category') {
                // make sure we have the relevant (x-axis) labels added to the chart
                option.xAxis.data = option.xAxis.data || []
                if (!option.xAxis.data.includes(datapoint.x)) {
                    option.xAxis.data.push(datapoint.x)
                }
            }

            let series = null
            if (sIndex === -1) {
                series = {
                    name: seriesLabel,
                    type: 'bar',
                    data: [],
                    itemStyle: {
                        color: this.props.colors[sLabels.length % this.props.colors.length]
                    }
                }
                if (this.props.xAxisType === 'bins') {
                    this.histogram.push({
                        bins: this.calculateBins()
                    })
                } else {
                    // we will have one "bin" per category
                    this.histogram.push({
                        bins: option.xAxis.data.map((label, index) => ({
                            label,
                            count: 0
                        }))
                    })
                }
                bins = this.histogram[this.histogram.length - 1].bins
                option.series.push(series)
            } else {
                series = option.series[sIndex]
                bins = this.histogram[sIndex].bins
            }

            const binIndex = this.getBinIndex(bins, datapoint)
            if (this.props.xAxisType === 'category' && !bins[binIndex]) {
                bins[binIndex] = {
                    label: datapoint.x,
                    count: 0
                }
            }
            bins[binIndex].count++

            // update series data
            const values = bins.map((b) => b.count)
            series.data = values

            this.chart.setOption(option)
        },
        setInterpolation (interpolationType) {
            // eCharts interpolation mapping
            const option = this.chart.getOption()
            const getEChartsSmooth = (type) => {
                switch (type) {
                case 'cubic':
                case 'cubicMono':
                case 'bezier':
                    return true
                case 'linear':
                    return false
                case 'step':
                    return false // eCharts uses step: true for stepped lines
                default:
                    return false
                }
            }

            const smooth = getEChartsSmooth(interpolationType)
            const step = interpolationType === 'step'

            option.series.forEach(series => {
                if (series.type === 'line') {
                    series.smooth = smooth
                    if (step) {
                        series.step = 'end'
                    } else {
                        delete series.step
                    }
                }
            })

            this.chart.setOption(option)
        }
    }
}
</script>

<style scoped>
.nrdb-ui-chart-container {
    position: relative;
    width: 100%;
}

.nrdb-ui-chart {
    width: 100%;
    height: 100%;
}

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
