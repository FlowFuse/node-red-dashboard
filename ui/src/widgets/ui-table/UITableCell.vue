<template>
    <template v-if="type === 'row'">
        {{ row }}
    </template>
    <template v-else-if="type === 'html'">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <pre style="white-space: pre-wrap" v-html="value" />
    </template>
    <template v-else-if="type === 'link'">
        <a :href="value">{{ value }}</a>
    </template>
    <template v-else-if="type === 'color'">
        <i class="nrdb-ui-table-cell-color-spot" :style="{'background-color': value}" />
    </template>
    <template v-else-if="type === 'tickcross'">
        <v-icon class="nrdb-ui-table-cell-bool" :icon="value ? 'mdi-check-bold' : 'mdi-close-thick'" />
    </template>
    <template v-else-if="type === 'progress'">
        <v-progress-linear v-model="value" color="primary" :height="8" />
    </template>
    <template v-else-if="type === 'sparkline-trend'">
        <!-- eslint-disable-next-line vuetify/no-deprecated-components -->
        <v-sparkline v-model="value" color="primary" :padding="2" line-width="6" />
    </template>
    <template v-else-if="type === 'sparkline-bar'">
        <!-- eslint-disable-next-line vuetify/no-deprecated-components -->
        <v-sparkline v-model="value" type="bar" color="primary" :padding="2" line-width="16" />
    </template>
    <template v-else>
        {{ value }}
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
        item: {
            type: Object,
            required: true
        },
        property: {
            type: String,
            required: true
        }
    },
    emits: ['update:modelValue'],
    computed: {
        value: {
            get () {
                // get nested property from item
                const keys = this.property.split('.')
                const value = keys.reduce((val, key) => {
                    return val?.[key] ?? null
                }, this.item)
                return value
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
