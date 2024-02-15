<template>
<div class="side-by-side">
    <div class="side-by-side-images">
        <img :src="left" data-zoomable />
        <img :src="right" data-zoomable />
    </div>
    <em>{{ caption }}</em>
</div>
</template>
<script>

import mediumZoom from 'medium-zoom'

export default {
    name: 'SideBySideImages',
    props: {
        left: {
            type: String,
            required: true
        },
        right: {
            type: String,
            required: true
        },
        caption: {
            type: String,
            default: ''
        }
    },
    mounted () {
        mediumZoom('[data-zoomable]')
    }
}
</script>

<style scoped>
.side-by-side {
}
.side-by-side-images {
    display: grid;
    grid-template-columns: 50% 50%;
    width: 100%;
    gap: 8px;
}
.side-by-side em {
    text-align: center;
    width: 100%;
    display: block;
    font-size: 0.875rem;
}
</style>
