<template>
    <div class="recommended-reading">
        <a v-for="a in articles" :key="a.title" :href="a.url">
            <img :src="a.image">
        </a>
    </div>
</template>

<script setup>
const articles = [
    {
        title: 'Getting Started with Dashboard',
        url: 'https://flowfuse.com/blog/2024/03/dashboard-getting-started/',
        image: 'https://flowfuse.com/img/getting-started-with-dashboard-2-XtCp3zOvCC-1120.avif'
    },
    {
        title: 'Personalised Multi-user Dashboards with Node-RED Dashboard 2.0',
        url: 'https://flowfuse.com/blog/2024/01/dashboard-2-multi-user/',
        image: 'https://flowfuse.com/img/tile-dashboard-2-multi-user-UrjNxC416v-1120.avif'
    },
    {
        title: 'Building a Custom Video Player in Dashboard 2.0',
        url: 'https://flowfuse.com/blog/2023/12/dashboard-0-10-0/',
        image: 'https://flowfuse.com/img/tile-dashboard-0-10-0-g--bJXNlBL-1120.avif'
    }
]
</script>

<style scoped>
    .recommended-reading {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
    }
    .recommended-reading a {
        overflow: hidden;
        border-radius: 12px;
        border: 2px solid transparent;
    }
    .recommended-reading img {
        transition: 0.15s transform;
    }
    .recommended-reading a:hover {
        border: 2px solid var(--vp-c-brand-1);
    }
    .recommended-reading a:hover img {
        transform: scale(1.05);
    }
</style>
