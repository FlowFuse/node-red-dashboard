<template>
    <template v-if="profile">
        <p v-if="profile.description">{{ profile.description }}</p>
        <PropertyMigrationTable :properties="profile.properties" />
    </template>
    <template v-else>
        <p><i>This node has not yet been migrated to Dashboard 2.0</i></p>
    </template>
</template>

<script>
import PropertyMigrationTable from './MigrationPropertyTable.vue'

export default {
    name: 'MigrationProfile',
    props: {
        profile: {
            type: Object
        }
    },
    components: {
        PropertyMigrationTable
    }
}
</script>