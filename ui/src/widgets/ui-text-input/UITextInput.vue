
<template>
    <v-text-field v-model="values[id]" class="nrdb-ui-widget nrdb-ui-text-field"
        :label="label" variant="outlined" hide-details="auto" @blur="onBlur"></v-text-field>
</template>

<script>
    import { useDataTracker } from '../data-tracker.js'
    import { mapState } from 'vuex'

    export default {
        name: 'DBUIText',
        inject: ['$socket'],
        props: {
            id: String,
            props: Object
        },
        computed: {
            ...mapState('data', ['values']),
            label: function () {
                return this.props.label
            }
        },
        setup (props) {
            useDataTracker(props.id)
        },
        methods: {
            onBlur: function () {
                console.log("blur", this.values[this.id])
                this.$socket.emit(`widget-change:${this.id}`, this.values[this.id])
            }
        }
    }
</script>
  
<style scoped>
</style>
  