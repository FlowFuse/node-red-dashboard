<template>
    <a class="advert-banner" :href="href">
        <slot></slot>
    </a>
</template>

<script>
export default {
    props: {
        href: {
            type: String,
            required: true
        }
    }
}
</script>

<style>
body {
    --vp-layout-top-height: 42px;
}
.advert-banner {
    height: var(--vp-layout-top-height);
    line-height: var(--vp-layout-top-height);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: var(--vp-c-flowfuse);
    text-align: center;
    color: var(--vp-button-brand-text);
    z-index: 15;
    font-size: 0.875rem;
}
.advert-banner:hover {
    cursor: pointer;
    background-color: var(--vp-c-flowfuse-dark);
}
.VPContent {
    margin-top: var(--vp-layout-top-height);
}

</style>
