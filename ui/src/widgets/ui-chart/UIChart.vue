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

import chartJStoECharts from './helpers/chartJsToECharts.js'
import * as pieCharts from './helpers/pie.helper'

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
            histogram: {
                labels: [], // populate later for x-values
                bins: [] // populate later for bins per series
            },
            chartUpdateDebounceTimeout: null,
            tooltipDataset: [],
            resizeObserver: null
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        hasTitle () {
            return this.props.label !== ''
        },
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
                series.type = chartJStoECharts.seriesType(this.chartType)
            })
            this.chart.setOption(option)
        },
        'props.label': function (value) {
            const options = this.chart.getOption()
            options.title[0].text = value
            this.chart.setOption(options)
        },
        'props.chartType': function (value) {
            const option = this.chart.getOption()
            option.series.forEach(series => {
                series.type = chartJStoECharts.seriesType(this.chartType)
            })
            this.chart.setOption(option)
            this.updateInteraction()
        },
        'props.xAxisLabel': function (value) {
            const options = this.chart.getOption()
            options.xAxis[0].name = value
            this.chart.setOption(options)
        },
        'props.xAxisType': function (value) {
            const option = this.chart.getOption()
            if (option.xAxis) {
                option.xAxis[0].type = chartJStoECharts.axisType(value)
            }
            this.chart.setOption(option)
        },
        'props.xAxisFormatType': function (value) {
            // eCharts handles time formatting differently
            // This would need more complex implementation for time axes
            this.update(false)
        },
        'props.yAxisLabel': function (value) {
            const options = this.chart.getOption()
            options.yAxis[0].name = value
            this.chart.setOption(options)
        },
        'props.stackSeries': function (value) {
            const options = this.chart.getOption()
            options.series.forEach(series => {
                series.stack = value ? 'total' : null
            })
            this.chart.setOption(options)
        },
        interpolation (value) {
            const options = this.chart.getOption()
            options.series.forEach(series => {
                chartJStoECharts.setSmooth(series, value)
            })
            this.chart.setOption(options)
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
        // Setup custom onMsgInput Handler & onLoad Handler
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

        // create our eCharts object
        const chart = echarts.init(el)

        // Initialize with basic option structure
        const options = this.generateChartOptions()
        chart.setOption(options)

        // don't want chart to be reactive, so we can use shallowRef
        this.chart = shallowRef(chart)

        // Ensure chart resizes properly on first load
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
    },
    methods: {
        generateChartOptions () {
            const isRadial = this.props.xAxisType === 'radial'

            // Common Properties
            let showLegend = this.props.showLegend
            if (this.props.categoryType === 'none' || this.props.category === '') {
                // no category, so no legend
                showLegend = false
            }

            // Color Options
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

            // Generate the options config
            if (isRadial) {
                // Pie/Doughnut chart
                const options = {
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
                        top: this.hasTitle ? 40 : 0,
                        textStyle: {
                            color: textColor
                        }
                    },
                    color: this.props.colors,
                    series: []
                }
                return options
            } else {
                // Regular charts (line, bar, scatter)
                const options = {
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
                        right: '4%',
                        bottom: '0%',
                        top: this.hasTitle ? (this.props.showLegend ? 70 : 40) : (this.props.showLegend ? 30 : 0)
                    },
                    legend: {
                        show: showLegend,
                        top: this.hasTitle ? 40 : 0,
                        textStyle: {
                            color: textColor
                        }
                    },
                    color: this.props.colors,
                    xAxis: {
                        type: chartJStoECharts.axisType(this.xAxisType),
                        name: this.props.xAxisLabel,
                        nameLocation: 'middle', // label position
                        nameTextStyle: {
                            color: textColor // label color
                        },
                        splitLine: {
                            show: true,
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
                        min: 'dataMin',
                        axisLine: {
                            show: true
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
                    series: [],
                    animationDuration: 300, // minimal animation on inital data load
                    animationDurationUpdate: 150 // minimal animation on data update
                }

                // Apply y-axis limits
                if (Object.hasOwn(this.props, 'ymin') && this.props.ymin !== '') {
                    options.yAxis.min = parseFloat(this.props.ymin)
                } else if (!this.hasData) {
                    // Default y-min when no data is present
                    options.yAxis.min = 0
                }
                if (Object.hasOwn(this.props, 'ymax') && this.props.ymax !== '') {
                    options.yAxis.max = parseFloat(this.props.ymax)
                } else if (!this.hasData) {
                    // Default y-max when no data is present
                    options.yAxis.max = 1
                }

                return options
            }
        },
        updateInteraction () {
            // eCharts handles interaction through tooltip configuration
            const options = this.chart.getOption()
            switch (this.chartType) {
            case 'line':
                options.tooltip.trigger = 'axis'
                break
            case 'scatter':
                options.tooltip.trigger = 'item'
                break
            default:
                options.tooltip.trigger = 'item'
                break
            }
            this.chart.setOption(options)
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
                this.clearChart()
                // adding is then just the same process as receiving a new msg
                this.onMsgInput(history)
            }
        },
        onMsgInput (msg) {
            if (Array.isArray(msg.payload) && !msg.payload.length) {
                // clear the chart if msg.payload = [] is received
                this.clearChart()
            } else {
                if (msg.action === 'replace' || (this.props.action === 'replace' && msg.action !== 'append')) {
                    // clear the chart
                    this.clearChart()
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
        clearChart () {
            const option = this.chart.getOption()
            if (this.props.xAxisType === 'radial') {
                option.series.forEach(s => {
                    s.data = []
                })
            } else {
                option.series = []
                if (option.xAxis.type === 'category') {
                    // clear the x-axis labels
                    option.xAxis.data = []
                }
            }
            this.histogram = {
                labels: [],
                bins: []
            }
            this.chart.setOption(option, true)
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
            const options = this.chart.getOption()

            if (this.props.chartType === 'histogram') {
                this.updateYAxisLimits(options)
                this.addToHistogram(datapoint, options)
                return
            }

            if (this.props.xAxisType === 'radial') {
                // label defines which pie layer to update
                const sLabels = options.series.map(s => s.name)
                let sIndex = sLabels.indexOf(label)

                let series = null

                if (sIndex === -1) {
                    series = {
                        name: label,
                        type: 'pie',
                        radius: this.chartType === 'doughnut' ? ['40%', '100%'] : '100%',
                        data: [],
                        top: this.hasTitle ? 40 : 0, // account for the title
                        itemStyle: {
                            borderWidth: 2,
                            borderColor: '#fff'
                        }
                    }
                    if (this.props.showLegend) {
                        series.top = this.hasTitle ? 70 : 30 // accounts for the legend and the title
                    }
                    sIndex = options.series.length
                    options.series.push(series)
                } else {
                    series = options.series[sIndex]
                }
                // datapoint.x defines which slice of the pie to update
                const name = datapoint.x
                // Handle pie/doughnut charts
                const existingData = series.data || []
                const existingIndex = existingData.findIndex(item => item.name === name)

                if (existingIndex >= 0) {
                    existingData[existingIndex].value = datapoint.y
                } else {
                    existingData.push({
                        name,
                        value: datapoint.y
                    })
                }
                options.series[sIndex].data = existingData

                // update the radius for each series depending on the number of series
                options.series.forEach((s, i) => {
                    s.radius = pieCharts.getRadius(this.props.chartType, i, options.series.length)
                    // only show the label on the outer series
                    if (i !== options.series.length - 1) {
                        // don't show the label on the inner series as they overlap with the outer series
                        s.label = {
                            show: false
                        }
                        s.emphasis = {
                            label: {
                                show: false
                            }
                        }
                    } else {
                        // make sure we're updating in case we have a new series, and now there is a new outer series
                        s.label = {
                            show: true
                        }
                        s.emphasis = {
                            label: {
                                show: true
                            }
                        }
                    }
                })
            } else {
                // Handle regular charts (line, bar, scatter)
                const sLabels = options.series.map(s => s.name)
                let sIndex = sLabels.indexOf(label)

                // Create new series if it doesn't exist
                if (sIndex === -1) {
                    const series = {
                        name: label,
                        type: chartJStoECharts.seriesType(this.chartType),
                        stack: this.props.stackSeries ? 'total' : null,
                        data: []
                    }

                    if (this.chartType === 'line') {
                        series.symbolSize = this.props.pointRadius || 4
                        series.symbol = chartJStoECharts.symbol(this.props.pointShape)
                        chartJStoECharts.setSmooth(series, this.interpolation)
                    }

                    options.series.push(series)
                    sIndex = options.series.length - 1
                }

                // Add data point
                if (this.props.xAxisType === 'category') {
                    // for categories, we need to update the existing data point for this x-value
                    const xIndex = options.series[sIndex].data.findIndex(d => d[0] === datapoint.x)
                    if (xIndex !== -1) {
                        options.series[sIndex].data[xIndex] = [datapoint.x, datapoint.y]
                    } else {
                        options.series[sIndex].data.push([datapoint.x, datapoint.y])
                    }
                } else {
                    // for other axes, we can just add the data point
                    options.series[sIndex].data.push([datapoint.x, datapoint.y])
                }
            }

            // Remove default y-axis limits when data is added
            this.updateYAxisLimits(options)

            this.chart.setOption(options)
        },
        updateYAxisLimits (options) {
            if (this.hasData && this.props.xAxisType !== 'radial') {
                if (!Object.hasOwn(this.props, 'ymin') || this.props.ymin === '' || typeof this.props.ymin === 'undefined') {
                    options.yAxis[0].min = null
                }
                if (!Object.hasOwn(this.props, 'ymax') || this.props.ymax === '' || typeof this.props.ymax === 'undefined') {
                    options.yAxis[0].max = null
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
            // get options
            const options = this.chart.getOption()
            const series = options.series
            if ((cutoff || points) && series.length > 0) {
                // loop over each series
                for (let i = 0; i < series.length; i++) {
                    const length = series[i].data.length // check how much data there is in this series
                    series[i].data = series[i].data.filter((d, i) => {
                        if (cutoff && d.x < cutoff) {
                            return false
                        } else if (points && (i < length - points)) {
                            return false
                        }
                        return true
                    })
                }
            }
            // update the chart
            this.chart.setOption(options)

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
            this.histogram.labels = bins.map(b => b.label)
            return bins
        },
        /**
         * Given the bins, datapoint and series index, return the x-index of the bin
         */
        getBinIndex (bins, datapoint) {
            if (this.props.xAxisType === 'bins') {
                const binSize = Math.floor((this.props.xmax - this.props.xmin) / this.props.bins)
                return Math.min(Math.floor((datapoint.x - this.props.xmin) / binSize), bins.length - 1)
            } else {
                const xIndex = this.histogram.labels.indexOf(datapoint.x)
                return xIndex
            }
        },
        addToHistogram (datapoint, options) {
            // handle multi-series in the histogram
            const sLabels = options.series.map(s => s.name)
            const seriesLabel = datapoint.category
            const sIndex = sLabels.indexOf(seriesLabel)

            let bins = []

            if (this.props.xAxisType === 'category') {
                if (this.histogram.labels.indexOf(datapoint.x) === -1) {
                    this.histogram.labels.push(datapoint.x)
                }
            }

            let series = null
            if (sIndex === -1) {
                series = {
                    name: seriesLabel,
                    type: 'bar',
                    stack: this.props.stackSeries ? 'total' : null,
                    data: []
                }
                if (this.props.xAxisType === 'bins') {
                    this.histogram.bins.push(this.calculateBins())
                } else {
                    // we will have one "bin" per category
                    this.histogram.bins.push(this.histogram.labels.map(label => ({
                        label,
                        count: 0
                    })))
                }
                bins = this.histogram.bins[this.histogram.bins.length - 1] // get newly calculated bins
                options.series.push(series)
            } else {
                series = options.series[sIndex]
                bins = this.histogram.bins[sIndex]
            }

            const binIndex = this.getBinIndex(bins, datapoint, sIndex)
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

            // make sure we have the relevant (x-axis) labels added to the chart
            options.xAxis[0].data = this.histogram.labels

            this.chart.setOption(options)
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
