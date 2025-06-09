<template>
    <v-progress-linear
        v-model="value"
        :disabled="!state.enabled"
        :class="className"
        :color="color || 'primary'"
        height="20"
    >
        <template v-if="label" #default="{ value: progressValue }">
            <strong>{{ label }}: {{ Math.ceil(progressValue) }}%</strong>
        </template>
    </v-progress-linear>
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

<style scoped></style>
