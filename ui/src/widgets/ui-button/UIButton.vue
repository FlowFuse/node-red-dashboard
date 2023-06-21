<template>
    <v-btn @click="action" block variant="outlined">{{ props.label }}</v-btn>
</template>

<script>
    import { useDataTracker } from '../data-tracker.js'
    import { mapState } from 'vuex'

    export default {
        name: 'DBUIButton',
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
        },
        methods: {
            action () {
                console.log('button clicked')
                this.$socket.emit(`widget-action:${this.id}`, 'button clicked')
            }
        }
    }
</script>
  
<style scoped>
</style>
  