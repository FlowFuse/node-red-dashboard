<template>
    <template v-if="type === 'row'">
        {{ row }}
    </template>
    <template v-else-if="type === 'html'">
        <pre style="white-space: pre-wrap" v-html="localValue" />
    </template>
    <template v-else-if="type === 'link'">
        <a :href="localValue">{{ localValue }}</a>
    </template>
    <template v-else-if="type === 'color'">
        <i class="nrdb-ui-table-cell-color-spot" :style="{'background-color': localValue}" />
    </template>
    <template v-else-if="type === 'tickcross'">
        <v-icon class="nrdb-ui-table-cell-bool" :icon="localValue ? 'mdi-check-bold' : 'mdi-close-thick'" />
    </template>
    <template v-else-if="type === 'progress'">
        <v-progress-linear v-model="localValue" color="primary" :height="8" />
    </template>
    <template v-else-if="type === 'sparkline-trend'">
        <!-- eslint-disable-next-line vuetify/no-deprecated-components -->
        <v-sparkline v-model="localValue" color="primary" :padding="2" line-width="6" />
    </template>
    <template v-else-if="type === 'sparkline-bar'">
        <!-- eslint-disable-next-line vuetify/no-deprecated-components -->
        <v-sparkline v-model="localValue" type="bar" color="primary" :padding="2" line-width="16" />
    </template>
    <template v-else>
        {{ localValue }}
    </template>
</template>

<script>
export default {
    name: 'UITableCell',
    props: {
        row: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            default: 'text'
        },
        value: {
            type: [String, Boolean, Number, Object, Array],
            required: true
        }
    },
    emits: ['update:modelValue'],
    computed: {
        localValue: {
            get () {
                return this.value
            },
            set (value) {
                this.$emit('update:modelValue', value)
            }
        }
    }
}
</script>

<style>
.nrdb-ui-table-cell-bool.mdi-check-bold {
    color: #24aa69;
}
.nrdb-ui-table-cell-bool.mdi-close-thick {
    color: red;
}
.nrdb-ui-table-cell-color-spot {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    margin-right: 8px;
}
</style>
