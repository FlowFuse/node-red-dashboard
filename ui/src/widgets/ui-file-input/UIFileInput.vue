<template>
    <div class="nrdb-ui-file-input">
        <v-file-input
            v-if="!uploading && !uploaded"
            v-model="files"
            density="compact"
            :disabled="!state.enabled"
            :label="label" :prepend-icon="icon"
            :accept="accept"
            :multiple="multiple"
            variant="outlined"
            hide-details="auto"
            :rules="[maxFileSize]"
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
            <label class="v-label">File<template v-if="multiple">s</template> Uploaded!</label>
            <label class="v-label" @click="reset()">
                <a class="nrdb-anchor">Upload Another File</a>
            </label>
        </div>
        <v-btn variant="flat" :disabled="!canUpload" @click="upload(files)">
            {{ uploading ? 'Uploading...' : 'Upload' }}
        </v-btn>
    </div>
</template>

<script>
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUIFileInput',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    setup (props) {
        this.$dataTracker(props.id)
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
            return this.props.allowMultiple
        },
        canUpload: function () {
            // no file selected yet
            if (!this.files || (Array.isArray(this.files) && !this.files.length)) return false

            let tooLarge = false
            if (Array.isArray(this.files)) {
                tooLarge = this.files.some(file => file.size > this.props.maxFileSize)
            } else {
                tooLarge = this.files.size > this.props.maxFileSize
            }

            if (tooLarge) return false

            return !this.uploading && !this.uploaded
        }
    },
    methods: {
        formatFileSize (bytes) {
            if (bytes === 0) return '0 Bytes'
            const k = 1000
            const dm = 2
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            const i = Math.floor(Math.log(bytes) / Math.log(k))
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
        },
        reset: function () {
            this.files = null
            this.uploading = false
            this.uploaded = false
            this.progress = 0
        },
        uploadFile (file) {
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

            this.uploading = true

            // readAsText alternative?
            reader.readAsArrayBuffer(file)
        },
        upload: function (files) {
            if (Array.isArray(files)) {
                files.forEach(file => this.uploadFile(file))
            } else {
                this.uploadFile(files)
            }
        },
        send (msg) {
            this.$socket.emit('widget-send', this.id, msg)
        },
        maxFileSize (files) {
            if (files) {
                const size = files[0]?.size
                const maxSize = this.props.maxFileSize
                return !files || !files.length || size < maxSize || `File size should be less than ${this.formatFileSize(maxSize)}!`
            }
        }
    }
}
</script>

<style>
.nrdb-ui-file-input {
    display: flex;
    gap: 12px;
}
.nrdb-ui-file-input .v-btn {
    max-height: var(--widget-row-height);
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
