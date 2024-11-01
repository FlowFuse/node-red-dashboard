import { editKey, editMode, editPage, editorPath, exitEditMode, isTrackingEdits, originalGroups, startEditTracking, updateEditTracking } from '../../EditTracking.js'
import NodeRedApi from '../../api/node-red'

import DraggableMixin from './draggable.js'
import ResizableMixin from './resizable.js'

export default {
    mixins: [DraggableMixin, ResizableMixin],
    data () {
        return {
            pageGroups: []
        }
    },
    computed: {
        dirty () {
            if (!this.editMode || !isTrackingEdits.value) {
                return false
            }
            return JSON.stringify(this.pageGroups) !== JSON.stringify(originalGroups.value)
        },
        editMode: function () {
            return editMode.value && editPage.value === this.$route.meta.id
        }
    },
    methods: {
        initializeEditTracking () {
            if (this.editMode && !isTrackingEdits.value) {
                startEditTracking(this.pageGroups)
            }
        },
        acceptChanges () {
            updateEditTracking(this.pageGroups)
        },
        exitEditMode () {
            const url = new URL(window.location.href)
            url.searchParams.delete('edit-key')
            const query = { ...this.$route.query }
            delete query['edit-key']
            this.$router.replace({ query })
            window.history.replaceState({}, document.title, url)
            exitEditMode() // EditTracking method
        },
        revertEdits () {
            this.pageGroups = JSON.parse(JSON.stringify(originalGroups.value))
        },
        deployChanges ({ dashboard, page, groups }) {
            return NodeRedApi.deployChanges({ dashboard, page, groups, key: editKey.value, editorPath: editorPath.value })
        }
    }
}
