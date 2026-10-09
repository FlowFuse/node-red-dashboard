<template>
    <div class="recommended-reading">
        <a v-for="a in articles" :key="a.title" :href="a.url">
            <img :src="a.image" :alt="a.title" width="1600" height="900" loading="lazy">
            <span class="title">{{ a.title }}</span>
        </a>
    </div>
</template>

<script setup>
const articles = [
    {
        title: 'Getting Started with Dashboard',
        url: 'https://flowfuse.com/blog/2024/03/dashboard-getting-started/',
        image: '/images/recommended-reading/getting-started-with-dashboard-2.png'
    },
    {
        title: 'Personalised Multi-user Dashboards with FlowFuse Dashboard',
        url: 'https://flowfuse.com/blog/2024/01/dashboard-2-multi-user/',
        image: '/images/recommended-reading/dashboard-2-multi-user.png'
    },
    {
        title: 'Building a Custom Video Player in FlowFuse Dashboard',
        url: 'https://flowfuse.com/blog/2023/12/dashboard-0-10-0/',
        image: '/images/recommended-reading/dashboard-0-10-0.png'
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
        display: block;
        width: 100%;
        height: auto;
        transition: 0.15s transform;
    }
    .recommended-reading .title {
        display: block;
        padding: 8px 4px;
        font-weight: 500;
        color: var(--vp-c-text-1);
    }
    .recommended-reading a:hover {
        border: 2px solid var(--vp-c-brand-1);
    }
    .recommended-reading a:hover img {
        transform: scale(1.05);
    }
    @media (max-width: 640px) {
        .recommended-reading {
            grid-template-columns: 1fr;
        }
    }
</style>
