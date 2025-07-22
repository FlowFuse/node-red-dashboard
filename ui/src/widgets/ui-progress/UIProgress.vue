<template>
    <div class="nrdb-ui-progress-wrapper" :style="{ 'border-color': color ? color : 'rgb(var(--v-theme-primary))' }">
        <v-progress-linear
            v-model="value"
            :disabled="!state.enabled"
            :class="className"
            :color="color || 'primary'"
            :height="'100%'"
        >
            <template v-if="label" #default="{ value: progressValue }">
                <strong>{{ label }}: {{ Math.ceil(progressValue) }}%</strong>
            </template>
        </v-progress-linear>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'DBUIProgress',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    computed: {
        ...mapState('data', ['messages']),
        value: function () {
            const payload = this.messages[this.id]?.payload
            return typeof payload === 'number' ? payload : 0
        },
        label: function () {
            return this.getProperty('label')
        },
        color: function () {
            return this.getProperty('color')
        }
    },
    created () {
        this.$dataTracker(this.id, null, null, this.onDynamicProperties)
    },
    methods: {
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (!updates) {
                return
            }
            this.updateDynamicProperty('label', updates.label)
            this.updateDynamicProperty('color', updates.color)
        }
    }
}
</script>

<style lang="scss">
.nrdb-ui-progress-wrapper {
    height: 100%;
    padding: 3px;
    border-radius: 3px;
    border-style: solid;
    border-width: 1px;
}
// class auto-added by the layout engine
.nrdb-ui-progress {
    display: flex;
    align-items: center;
}
.nrdb-ui-progress .v-progress-linear {
    height: 100% !important;
}
</style>
