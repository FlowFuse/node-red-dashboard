
<template>
    <canvas class="nrdb-ui-widget" ref="chart"></canvas>
</template>

<script>
    import Chart from 'chart.js/auto';
    import { useDataTracker } from '../data-tracker.js'

    import { shallowRef } from 'vue';
    import { mapState } from 'vuex'

    export default {
        name: 'DBUIChart',
        inject: ['$socket'],
        props: {
            id: String,
            props: Object
        },
        data () {
            return {
                chart: null
            }
        },
        computed: {
            ...mapState('data', ['values'])
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
                    maintainAspectRatio: false,
                    parsing: false,
                    scales: {
                        x: {
                            type: this.props.xAxisType || 'linear'
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
                console.log("chart got msg", msg)
                if (Array.isArray(msg.payload) && !msg.payload.length) {
                    // clear the chart
                    this.clear()
                } else {
                    // update the chart
                    this.add(msg)
                }
            },
            clear () {
                console.log('clear')
                this.chart.data.labels = []
                this.chart.data.datasets = []
                console.log(this.chart.data)
                this.chart.update()
            },
            add (msg) {
                const payload = msg.payload
                const label = msg.topic
                console.log('add', payload, label)
                // determine what type of msg we have
                if (payload) {
                    if (this.props.chartType === 'line' || this.props.chartType === 'scatter') {
                        this.addToLine(payload, label)
                    }
                    else if (this.props.chartType === 'bar') {
                        this.addToBar(payload, label)
                    }
                } else {
                    // no payload
                    console.log('have no payload')
                }
            },
            /**
             * Function to handle adding a data point to Line Charts
             * @param {*} payload 
             * @param {*} label 
             */
            addToLine (payload) {
                console.log('adding to line')
                const datapoint = {}
                // construct our datapoint
                if (typeof payload === 'number') {
                    // just a number, assume we're plotting a time series
                    datapoint.x = (new Date()).getTime()
                    datapoint.y = payload
                } else if (typeof payload === 'object' && 'y' in payload) {
                    // may have been given an x/y object already
                    datapoint.x = payload.x || (new Date()).getTime()
                    datapoint.y = payload.y
                }
                console.log('datapoint', datapoint)
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
                console.log('adding to bar')
                // construct our datapoint
                if (typeof payload === 'number') {
                    // is this series already a label in the chart?
                    if (this.chart.data.labels.includes(label)) {
                        console.log('already have label', label)
                        // yes, so we need to find the index of this label
                        const index = this.chart.data.labels.indexOf(label)
                        // and update the data at this index
                        this.chart.data.datasets[0].data[index] = payload
                    } else {
                        console.log('do not have label', label)
                        // no, so we need to add new label and data point
                        if (!this.chart.data.datasets.length) {
                            this.chart.data.datasets.push({data: []})
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
  