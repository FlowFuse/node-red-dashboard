<template>
    <v-btn class="nrdb-ui-widget" @click="action" block variant="flat" :disabled="!state.enabled">{{ props.label }}</v-btn>
</template>

<script>
    import { useDataTracker } from '../data-tracker.js'
    import { mapState } from 'vuex'

    export default {
        name: 'DBUIButton',
        inject: ['$socket'],
        props: {
            id: String,
            props: Object,
            state: Object
        },
        computed: {
            ...mapState('data', ['values']),
        },
        setup (props) {
            useDataTracker(props.id)
        },
        methods: {
            action ($evt) {
                console.log('button clicked', $evt)
                const evt = {
                    clientX: $evt.clientX,
                    clientY: $evt.clientY,
                    bbox: $evt.target.getBoundingClientRect()
                }
                this.$socket.emit(`widget-action:${this.id}`, {
                    event: evt
                })
            }
        }
    }
</script>
  
<style scoped>
</style>
  