<template>
    <a class="added-in node-red-version" :href="'https://github.com/node-red/node-red/releases/tag/v' + version" target="_blank">Node-RED v{{ version }}+</a>
</template>

<script>
export default {
    name: 'NodeRedVersion',
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

.added-in.node-red-version {
    background-color: var(--vp-c-node-red);
    color: var(--vp-c-node-red-dark);
    border: 1px solid var(--vp-c-node-red-dark);
}

.added-in.node-red-version:hover {
    background-color: var(--vp-c-node-red-dark);
    color: #fff;
}
</style>
