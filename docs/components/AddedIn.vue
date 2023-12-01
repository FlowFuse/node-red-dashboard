<template>
    <a class="added-in" :href="'https://github.com/FlowFuse/node-red-dashboard/releases/tag/v' + version" target="_blank">Added In: v{{ version }}</a>
</template>

<script>
export default {
    name: 'AddedIn',
    props: {
        version: {
            type: String,
            required: true
        }
    }
}
</script>

<style scoped>
.added-in {
    display: inline-flex;
    font-size: 14px;
    line-height: 20px;
    padding: 3px 9px;
    color: var(--vp-c-brand-1);
    margin-left: 0.5em;
    border-radius: 2rem;
    background-color: var(--vp-c-brand-soft);
    border: 1px solid var(--vp-c-brand-1);
    text-decoration: none;
    transition: none;
    vertical-align: middle;
}

.added-in:hover {
    background-color: var(--vp-c-brand-1);
    color: #fff;
}
</style>
