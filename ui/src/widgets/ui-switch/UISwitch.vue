<template>
    <div class="nrdb-switch" :class="{'nrdb-nolabel': !props.label}">
        <label v-if="props.label" class="v-label">{{ props.label }}</label>
        <v-switch v-if="!icon" @click="onChange" v-model="state" class="nrdb-ui-widget" :class="{'active': state}" hide-details="auto" color="primary"></v-switch>
        <v-btn v-else @click="toggle" variant="text" :icon="icon" :color="color"></v-btn>
   </div>
</template>

<script>
    import { useDataTracker } from '../data-tracker.js'
    import { mapState } from 'vuex'

    export default {
        name: 'DBUISwitch',
        inject: ['$socket'],
        props: {
            id: String,
            props: Object
        },
        computed: {
            ...mapState('data', ['values']),
            icon: function () {
                if (this.props.onicon && this.props.officon) {
                    const icon = this.state ? this.props.onicon : this.props.officon
                    return 'mdi-' + icon
                } else {
                    return null
                }
            },
            color: function () {
                if (this.props.oncolor || this.props.offcolor) {
                    return this.state ? this.props.oncolor : this.props.offcolor
                }
                return null
            },
            value: function () {
                return this.values[this.id]
            },
            state: {
                get () {
                    const val = this.values[this.id]
                    if (typeof(val) === 'boolean') {
                        return val
                    } else if (this.props.evaluated) {
                        return val === this.props.evaluated.on
                    }
                    return this.value
                },
                set (val) {
                    this.values[this.id] = val
                }
            }
        },
        setup (props) {
            useDataTracker(props.id)
        },
        methods: {
            onChange () {
                // only runs when clicked/changed in UI.
                // inverted as the store doesn't quite update quick enough, but this is reliable method
                this.$socket.emit(`widget-change:${this.id}`, !this.values[this.id])
            },
            toggle () {
                this.state = !this.state
                this.$socket.emit(`widget-change:${this.id}`, this.state)
            }
        }
    }
</script>
  
<style>
.nrdb-switch {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.nrdb-switch label {
    flex-grow: 1;
}
.nrdb-switch .v-selection-control {
    justify-content: flex-end;
}
.nrdb-switch.nrdb-nolabel .v-selection-control {
    justify-content: center;
}
</style>
  