<template>
    <slot name="header">
        <h4>Property Migration Status</h4>
    </slot>
    <slot name="description">
        <p>
            The following table lists the Dashboard 1.0 properties,
            and details any changes, or whether that property has not
            yet been migrated, into Dashboard 2.0.
        </p>
    </slot>
    <table class="migration-properties">
        <thead>
            <tr>
                <th>Property</th>
                <th v-if="!hideStatus">Status</th>
                <th>Notes</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="row in properties" :key="row.property">
                <td style="text-wrap: nowrap;">{{ row.property }}</td>
                <td v-if="!hideStatus" style="text-wrap: nowrap;">
                    <template v-if="typeof row.changes === 'string'">{{ row.changes }}</template>
                    <span v-else-if="row.changes === -1" class="not-supported">not yet supported</span>
                    <span v-else-if="row.changes === -2" class="not-supported">partly supported</span>
                    <span v-else-if="row.changes === -3" class="not-supported">no plan to support</span>
                    <span v-else class="no-changes">no changes</span>
                </td>
                <td style="width: 100%;" v-html="row.notes"></td>
            </tr>
        </tbody>
    </table>
</template>

<script>
export default {
    name: 'PropertyMigrationTable',
    props: {
        properties: {
            type: Array,
            required: true
        },
        hideStatus: {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style scoped>

table.migration-properties {
    width: 100%;
}
table.migration-properties td {
    vertical-align: baseline;
}
.not-supported {
    font-style: italic;
}
.no-changes {
    font-style: italic;
    opacity: 0.4;
}
</style>