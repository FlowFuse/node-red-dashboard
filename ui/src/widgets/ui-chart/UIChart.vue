<template>
    <canvas ref="chart" :class="className" />
</template>

<script>
import { Chart } from 'chart.js/auto' // eslint-disable-line import/no-named-as-default, import/order, n/file-extension-in-import
import 'chartjs-adapter-luxon'

import { useDataTracker } from '../data-tracker.js' // eslint-disable-line import/order

import { shallowRef } from 'vue'
import { mapState } from 'vuex'

export default {
    name: 'DBUIChart',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            chart: null
        }
    },
    computed: {
        ...mapState('data', ['messages'])
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
        }
    },
    created () {
        // can't do this in setup as we have custom onInput function
        useDataTracker(this.id, this.onMsgInput)
    },
    mounted () {
        // get a reference to the canvas element
        const el = this.$refs.chart

        // create our ChartJS object
        const chart = new Chart(el, {
            type: this.props.chartType,
            data: {
                labels: [],
                datasets: []
            },
            options: {
                animation: false,
                maintainAspectRatio: false,
                borderJoinStyle: 'round',
                scales: {
                    x: {
                        type: this.props.xAxisType || 'linear',
                        time: {
                            displayFormats: {
                                millisecond: 'HH:mm:ss'
                            }
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: this.props.label
                    },
                    legend: {
                        display: false
                    }
                }
            }
        })

        // don't want chart to be reactive, so we can use shallowRef
        this.chart = shallowRef(chart)
    },
    methods: {
        onMsgInput (msg) {
            // TODO:
            // what do we do with the msg object when chart receives it?
            // need some storage into vuex store, but what else, and in what format?
            if (Array.isArray(msg.payload) && !msg.payload.length) {
                // clear the chart
                this.clear()
            } else {
                // update the chart
                this.add(msg)
            }
        },
        clear () {
            this.chart.data.labels = []
            this.chart.data.datasets = []
            this.chart.update()
        },
        add (msg) {
            const payload = msg.payload
            // determine what type of msg we have
            if (payload !== null && payload !== undefined) {
                // we have a single payload value and should append it to the chart
                const label = msg.topic
                this.addPoint(msg, label)
            } else if (Array.isArray(msg) && msg.length > 0) {
                // need to filter by number here, before we split the data sets out

                // we have an array of msg values, and should append each of them
                msg.forEach((m) => {
                    const label = m.topic
                    this.addPoint(m, label)
                })
            } else {
                // no payload
                console.log('have no payload')
            }
            if (this.props.chartType === 'line' || this.props.chartType === 'scatter') {
                this.limitDataSize()
            }
            this.chart.update()
        },
        addPoint (msg, label) {
            const p = msg.payload
            if (this.props.chartType === 'line' || this.props.chartType === 'scatter') {
                const datapoint = msg._datapoint || {}
                this.addToLine(datapoint, label)
            } else if (this.props.chartType === 'bar') {
                this.addToBar(p, label)
            }

            // TODO: Handle storage of restricted data size, need to manage in store, so pass props through?

            // APPEND our latest data point to the store
            this.$store.commit('data/append', {
                widgetId: this.id,
                msg
            })
        },
        /**
         * Function to handle adding a datapoint (generated NR-side) to Line Charts
         * @param {*} datapoint
         */
        addToLine (datapoint, label) {
            // consider msg.topic (label) as the label for the series
            const datalabels = [...new Set(this.chart.data.datasets?.map((set) => {
                return set.label
            }))]
            const index = datalabels?.indexOf(label)
            // the chart is empty, we're adding a new series
            if (index === -1) {
                this.chart.data.datasets.push({
                    borderColor: this.props.colors[datalabels.length],
                    label,
                    data: [datapoint]
                })
            } else {
                // we're adding a new datapoint to an existing series
                this.chart.data.datasets[index].data.push(datapoint)
            }
        },
        /**
         * Function to handle adding a data point to Bar Charts
         * @param {*} payload
         * @param {*} label
         */
        addToBar (payload, label) {
            label = label || ''
            // construct our datapoint
            if (typeof payload === 'number') {
                // is this series already a label in the chart?
                if (this.chart.data.labels.includes(label)) {
                    // yes, so we need to find the index of this label
                    const index = this.chart.data.labels.indexOf(label)
                    // and update the data at this index
                    this.chart.data.datasets[0].data[index] = payload
                } else {
                    // no, so we need to add new label and data point
                    if (!this.chart.data.datasets.length) {
                        this.chart.data.datasets.push({
                            data: [],
                            backgroundColor: this.props.colors,
                            borderColor: this.props.colors
                        })
                    }
                    this.chart.data.datasets[0].data.push(payload)
                    this.chart.data.labels.push(label)
                }
            } else {
                // only support numbers for now
                console.log('Unsupported payload type for Bar Chart:', typeof payload)
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
            if (this.chart.data.datasets.length > 0) {
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
</style>
