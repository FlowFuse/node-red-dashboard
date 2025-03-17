export default {
    data () {
        return {
            pageGroups: [],
            groupDragging: {
                active: false,
                index: -1,
                dropIndex: -1,
                id: null
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
        onGroupDragStart (event, index, item) {
            console.log('onGroupDragStart', index)
            this.groupDragging.active = true
            this.groupDragging.id = item.id
            this.groupDragging.index = index
            this.groupDragging.dropIndex = index
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
        onGroupDragOver (event, index, item) {
            event.preventDefault()
            if (this.groupDragging.active === false) { return }
            event.dataTransfer.dropEffect = 'move'
            // update drop index
            if (index !== this.groupDragging.index) {
                this.groupDragging.dropIndex = index
            }
            // ensure the mouse is over a different group
            if (this.groupDragging.index === index || this.groupDragging.index < 0) {
                return
            }

            // ensure the mouse is within the bounds of the source group size
            // to avoid flip-flop when the target group is larger than the source group
            const sourceGroup = this.pageGroups[this.groupDragging.index]
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

            if (this.groupDragging.index >= 0) {
                this.moveGroup(this.groupDragging.index, index)
            }
        },
        onGroupDragLeave (event, index, item) {
            this.groupDragging.dropIndex = -1
        },
        onGroupDragEnd (event, index, item) {
            this.groupDragging.active = false
            this.groupDragging.id = null
            this.groupDragging.index = -1
            this.groupDragging.dropIndex = -1
        },
        moveGroup (fromIndex, toIndex) {
            const movedItem = this.pageGroups.splice(fromIndex, 1)[0]
            this.pageGroups.splice(toIndex, 0, movedItem)
            // update .order property of all groups
            this.pageGroups.forEach((group, index) => {
                group.order = index + 1
            })
            this.groupDragging.index = toIndex
        },
        getGroupDragDropClass (group) {
            if (this.isDraggingGroup(group)) {
                return 'drag-start'
            }
            return ''
        },
        isDraggingGroup (group) {
            // TODO: simplify by checking item id instead
            if (!this.groupDragging.active) {
                return false
            }
            const dragging = this.pageGroups[this.groupDragging.index]
            if (dragging?.id === group?.id) {
                return true
            }
            return false
        }
    }
}
