<template>
    <v-combobox
        v-model="value"
        :label="props.label"
        :multiple="props.multiple"
        :items="props.options"
        item-title="label"
        item-value="value"
        variant="outlined"
        hide-details="auto"
        @update:modelValue="onChange"
        :error-messages="props.options?.length ? '' : 'No options available'"
        ></v-combobox>
</template>

<script>
    import { useDataTracker } from '../data-tracker.js'
    import { mapState } from 'vuex'

    export default {
        name: 'DBUIDropdown',
        inject: ['$socket'],
        props: {
            id: String,
            props: Object
        },
        computed: {
            ...mapState('data', ['values']),
        },
        created () {
            // can't do this in setup as we are using custom onInput function that needs access to 'this'
            useDataTracker(this.id, (msg) => {
                var value = msg.payload
                // rebuild the full list of options from just their values (req'd for multi selection)
                if (Array.isArray(msg.payload)) {
                    value = this.props.options.filter((o) => {
                        console.log(o)
                        return msg.payload.includes(o.value)
                    })
                }
                // update our vuex store with the value retrieved from Node-RED
                this.$store.commit('data/bind', {
                    widgetId: this.id,
                    data: value
                })
                // ensure we set our local "value" to match
                // that stored in the vuex store
                this.value = this.values[this.id]
            })
        },
        data () {
            return {
                value: null
            }
        },
        methods: {
            onChange () {
                console.log('dropdown changed')
                this.$store.commit('data/bind', {
                    widgetId: this.id,
                    data: this.value
                })
                if (this.props.multiple) {
                    console.log('emitting', this.value.map(v => v.value))
                    this.$socket.emit(`widget-change:${this.id}`, this.value.map(v => v.value))
                } else {
                    console.log('emitting', this.value)
                    this.$socket.emit(`widget-change:${this.id}`, this.value)
                }
            }
        }
    }
</script>
  
<style scoped>
</style>
  