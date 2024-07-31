<template>
    <div class="nrdb-switch" :class="{'nrdb-nolabel': !props.label, [className]: !!className}">
        <label v-if="props.label" class="v-label">{{ props.label }}</label>
        <v-switch
            v-if="!icon" v-model="status"
            :disabled="!state.enabled" :class="{'active': status}"
            hide-details="auto" color="primary"
            :loading="loading ? (status === true ? 'secondary' : 'primary') : null"
            readonly
            @click="toggle"
        />
        <v-btn v-else-if="!loading" variant="text" :disabled="!state.enabled" :icon="icon" :color="color" @click="toggle" />
        <v-progress-circular v-else indeterminate color="primary" />
    </div>
</template>

<script>
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUISwitch',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            selection: null,
            loading: false
        }
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
            return this.selection
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
                this.selection = val
                this.messages[this.id] = msg
                if (this.decouple) {
                    this.loading = true
                }
            }
        }
    },
    created () {
        // can't do this in setup as we are using custom onInput function that needs access to 'this'
        this.$dataTracker(this.id, this.onInput, this.onLoad, null)

        // let Node-RED know that this widget has loaded
        this.$socket.emit('widget-load', this.id)
    },
    methods: {
        onInput (msg) {
            // update our vuex store with the value retrieved from Node-RED
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
            // make sure our v-model is updated to reflect the value from Node-RED
            if (msg.payload !== undefined) {
                this.selection = msg.payload
                this.loading = false
            }
        },
        onLoad (msg) {
            // update vuex store to reflect server-state
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
            // make sure we've got the relevant option selected on load of the page
            if (msg?.payload !== undefined) {
                this.selection = msg.payload
            }
        },
        onChange (val) {
            // only runs when clicked/changed in UI.
            // inverted as the store doesn't quite update quick enough, but this is reliable method
            this.$socket.emit('widget-change', this.id, val)
        },
        toggle () {
            if (this.props.decouple) {
                this.loading = true
            } else {
                this.status = !this.status
                this.$socket.emit('widget-change', this.id, this.status)
            }
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
.nrdb-switch .v-switch {
    flex-grow: 0;
}
.nrdb-switch .v-selection-control {
    justify-content: flex-end;
}
.nrdb-switch.nrdb-nolabel .v-selection-control {
    justify-content: center;
}
.nrdb-switch > .v-progress-circular > svg {
    width: 24px;
    height: 24px;
}
</style>
