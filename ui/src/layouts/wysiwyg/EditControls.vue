<template>
    <div class="nrdb-ui-editor-tray-container">
        <div class="nrdb-ui-editor-tray">
            <v-btn v-tooltip="'Leave Edit Mode'" :disabled="saveBusy" variant="outlined" icon="mdi-close" color="red-darken-1" @click="cancel" />
            <v-btn v-tooltip="'Discard Changes'" :disabled="!dirty || saveBusy" variant="outlined" color="blue" icon="mdi-arrow-u-left-top" @click="discard" />
            <v-btn v-tooltip="'Save Changes'" :disabled="!dirty || saveBusy" variant="outlined" icon="mdi-content-save-outline" color="green" :loading="saveBusy" @click="save" />
        </div>
        <div class="nrdb-edit-mode--message">In Edit Mode</div>
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
    top: 0;
    z-index: 1000;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    --shadow: 0px 0px 5px #000000de;
    width: fit-content;
    left: 50%;
    right: 50%;
    transform: translate(-50%);
}
.nrdb-ui-editor-tray {
    background-color: white;
    border: 1px solid #ccc;
    padding: 6px 12px;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    display: flex;
    gap: 12px;
    box-shadow: var(--shadow);
    z-index: 2;
    .v-btn {
        border-radius: 2.6rem;
        // override theme for consistent button size
        width: 2.6rem;
        height: 2.6rem;
        min-width: 2.6rem;
        min-height: 2.6rem;
    }
    button:disabled {
        filter: grayscale(1);
    }
}
.nrdb-edit-mode--message {
    padding: 3px 9px;
    font-size: 0.875rem;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    background-color: rgb(var(--v-theme-navigation-background));
    color: rgba(var(--v-theme-on-navigation-background),var(--v-high-emphasis-opacity));
    box-shadow: var(--shadow);
}
</style>
