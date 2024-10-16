import { editKey, editMode, editPage, exitEditMode, isTrackingEdits, originalGroups, startEditTracking, updateEditTracking } from '../../EditTracking.js'
import NodeRedApi from '../../api/node-red'

export default {
    data () {
        return {
            pageGroups: [],
            dragging: {
                active: false,
                index: -1,
                dropIndex: -1
            }
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
            return NodeRedApi.deployChanges({ dashboard, page, groups, key: editKey.value })
        },
        /**
         * Event handler for dragstart event
         * @param {DragEvent} event - The drag event
         * @param {Number} index - The index of the group
         */
        onDragStart (event, index) {
            this.dragging.active = true
            this.dragging.index = index
            this.dragging.dropIndex = index
            event.dataTransfer.effectAllowed = 'all'
            event.dataTransfer.dropEffect = 'move'
            event.stopPropagation()
            return false
        },
        /**
         * Event handler for dragover event
         * @param {DragEvent} event - The drag event
         * @param {Number} index - The index of the group
         */
        onDragOver (event, index, group) {
            if (this.dragging.active === false) { return }
            // ensure the mouse is over a different group
            if (index !== this.dragging.index) {
                this.dragging.dropIndex = index
            }
            if (this.dragging.index === index || this.dragging.index < 0) {
                event.dataTransfer.dropEffect = 'none'
                return
            }
            console.log('onDragOver index', index, 'group', group)
            event.dataTransfer.dropEffect = 'move'
            if (this.dragging.index >= 0) {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'drop'
            }
        },
        onDrop (event, index, group) {
            if (this.dragging.active === false) { return }
            this.dragging.dropIndex = index
            event.preventDefault()
            if (this.dragging.index >= 0) {
                this.moveGroup(this.dragging.index, this.dragging.dropIndex)
                this.dragging.active = false
                this.dragging.index = -1
                this.dragging.dropIndex = -1
            }
        },
        onDragLeave (event, index, group) {
            this.dragging.dropIndex = -1
        },
        onDragEnd (event, index, group) {
            this.dragging.active = false
            this.dragging.index = -1
            this.dragging.dropIndex = -1
        },
        moveGroup (fromIndex, toIndex) {
            const movedItem = this.pageGroups.splice(fromIndex, 1)[0]
            this.pageGroups.splice(toIndex, 0, movedItem)
            // update .order property of all groups
            this.pageGroups.forEach((group, index) => {
                group.order = index + 1
            })
            this.dragging.index = toIndex
        },
        onGroupResize (opts) {
            // ensure opts.width is a number and is greater than 0
            if (typeof opts.width !== 'number' || opts.width < 1) {
                return
            }
            this.pageGroups[opts.index].width = opts.width
        },
        getDragDropClass (group) {
            if (this.isDragging(group)) {
                return 'drag-start'
            }
            const targetGroup = this.pageGroups[this.dragging.dropIndex]
            if (targetGroup?.id === group?.id) {
                return 'drag-over'
            }
            return ''
        },
        isDragging (group) {
            if (!this.dragging.active) {
                return false
            }
            const dragging = this.pageGroups[this.dragging.index]
            if (dragging?.id === group?.id) {
                return true
            }
            return false
        }
    }
}
