import { editKey, editMode, editPage, exitEditMode, isTrackingEdits, originalGroups, startEditTracking, updateEditTracking } from '../../EditTracking.js'
import NodeRedApi from '../../api/node-red'

export default {
    data () {
        return {
            pageGroups: [],
            dragging: {
                index: -1
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
            this.dragging.index = index
            event.dataTransfer.effectAllowed = 'move'
        },
        /**
         * Event handler for dragover event
         * @param {DragEvent} event - The drag event
         * @param {Number} index - The index of the group
         */
        onDragOver (event, index) {
            // ensure the mouse is over a different group
            if (this.dragging.index === index || this.dragging.index < 0) {
                return
            }
            // ensure the mouse is within the bounds of the source group size
            // to avoid flip-flop when the target group is larger than the source group
            const sourceGroup = this.pageGroups[this.dragging.index]
            const sourceId = `nrdb-ui-group-${sourceGroup.id}`
            const sourceEl = document.getElementById(sourceId)
            const sourceBounds = sourceEl.getBoundingClientRect()
            const targetGroup = this.pageGroups[index]
            const targetId = `nrdb-ui-group-${targetGroup.id}`
            const targetEl = document.getElementById(targetId)
            const targetBounds = targetEl.getBoundingClientRect()
            const hitBoundX1 = targetBounds.left
            const hitBoundX2 = targetBounds.left + sourceBounds.width
            const hitBoundY1 = targetBounds.top
            const hitBoundY2 = targetBounds.top + sourceBounds.height
            if (event.clientX < hitBoundX1 || event.clientX > hitBoundX2 || event.clientY < hitBoundY1 || event.clientY > hitBoundY2) {
                return
            }

            if (this.dragging.index >= 0) {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'drop'
                this.moveGroup(this.dragging.index, index)
            }
        },
        onDrop (event, index) {
            event.preventDefault()
            if (this.dragging.index >= 0) {
                this.moveGroup(this.dragging.index, index)
                this.dragging.index = -1
            }
        },
        onDragEnd (event, index) {
            this.dragging.index = -1
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
        isDragging (group) {
            const dragging = this.pageGroups[this.dragging.index]
            if (dragging?.id === group?.id) {
                return true
            }
            return false
        },
        getElementBounds (id) {
            const sourceGroup = this.pageGroups[this.dragging.index]
            const sourceId = `nrdb-ui-group-${sourceGroup.id}`
            const sourceEl = document.getElementById(sourceId)
            const sourceBounds = sourceEl.getBoundingClientRect()
            return sourceBounds
        }
    }
}
