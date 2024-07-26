<template>
    <div class="try-out-wrapper">
        <slot></slot>
        <a :href="`https://dashboard-demos.flowfuse.cloud/dashboard/${href}`" target="_blank" class="--btn">
            {{ title }}
        </a>
    </div>
</template>

<script setup>
const { href, title } = defineProps({
    href: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: 'Try Demo'
    }
})
</script>

<style scoped lang="scss">
.try-out-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .--btn {
        background-color: var(--vp-c-brand-3);
        ;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        text-decoration: none;

        &:hover {
            background-color: var(--vp-c-brand-2);
            cursor: pointer;
        }
    }
}
</style>
