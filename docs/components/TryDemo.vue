<template>
    <div class="try-out-wrapper">
        <slot></slot>
        <a :href="`https://dashboard-demos.flowfuse.cloud/dashboard/${href}`" target="_blank" class="--btn">
            {{ title }}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="currentColor"
                    d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
            </svg>
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
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--vp-c-brand-3);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        text-decoration: none;

        svg {
            width: 1.2rem;
            height: 1.2rem;
            margin-left: 0.5rem;
        }

        &:hover {
            background-color: var(--vp-c-brand-2);
            cursor: pointer;
        }
    }
}
</style>
