<template>
    <table style="width: 100%;">
        <thead>
            <tr>
                <th>Property</th>
                <th>Changes</th>
                <th>Notes</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="row in properties" :key="row.property">
                <td>{{ row.property }}</td>
                <td>{{ row.changes }}</td>
                <td>{{ row.notes }}</td>
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
        }
    }
}
</script>