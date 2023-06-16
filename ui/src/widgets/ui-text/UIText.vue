<template>
    {{ (values && values[id]) || 'No Message Received' }}
</template>

<script>
    import { useDataTracker } from '../data-tracker.js'
    import { mapState } from 'vuex'

    export default {
        name: 'DBUIText',
        props: {
            id: String
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
    /* @import "./components/header/header.css"; */
</style>
  