<template>
    <div class="nrdb-ui-button-group-wrapper">
        <label v-if="props.label" class="v-label">
            {{ props.label }}
        </label>
        <v-btn-toggle v-model="selection" mandatory divided :rounded="props.rounded ? 'xl' : ''" :color="selectedColor" @update:model-value="onChange(selection)">
            <v-btn v-for="option in props.options" :key="option.value" :value="option.value">
                <template v-if="option.icon && option.label !== ''" #prepend>
                    <v-icon size="x-large" :icon="`mdi-${option.icon.replace(/^mdi-/, '')}`" />
                </template>
                <v-icon v-if="option.icon && !option.label" :icon="`mdi-${option.icon.replace(/^mdi-/, '')}`" size="x-large" />
                {{ option.label }}
            </v-btn>
        </v-btn-toggle>
    </div>
</template>

<script>
import { mapState } from 'vuex'

import { useDataTracker } from '../data-tracker.mjs'

export default {
    name: 'DBUIButtonGroup',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            selection: null
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        selectedColor: function () {
            if (this.selection !== null && this.props.useThemeColors === false) {
                return this.findOptionByValue(this.selection)?.color
            } else {
                return 'rgb(var(--v-theme-primary))'
            }
        },
        variant: function () {
            return this.look === 'default' ? null : this.look
        }
    },
    created () {
        // can't do this in setup as we are using custom onInput function that needs access to 'this'
        useDataTracker(this.id, this.onInput, this.onLoad)

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
            this.selection = msg.payload
        },
        onLoad (msg) {
            // update vuex store to reflect server-state
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
            // make sure we've got the relevant option selected on load of the page
            this.selection = msg.payload
        },
        onChange (value) {
            if (value !== null && typeof value !== 'undefined') {
                // Tell Node-RED a new value has been selected
                this.$socket.emit('widget-change', this.id, value)
            }
        },
        findOptionByValue: function (val) {
            const opt = this.props.options?.find(option => {
                if (typeof (val) === 'object') {
                    return (JSON.stringify(val) === JSON.stringify(option.value))
                } else {
                    return option.value === val
                }
            })
            if (opt) {
                return opt
            }
            return null
        }
    }
}
</script>

<style scoped>
.nrdb-ui-button-group-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}

.nrdb-ui-button-group-wrapper .v-chip__content{
    white-space: normal;
}
.nrdb-ui-button-group-wrapper .v-btn-group {
    width: max-content;
    border-width: thin;
    border-color: rgba(var(--v-border-color), var(--v-border-opacity));
}
/* default styling for an unselected option */
.nrdb-ui-button-group-wrapper .v-btn--variant-elevated {
   color: rgb(var(--v-theme-on-group-background));
   background-color: rgb(var(--v-theme-group-background));
}

.nrdb-ui-button-group-wrapper .v-btn--variant-elevated {
    --v-activated-opacity: 0;
}

.nrdb-ui-button-group-wrapper .icon-only .v-btn__prepend {
    margin-inline: 0;
}
</style>
