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
                // labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                // datasets: [{
                //     label: '# of Votes',
                //     data: [12, 19, 3, 5, 2, 3],
                //     borderWidth: 1
                // }]
                datasets: []
            },
            // data: {
            //     labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            //     datasets: [{
            //         data: [65, 59, 80, 81, 56, 55]
            //     }]
            // },
            options: {
                animation: false,
                maintainAspectRatio: false,
                parsing: false,
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
            const label = msg.topic
            // determine what type of msg we have
            if (payload !== null && payload !== undefined) {
                // we have a single payload value and should append it to the chart
                this.addPoint(msg, label)
            } else if (Array.isArray(msg) && msg.length > 0) {
                // we have an array of msg values, and should append each of them
                msg.forEach((m) => {
                    this.addPoint(m, label)
                })
            } else {
                // no payload
                console.log('have no payload')
            }
        },
        addPoint (msg, label) {
            const p = msg.payload
            if (this.props.chartType === 'line' || this.props.chartType === 'scatter') {
                const datapoint = msg._datapoint || {}
                this.addToLine(datapoint)
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
        addToLine (datapoint) {
            // the chart is empty, we're adding a new series
            if (!this.chart.data.datasets.length) {
                this.chart.data.datasets.push({
                    data: [datapoint]
                })
            } else {
                // we're adding a new datapoint to an existing series
                this.chart.data.datasets[0].data.push(datapoint)
            }
            this.chart.update()
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
                        this.chart.data.datasets.push({ data: [] })
                    }
                    this.chart.data.datasets[0].data.push(payload)
                    this.chart.data.labels.push(label)
                }
                this.chart.update()
            } else {
                // only support numbers for now
                console.log('Unsupported payload type for Bar Chart:', typeof payload)
            }
        }
    }
}
</script>

<style scoped>
</style>
