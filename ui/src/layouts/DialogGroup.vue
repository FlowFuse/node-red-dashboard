<!-- eslint-disable vue/html-self-closing -->
<template>
    <v-dialog v-if="group.groupType === 'dialog'" v-model="isActive" max-width="500">
        <v-card title="Dialog">
            <template v-if="group.showTitle" #title>
                {{ group.name }}
            </template>
            <template #append>
                <v-btn variant="plain" density="compact" icon="mdi-close" @click="isActive = false" />
            </template>
            <template #text>
                <slot></slot>
            </template>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'DialogGroup',
    props: {
        group: {
            type: Object,
            required: true
        },
        widgetsByGroup: {
            type: Function,
            required: true
        }
    },
    data () {
        return {
            isActive: false
        }
    },
    computed: {
        showDialogState () {
            return this.group.showDialog
        }
    },
    watch: {
        showDialogState: {
            handler (val) {
                const state = val.split('-')[0] === 'true'
                // Close the dialog if it's already opened by ui-control
                if (state === this.isActive) {
                    this.isActive = !this.isActive
                }
                this.isActive = state
            }
        }
    }
}
</script>
