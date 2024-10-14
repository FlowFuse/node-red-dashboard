<template>
    <div class="nrdb-ui-editor-tray-container">
        <div class="nrdb-ui-editor-tray">
            <v-btn v-tooltip="'Leave Edit Mode'" :disabled="saveBusy" variant="outlined" icon="mdi-close" color="warning" @click="cancel" />
            <v-btn v-tooltip="'Discard Changes'" :disabled="!dirty || saveBusy" variant="outlined" color="secondary" icon="mdi-arrow-u-left-top" @click="discard" />
            <v-btn v-tooltip="'Save Changes'" :disabled="!dirty || saveBusy" variant="flat" icon="mdi-content-save-outline" color="success" :loading="saveBusy" @click="save" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'EditControls',
    props: {
        dirty: {
            type: Boolean,
            default: false
        },
        saveBusy: {
            type: Boolean,
            default: false
        }
    },
    emits: ['cancel', 'discard', 'save'],
    methods: {
        cancel () {
            this.$emit('cancel')
        },
        discard () {
            this.$emit('discard')
        },
        save () {
            this.$emit('save')
        }
    }
}
</script>

<style scoped lang="scss">
.nrdb-ui-editor-tray-container {
    position: fixed;
    bottom: 24px;
    width: 100%;
    display: flex;
    justify-content: center;
}
.nrdb-ui-editor-tray {
    background-color: white;
    border: 1px solid #ccc;
    box-shadow: 0px 0px 5px #00000021;
    padding: 12px;
    border-radius: 4px;
    display: flex;
    gap: 6px;
    border-radius: 2rem;
    .v-btn {
        border-radius: 2rem;
    }
    button:disabled {
        filter: grayscale(1);
    }
}
</style>
