<template>
    <div class="auth-provider">
        <img :src="img">
        <p><slot></slot></p>
    </div>
</template>

<script>
export default {
    name: 'AuthProvider',
    props: {
        img: { type: String, required: true }
    }
}
</script>

<style scoped>
.auth-provider {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 1.5rem;
}
.auth-provider img {
    width: 128px;
    padding: 24px;
}
</style>
