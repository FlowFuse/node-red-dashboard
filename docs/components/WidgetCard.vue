<template>
    <a class="widget-card">
        <img
            :src="widget.image"
        >

        <div class="widget-card-text">
            <label>{{  widget.name }}</label>
            <p>{{  widget.description }}</p>
        </div>
    </a>
</template>

<script>
export default {
    name: 'WidgetCard',
    props: {
        widget: {
            type: Object,
            required: true
        }
    }
}
</script>