<template>
    <div class="flow-viewer" :style="{'height': height }"></div>
</template>

<script>
import FlowRenderer from '@flowfuse/flow-renderer'

export default {
    name: 'FlowViewer',
    props: {
        flow: {
            type: Object,
            required: true
        },
        height: {
            type: String,
            default: '500px'
        }
    },
    mounted () {
        this.$nextTick(() => {
            const renderer = new FlowRenderer()
            renderer.renderFlows(this.flow, { container: this.$el })
        })
    }
}
</script>

<style>
.flow-viewer {
    margin-top: 12px;
    width: 100%;
}
</style>
