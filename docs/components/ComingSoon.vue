<template>
    <span class="coming-soon">Coming Soon</span>
</template>

<script>
export default {
    name: 'ComingSoon'
}
</script>

<style scoped>
.coming-soon {
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
</style>
