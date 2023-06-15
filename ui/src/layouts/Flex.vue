<template>
    <div class="nrdb-layout nrdb-layout--flex">
        Flex View:
        {{ widgets }}
        <div v-for="w in widgets" :key="w.id">
            {{ w.id }} {{  w.type }}
            <!-- <component :is="w.type" /> -->
        </div>
    </div>
</template>

<script>
    export default {
        name: 'LayoutFlex',
        props: {
            widgets: {
                required: true,
                type: Array
            }
        }
    }
</script>