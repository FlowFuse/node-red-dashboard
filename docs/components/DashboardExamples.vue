<template>
    <div class="dashboard-examples">
        <!-- Carousel Container -->
        <div class="carousel-container">
            <button class="nav-button prev" @click="prevImage" :disabled="currentIndex === 0">
                <ChevronLeft />
            </button>

            <div class="carousel" ref="carousel">
                <div
                    class="carousel-track"
                    :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
                >
                    <div
                        v-for="(image, index) in images"
                        :key="index"
                        class="carousel-slide"
                    >
                        <img :src="image.url" :alt="image.alt" @click="openFullscreen(image)">
                        <label class="carousel-slide-label" @click.stop>
                            {{ image.alt }}
                        </label>
                    </div>
                </div>
                <a v-if="images[currentIndex].link" class="learn-more VPButton medium alt" :href="images[currentIndex].link" target="_blank">
                    <ExternalLink />
                </a>
            </div>

            <button class="nav-button next" @click="nextImage" :disabled="currentIndex === images.length - 1">
                <ChevronRight />
            </button>
        </div>

        <!-- Thumbnail Navigation -->
        <div class="thumbnails">
            <div
                v-for="(image, index) in images"
                :key="index"
                class="thumbnail"
                :class="{ active: currentIndex === index }"
                @click="goToImage(index)"
            >
                <img :src="image.url" :alt="image.alt">
            </div>
        </div>

        <!-- Fullscreen Modal -->
        <div v-if="fullscreenImage" class="fullscreen-modal" @click="closeFullscreen">
            <img :src="fullscreenImage.url" :alt="fullscreenImage.alt">
            <button class="close-button" @click="closeFullscreen">&times;</button>
        </div>
    </div>
</template>

<script>
import ChevronLeft from './icons/ChevronLeft.vue'
import ChevronRight from './icons/ChevronRight.vue'
import ExternalLink from './icons/ExternalLink.vue'

export default {
    name: 'DashboardExamples',
    components: {
        ChevronLeft,
        ChevronRight,
        ExternalLink
    },
    data () {
        return {
            currentIndex: 0,
            fullscreenImage: null,
            images: [
                {
                    url: '/images/dashboard-examples/oee-dashboard.png',
                    alt: 'OEE Performance Dashboard',
                    link: 'https://flowfuse.com/blog/2025/04/building-oee-dashboard-with-flowfuse-2/'
                },
                {
                    url: '/images/dashboard-examples/iss-dashboard.png',
                    alt: 'International Space Station Dashboard',
                    link: 'https://discourse.nodered.org/t/international-space-station-data-stream/95202'
                },
                {
                    url: '/images/dashboard-examples/gh-dashboard.png',
                    alt: 'GitHub Repo Stats Tracker',
                    link: 'https://discourse.nodered.org/t/dashboard-2-0-project-github-project-analysis/90144'
                },
                {
                    url: '/images/dashboard-examples/gauge-dashboard.png',
                    alt: 'Factory Line Dashboard',
                    link: 'https://discourse.nodered.org/t/factory-metrics/96298'
                },
                {
                    url: '/images/dashboard-examples/zone-performance.png',
                    alt: 'Factory Line Dashboard',
                    link: 'https://discourse.nodered.org/t/factory-metrics/96298'
                },
                {
                    url: '/images/dashboard-examples/oee-dashboard-2.png',
                    alt: 'OEE Performance Dashboard',
                    link: 'https://flowfuse.com/blog/2025/04/building-oee-dashboard-with-flowfuse-2/'
                }
            ]
        }
    },
    methods: {
        nextImage () {
            if (this.currentIndex < this.images.length - 1) {
                this.currentIndex++
            }
        },
        prevImage () {
            if (this.currentIndex > 0) {
                this.currentIndex--
            }
        },
        goToImage (index) {
            this.currentIndex = index
        },
        openFullscreen (image) {
            this.fullscreenImage = image
            document.body.style.overflow = 'hidden'
        },
        closeFullscreen () {
            this.fullscreenImage = null
            document.body.style.overflow = ''
        }
    }
}
</script>

<style scoped>
.dashboard-examples {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.carousel-container {
    position: relative;
    width: 100%;
    height: 400px;
    overflow: hidden;
    border-radius: 8px;
}

.carousel {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
}

.carousel-track {
    display: flex;
    height: 100%;
    transition: transform 0.3s ease-in-out;
}

.carousel-slide {
    min-width: 100%;
    height: 100%;
}

.carousel-slide img {
    width: 100%;
    flex-grow: 1;
    height: calc(100% - 24px);
    object-fit: contain;
    cursor: zoom-in;
}

.carousel .learn-more {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 6px;
    border-radius: 6px;
    border: 1px solid transparent;
    font-size: 12px;
    text-decoration: none;
    transition: opacity 0.3s;
    color: var(--vp-c-flowfuse);
    border: 1px solid var(--vp-c-flowfuse);
    background-color: white;
}
.carousel .learn-more svg {
    width: 24px;
    height: 24px;
}

.carousel .learn-more:hover {
    color: white;
    background: var(--vp-c-flowfuse);
}

.carousel-slide-label {
    display: block;
    text-align: center;
    margin-top: 3px;
    color: var(--vp-code-tab-text-color);
    pointer-events: none;
}

.nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.8);
    border: none;
    width: 40px;
    height: 40px;
    padding: 8px;
    border-radius: 50%;
    cursor: pointer;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;
}

.dark .nav-button {
    background: rgba(0, 0, 0, 0.8);
    color: white;
}

.nav-button:hover {
    background: var(--vp-c-flowfuse);
    color: white;
}

.nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.prev {
    left: 12px;
}

.next {
    right: 12px;
}

.thumbnails {
    background: var(--vp-c-bg-alt);
    display: flex;
    gap: 10px;
    margin-top: 20px;
    overflow-x: auto;
    padding: 12px;
    border-radius: 12px;
}

.thumbnail {
    width: 80px;
    height: 60px;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.3s;
    border: 2px solid transparent;
}

.thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.thumbnail:hover {
    opacity: 1;
    border: 2px solid var(--vp-input-border-color);
}

.thumbnail.active {
    opacity: 1;
    border: 2px solid #007bff;
}

.fullscreen-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.fullscreen-modal img {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
}

.close-button {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: white;
    font-size: 32px;
    cursor: pointer;
    padding: 10px;
}

.close-button:hover {
    opacity: 0.8;
}
</style>
