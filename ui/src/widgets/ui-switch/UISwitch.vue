<template>
    <div class="nrdb-switch" :class="{'nrdb-nolabel': !props.label}">
        <label v-if="props.label" class="v-label">{{ props.label }}</label>
        <v-switch @click="onChange" v-model="state" class="nrdb-ui-widget" :class="{'active': state}" hide-details="auto" color="primary"></v-switch>
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
            value: function () {
                return this.values[this.id]
            },
            state: {
                get () {
                    const val = this.values[this.id]
                    console.log(this.props.evaluated, val)
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
  