<template>
    <div class="nrdb-ui-file-input">
        <v-file-input
            v-if="!uploading && !uploaded"
            v-model="files"
            density="compact"
            :disabled="!state.enabled"
            :label="label" :prepend-icon="icon"
            :accept="accept"
            variant="outlined"
            hide-details="auto"
        />
        <div v-else-if="!uploaded" class="nrdb-ui-file-input--progress">
            <v-progress-linear :model-value="progress" :height="24">
                <template #default="{ value }">
                    <strong>{{ Math.ceil(value) }}%</strong>
                </template>
            </v-progress-linear>
        </div>
        <div v-else class="nrdb-ui-file-input--uploaded">
            <v-icon icon="mdi-check-circle" color="success" />
            <label class="v-label">File Uploaded!</label>
            <label class="v-label" @click="reset()">
                <a class="nrdb-anchor">Upload Another File</a>
            </label>
        </div>
        <v-btn variant="flat" :disabled="!files || uploading || uploaded" @click="upload(files)">
            {{ uploading ? 'Uploading...' : 'Upload' }}
        </v-btn>
    </div>
</template>

<script>

import { useDataTracker } from '../data-tracker.mjs' // eslint-disable-line import/order
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUIFileInput',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    setup (props) {
        useDataTracker(props.id)
    },
    data () {
        return {
            files: null,
            uploading: false,
            uploaded: false,
            progress: 0
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        icon: function () {
            const icon = this.props.icon
            return icon ? 'mdi-' + icon.replace(/^mdi-/, '') : null
        },
        accept: function () {
            return this.props.accept
        },
        label: function () {
            return this.props.label
        },
        showFileSize: function () {
            return this.props.showFileSize
        },
        multiple: function () {
            return this.props.multiple
        }
    },
    methods: {
        reset: function () {
            this.files = null
            this.uploading = false
            this.uploaded = false
            this.progress = 0
        },
        upload: function (file) {
            if (file && !this.multiple) {
                // Create a FileReader instance to read the file
                const reader = new FileReader()

                // When the file is read, send it to Node-RED
                reader.onload = () => {
                    // Prepare the payload to send
                    const msg = {
                        payload: file, // File content
                        file: {
                            name: file.name, // File name
                            size: file.size, // File size
                            type: file.type // File type
                        }
                    }

                    this.uploading = false
                    this.uploaded = true

                    this.send(msg)
                }

                // Track progress of file reading
                reader.onprogress = (event) => {
                    this.progress = event.loaded // Update progress
                }
                this.uploading = true

                // readAsText alternative?
                reader.readAsArrayBuffer(file)
            }
        },
        send (msg) {
            this.$socket.emit('widget-send', this.id, msg)
        }
    }
}
</script>

<style>
.nrdb-ui-file-input {
    display: flex;
    gap: 12px;
}
.nrdb-ui-file-input--progress {
    width: 100%;
    display: flex;
    align-items: center;
}
.nrdb-ui-file-input--uploaded {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;
    height: var(--widget-row-height);
}
</style>
