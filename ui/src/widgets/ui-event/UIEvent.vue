<template>
    <button @click="$socket.emit('ui-event:$pageview', id, {'on': 'click'})">Hello World</button>
</template>

<script>
import { useDataTracker } from '../data-tracker.js' // eslint-disable-line import/order

export default {
    name: 'DBUIEvent',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
    created () {
        // can't do this in setup as we have custom onInput function
        console.log('UI Event Created')
        useDataTracker(this.id, null, this.onLoad)
        console.log('UI Event Created')
    },
    methods: {
        onLoad () {
            const msg = {
                hello: 'world'
            }
            console.log('sending pageview', this.id, msg)
            this.$socket.emit('ui-event:$pageview', this.id, msg)
        }
    }
}
</script>
