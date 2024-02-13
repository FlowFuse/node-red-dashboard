<template>
    <div ref="heatmap_container" :class="className" style="border:1px solid black;width:100%; height:100%;" />
</template>

<script>

import Heatmap from 'visual-heatmap/dist/visualHeatmap.esm.min.js' // eslint-disable-line import/no-named-as-default, import/order, n/file-extension-in-import
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
        // can't do this in setup as we have custom onInput function
        useDataTracker(this.id, this.onMsgInput)
    },
    mounted () {
        this.cellWidth  = this.$refs.heatmap_container.clientWidth / (parseInt(this.props.columns));
        this.cellHeight = this.$refs.heatmap_container.clientHeight / (parseInt(this.props.rows));

        // Convert the point radius to pixels (average of X and Y direction because gl_PointSize in webgl is the same in both directions)
        let pointRadius = this.props.pointRadius * (this.cellWidth + this.cellHeight) / 2

        let translateX = Math.floor((parseInt(this.props.translateX) + 0.5) * this.cellWidth);
        let translateY = Math.floor((parseInt(this.props.translateY) + 0.5) * this.cellHeight);

        // The heatmap package expects rgba colors, so the original hex color (e.g. #FF00FF) and the opacity should be combined to [R,G,B,A]
        let colorGradient = this.convertGradient(this.props.colorGradient)

        let heatmapInstance = Heatmap(this.$refs.heatmap_container, {
            size: pointRadius,                                          // Radius of the data point (in pixels)µ
            min: this.props.minDataValue,                               // Min data Value for relative gradient computation
            max: this.props.maxDataValue,                               // Max data Value for relative gradient computation
            opacity: this.props.opacityFactor,                          // Opacity factor
            rotationAngle: this.props.rotationAngle,                    // Rotation angle
            translate: [translateX, translateY],                        // Translate vector [x, y]
            zoom: this.props.zoomFactor,                                // Zoom Factor
            gradient: colorGradient,                                    // Color Gradient (array of objects with color value and offset)
            backgroundImage: {
                url: this.props.colorGradient                           // Url of the background image
            }
        });

        let maxDataValue = this.props.maxDataValue;
        if (maxDataValue == "") {
            maxDataValue = Number.MAX_SAFE_INTEGER;
        }

        this.heatmapInstance = heatmapInstance
    },
    methods: {

        convertGradient(colorGradient) {
            // The heatmap package expects rgba colors, so the original hex color (e.g. #FF00FF) and the opacity should be combined to [R,G,B,A]
            return colorGradient.map(({ color, opacity, offset }) => {
                let hexColor = color
                let r = parseInt(hexColor.slice(1, 3), 16)
                let g = parseInt(hexColor.slice(3, 5), 16)
                let b = parseInt(hexColor.slice(5, 7), 16)
                let rgba = [r, g, b, parseFloat(opacity)]
                return {color: rgba, offset: parseFloat(offset)}
            })
        },
        onLoad (history) {
            // we have received a history of data points
            // we need to add them to the heatmap


            // adding is then just the same process as receiving a new msg
            this.onMsgInput(history)
        },
        onMsgInput (msg) {
            // because this will get evaluated client-side, we have access to vue/this
            const vue = this
            
            if (msg.topic == 'setData' || msg.topic == 'addData') {
                // Since the heatmap can be displayed on all kind of devices, the server side uses rows and columns
                // (instead of X and Y coordinates).  As a result, the X and Y coordinates need to be calculated
                // for every grid cell (i.e. coordinates of the cell center point).
                msg.payload.forEach(cell => {
                    cell.x = Math.floor((parseInt(cell.column) + 0.5) * this.cellWidth);
                    cell.y = Math.floor((parseInt(cell.row) + 0.5) * this.cellHeight);
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
                case 'setGradient':
                    // TODO find a way to apply the same validation rules as in the flow editor config page
                    let colorGradient = this.convertGradient(msg.payload)
                    this.heatmapInstance.setGradient(colorGradient)
                    break
                case 'setMin':
                    this.heatmapInstance.setMin(msg.payload)
                    break
                case 'setMax':
                    this.heatmapInstance.setMax(msg.payload)
                    break
                case 'setTranslate':
                    this.heatmapInstance.setTranslate(msg.payload)
                    break
                case 'setZoom':
                    this.heatmapInstance.setZoom(msg.payload)
                    break
                case 'setRotationAngle':
                    this.heatmapInstance.setRotationAngle(msg.payload)
                    break
                case 'setSize':
                    this.heatmapInstance.setSize(msg.payload)
                    break
                case 'setOpacity':
                    this.heatmapInstance.setOpacity(msg.payload)
                    break
                case 'clear':
                    this.heatmapInstance.clear()
                    break
            }
            
            // TODO show labels on top of the heatmap
            //if (msg.topic == 'setData' || msg.topic == 'addData') {
            //    let canvas = this.$refs.heatmap_container.getElementsByTagName('canvas')[0];
            //    let ctx = canvas.getContext("2D");
            //    ctx.font = "30px Arial";
            //    ctx.fillStyle = "black";
            //    ctx.textAlign = "center";
            //    this.heatmapInstance.rawData.every(element => ctx.fillText(element.value, element.x, element.y));
            //}
        },
        clear () {
            // TODO ???
        }
    }
}
</script>

<style scoped>
</style>
