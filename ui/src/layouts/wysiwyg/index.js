export default {
    data () {
        return {
            dragging: {
                index: -1
            }
        }
    },
    methods: {
        onDragStart (event, index) {
            this.dragging.index = index
            event.dataTransfer.effectAllowed = 'move'
        },
        onDragOver (event, index) {
            if (this.dragging.index >= 0) {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
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
            const movedItem = this.groups.splice(fromIndex, 1)[0]
            this.groups.splice(toIndex, 0, movedItem)
            // update .order property of all groups
            this.groups.forEach((group, index) => {
                group.order = index + 1
            })
            this.dragging.index = toIndex
        },
        onGroupResize (opts) {
            this.groups[opts.index].width = opts.width
        }
    }
}
