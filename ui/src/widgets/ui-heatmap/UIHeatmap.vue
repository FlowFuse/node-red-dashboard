<template>
    <div ref="heatmap_container" :class="className" style="border:1px solid black;width:100%; height:100%;" />
</template>

<script>

import Heatmap from 'visual-heatmap/dist/visualHeatmap.esm.browser.min.js' // eslint-disable-line import/no-named-as-default, import/order, n/file-extension-in-import
import { useDataTracker } from '../data-tracker.mjs' // eslint-disable-line import/order
import { shallowRef } from 'vue'
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUIHeatmap',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            heatmap: null
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        label: function () {
            return this.props.label
        },
        type: function () {
            return this.props.mode || 'heatmap'
        },
        value: {
            get () {
                return this.messages[this.id]?.payload
            },
            set (val) {
                if (this.value === val) {
                    return // no change
                }
                const msg = this.messages[this.id] || {}
                msg.payload = val
                this.messages[this.id] = msg
            }
        },
        validation: function () {
            // TODO currently no validation
            return []
        }
    },
    created () {
        debugger
        // can't do this in setup as we have custom onInput function
        useDataTracker(this.id, this.onMsgInput)
    },
    mounted () {
        let heatmapInstance = Heatmap(this.$refs.heatmap_container, {
            size: this.props.pointRadius,                               // Radius of the data point (in pixels)µ
            min: this.props.minDataValue,                               // Min data Value for relative gradient computation
            max: this.props.maxDataValue,                               // Max data Value for relative gradient computation
            blur: this.props.blurFactor,                                // Blur factor
            opacity: this.props.opacityFactor,                          // Opacity factor
            rotationAngle: this.props.rotationAngle,                    // Rotation angle
            translate: [this.props.translateX, this.props.translateY],  // Translate vector [x, y]
            zoom: this.props.zoomFactor,                                // Zoom Factor
            gradient: this.props.colorGradient,                         // Color Gradient (array of objects with color value and offset)
            backgroundImage: {
                url: this.props.colorGradient                           // Url of the background image
            }
        });

        let maxDataValue = this.props.maxDataValue;
        if (maxDataValue == "") {
            maxDataValue = Number.MAX_SAFE_INTEGER;
        }

        // don't want heatmap to be reactive, so we can use shallowRef
        this.heatmapInstance = heatmapInstance  //shallowRef(heatmapInstance)
    },
    methods: {

        onLoad (history) {
            // we have received a history of data points
            // we need to add them to the heatmap


            // adding is then just the same process as receiving a new msg
            this.onMsgInput(history)
        },
        onMsgInput (msg) {
            debugger
            // because this will get evaluated client-side, we have access to vue/this
            const vue = this
            console.log('custom onInput handler:')
            console.log(msg)

            if (msg.topic == 'setData' || msg.topic == 'addData') {
                let cellWidth  = this.$refs.heatmap_container.clientWidth / (parseInt(this.props.columns));
                let cellHeight = this.$refs.heatmap_container.clientHeight / (parseInt(this.props.rows));

                // Calculate for every grid cell the corresponding x and y coordinates (of the center point)
                msg.payload.forEach(cell => {
                    cell.x = Math.floor((parseInt(cell.column) + 0.5) * cellWidth);
                    cell.y = Math.floor((parseInt(cell.row) + 0.5) * cellHeight);
                });
            }

            switch(msg.topic) {
                case 'setBackgroundImageUrl':
                    this.heatmapInstance.setBackgroundImage({ url: msg.payload })
                    break
                case 'setData':
                    // array of data points with 'x', 'y' and 'value'
                    this.heatmapInstance.renderData(msg.payload)
                    break
                case 'addData':
                    // array of data points with 'x', 'y' and 'value'
                    this.heatmapInstance.addData(msg.payload, false)
                    break
                case 'setMin':
                    this.heatmapInstance.setMin(msg.payload)
                    break
                case 'setMax':
                    this.heatmapInstance.setMax(msg.payload)
                    break
                case 'setTranslate':
                    // array[x, y]
                    this.heatmapInstance.setTranslate(msg.payload);
                case 'setZoom':
                    // float
                    this.heatmapInstance.setZoom(msg.payload)
                    break
                case 'setRotationAngle':
                    this.heatmapInstance.setRotationAngle(msg.payload)
                    break
                case 'setSize':
                    this.heatmapInstance.setSize(msg.payload)
                    break
                case 'setBlur':
                    this.heatmapInstance.setBlur(msg.payload)
                    break
                case 'setOpacity':
                    this.heatmapInstance.setOpacity(msg.payload)
                    break
                case 'clear':
                    this.heatmapInstance.clear()
                    break
            }
            
            // TODO in een functie moven
            if (msg.topic == 'setData' || msg.topic == 'addData') {
                // Get the canvas element which has been created by the visual-heatmap library
                let canvas = this.$refs.heatmap_container.getElementsByTagName('canvas')[0];

                // TODO moet text size automatisch berekend worden of instelbaar?  Of beide mogelijk?
                let ctx = canvas.getContext("webgl");
                ctx.font = "30px Arial";
                ctx.fillStyle = "black";
                ctx.textAlign = "center";

                // Draw some text on top of the existing heatmap elements
                // TODO eventueel een element.label tonen, die we op voorhand opvullen met bv. de waarde
                this.heatmapInstance.rawData.every(element => ctx.fillText(element.value, element.x, element.y));
            }
        },
        clear () {
            // TODO this.chart.data.labels = []
            // TODO this.chart.data.datasets = []
            // TODO this.chart.update()
        }
    }
}
</script>

<style scoped>
</style>
