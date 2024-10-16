<template>
    <v-dialog v-model="visible" max-width="500">
        <v-card :title="title" :text="message" :prepend-icon="icon">
            <v-card-actions>
                <v-btn v-if="cancelButton !== null" variant="flat" color="primary" @click="_cancel">{{ cancelButton }}</v-btn>
                <v-btn v-if="okButton !== null" variant="flat" color="warning" @click="_confirm">{{ okButton }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>

export default {
    name: 'ConfirmDialog',
    data: () => ({
        visible: false,
        title: undefined,
        message: undefined,
        okButton: undefined,
        cancelButton: undefined,
        closeOnOk: true,

        // Private variables
        resolvePromise: undefined,
        rejectPromise: undefined
    }),

    methods: {
        show (opts = {}) {
            this.title = opts.title
            this.icon = opts.icon ?? 'mdi-alert-circle-outline'
            this.message = opts.message
            this.cancelButton = opts.cancelButton
            this.okButton = opts.okButton
            this.closeOnOk = opts.closeOnOk ?? true
            if (this.cancelButton === 'undefined') {
                this.cancelButton = 'Cancel'
            }
            if (this.okButton === 'undefined') {
                this.okButton = 'OK'
            }
            if (this.okButton === null && this.cancelButton === null) {
                this.okButton = 'Close'
            }
            this.visible = true
            // Return promise so the caller can get results
            return new Promise((resolve, reject) => {
                this.resolvePromise = resolve
                this.rejectPromise = reject
            })
        },

        close (resolveValue = false) {
            this.visible = false
            this.resolvePromise(resolveValue)
        },

        _confirm () {
            if (this.closeOnOk) {
                this.visible = false
            }
            this.resolvePromise(true)
        },

        _cancel () {
            this.visible = false
            this.resolvePromise(false) // resolve with false
            // Or throw an error using: this.rejectPromise(new Error('User canceled the dialog'))
        }
    }
}
</script>

<style scoped>
button.v-btn {
    /* consistent height and width regardless of theme settings */
    min-height: unset !important;
    height: 2.4em;
    min-width: 6em;
}
</style>
