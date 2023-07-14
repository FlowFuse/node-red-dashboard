<template>
    <div class="nrdb-ui-widget">Template Node: {{ props.format }}</div>
</template>

<script>
    import { useDataTracker } from '../data-tracker.js'
    import { mapState } from 'vuex'

    export default {
        name: 'DBUITemplate',
        inject: ['$socket'],
        props: {
            id: String,
            props: Object
        },
        computed: {
            ...mapState('data', ['values']),
        },
        setup (props) {
            useDataTracker(props.id)
        }
    }
</script>
  
<style scoped>
</style>
  