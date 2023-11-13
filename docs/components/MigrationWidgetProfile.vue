<template>
    <template v-if="profile">
        <p v-if="profile.description">{{ profile.description }}</p>
        <PropertyMigrationTable :properties="profile.properties" />
        <PropertyMigrationTable v-if="profile.new_properties"
            :hide-status="true"
            :properties="profile.new_properties">
            <template #header>
                <h4>New Properties</h4>
            </template>
            <template #description>
                <p>
                    The following details newly implemented properties
                    and features in Dashboard 2.0 for this node.
                </p>
            </template>
        </PropertyMigrationTable>
        <PropertyMigrationTable v-if="profile.msgs"
            :properties="profile.msgs">
            <template #header>
                <h4>Message Options</h4>
            </template>
            <template #description>
                <p>
                    The following are Dashboard 1.0 <code>msg.&lt;property&gt;</code> values that could be sent to the node to affect functionality & contents of the node.
                </p>
            </template>
        </PropertyMigrationTable>
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
