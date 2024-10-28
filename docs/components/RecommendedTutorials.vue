<template>
    <div class="recommended-tutorials">
        <a v-for="a in videos" :key="a.title" :href="a.url" target="_blank">
            <img :src="a.image" :alt="a.title">
            <div class="overlay">
                <PlayIcon class="play-icon" />
            </div>
        </a>
        <a class="more">
            <div class="overlay">
                <label>...More Coming Soon!</label>
            </div>
        </a>
    </div>
</template>

<script setup>
import PlayIcon from './icons/PlayIcon.vue'
const videos = [
    {
        title: 'Getting Started with Node-RED & Dashboard',
        url: 'https://youtu.be/DFNv91TTt68?si=Wj07fuD1l27qtT-1',
        image: 'https://website-data.s3.eu-west-1.amazonaws.com/Tutorial+Thumbnail+-+Getting+Started.jpg'
    },
    {
        title: 'Visualising Data in Node-RED & Dashboard',
        url: 'https://youtu.be/Ecno0EuLyKQ?si=AW2OUpVwJgQU_qli',
        image: 'https://website-data.s3.eu-west-1.amazonaws.com/Tutorial+Thumbnail+-+Data+Visualisation.jpg'
    }
]
</script>

<style scoped>
    .recommended-tutorials {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
    }
    .recommended-tutorials a {
        overflow: hidden;
        border-radius: 12px;
        border: 2px solid transparent;
        position: relative;
    }
    .recommended-tutorials img {
        transition: 0.15s transform;
    }
    .recommended-tutorials a:hover {
        border: 2px solid var(--vp-c-brand-1);
    }
    .recommended-tutorials a:hover img {
        transform: scale(1.05);
    }
    .recommended-tutorials .overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        top: 0;
        left: 0;
    }
    .recommended-tutorials .play-icon {
        width: 48px;
        background-color: #3551b2;
        color: white;
        border-radius: 50%;
        padding: 6px;
        padding-left: 9px;
    }
    .recommended-tutorials .more {
        pointer-events: none;
        background-color: #EEF2FF;
        border: 1px solid #818CF8;
    }
</style>
