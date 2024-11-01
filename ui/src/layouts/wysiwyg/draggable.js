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
    methods: {
        // Drag and Drop placement methods
        /**
         * Event handler for dragstart event
         * @param {DragEvent} event - The drag event
         * @param {Number} index - The index of the group
         */
        onDragStart (event, index) {
            this.dragging.active = true
            this.dragging.index = index
            this.dragging.dropIndex = index
            event.dataTransfer.effectAllowed = 'move'
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
            event.preventDefault()
            if (this.dragging.active === false) { return }
            event.dataTransfer.dropEffect = 'move'
            // update drop index
            if (index !== this.dragging.index) {
                this.dragging.dropIndex = index
            }
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
                this.moveGroup(this.dragging.index, index)
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
        getDragDropClass (group) {
            if (this.isDragging(group)) {
                return 'drag-start'
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
