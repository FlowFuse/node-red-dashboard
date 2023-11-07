<template>
    <a class="widget-card" :href="url">
        <img
            v-if="widget.image"
            :src="widget.image"
            :alt="widget.description"
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
    },
    computed: {
        url () {
            return `/nodes/widgets/${this.widget.widget}.html`
        }
    }
}
</script>