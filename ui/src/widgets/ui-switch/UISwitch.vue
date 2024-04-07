<template>
    <div class="nrdb-switch" :class="{'nrdb-nolabel': !props.label, [className]: !!className}">
        <label v-if="props.label" class="nrdb-ui-switch-label">{{ props.label }}</label>
        <v-switch v-if="!icon" v-model="status" :disabled="!state.enabled" :class="{'active': status}" hide-details="auto" color="primary" @update:model-value="onChange" />
        <v-btn v-else variant="text" :disabled="!state.enabled" :icon="icon" :color="color" @click="toggle" />
    </div>
</template>

<script>
import { useDataTracker } from '../data-tracker.mjs' // eslint-disable-line import/order
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUISwitch',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    setup (props) {
        useDataTracker(props.id)
    },
    computed: {
        ...mapState('data', ['messages']),
        icon: function () {
            if (this.props.onicon && this.props.officon) {
                const icon = this.status ? this.props.onicon : this.props.officon
                return 'mdi-' + icon.replace(/^mdi-/, '')
            } else {
                return null
            }
        },
        color: function () {
            if (this.props.oncolor || this.props.offcolor) {
                return this.status ? this.props.oncolor : this.props.offcolor
            }
            return null
        },
        value: function () {
            return this.messages[this.id]?.payload
        },
        status: {
            get () {
                const val = this.value
                if (typeof (val) === 'boolean') {
                    return val
                } else if (typeof (val) === 'object') {
                    // don't make a decision either way, unless it matches, exactly, the defined on/off values
                    if (JSON.stringify(val) === JSON.stringify(this.props.evaluated.on)) {
                        return true
                    } else if (JSON.stringify(val) === JSON.stringify(this.props.evaluated.off)) {
                        return false
                    }
                } else if (this.props.evaluated) {
                    return val === this.props.evaluated.on
                }
                return this.value
            },
            set (val) {
                const msg = this.messages[this.id] || {}
                msg.payload = val
                this.messages[this.id] = msg
            }
        }
    },
    methods: {
        onChange (val) {
            // only runs when clicked/changed in UI.
            // inverted as the store doesn't quite update quick enough, but this is reliable method
            this.$socket.emit('widget-change', this.id, val)
        },
        toggle () {
            this.status = !this.status
            this.$socket.emit('widget-change', this.id, this.status)
        }
    }
}
</script>

<style scoped>
.nrdb-switch {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.nrdb-switch label {
    flex-grow: 1;
    font-size: 1rem;
    color: #717171;
    font-family: Helvetica;
}
.nrdb-switch .v-switch {
    flex-grow: 0;
}
.nrdb-switch .v-selection-control {
    justify-content: flex-end;
}
.nrdb-switch.nrdb-nolabel .v-selection-control {
    justify-content: center;
}
</style>
