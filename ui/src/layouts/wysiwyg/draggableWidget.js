export default {
    data () {
        return {
            widgetDragging: {
                active: false,
                widgetId: null,
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
        onWidgetDragStart (event, index, item) {
            this.widgetDragging.active = true
            this.widgetDragging.widgetId = item.id
            this.widgetDragging.index = index
            this.widgetDragging.dropIndex = index
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
        onWidgetDragOver (event, index, item) {
            event.preventDefault()
            if (this.widgetDragging.active === false) { return }
            event.dataTransfer.dropEffect = 'move'
            // update drop index
            if (index !== this.widgetDragging.index) {
                this.widgetDragging.dropIndex = index
            }
            // ensure the mouse is over a different widget
            if (this.widgetDragging.index === index || this.widgetDragging.index < 0) {
                return
            }

            // ensure the mouse is within the bounds of the source group size
            // to avoid flip-flop when the target group is larger than the source group
            const source = this.widgets[this.widgetDragging.index]
            const sourceId = `nrdb-ui-widget-${source.id}`
            const sourceEl = document.getElementById(sourceId)
            const sourceBounds = sourceEl.getBoundingClientRect()
            const target = this.widgets[index]
            const targetId = `nrdb-ui-widget-${target.id}`
            const targetEl = document.getElementById(targetId)
            const targetBounds = targetEl.getBoundingClientRect()
            const hitBoundX1 = targetBounds.left
            const hitBoundX2 = targetBounds.left + sourceBounds.width
            const hitBoundY1 = targetBounds.top
            const hitBoundY2 = targetBounds.top + sourceBounds.height
            if (event.clientX < hitBoundX1 || event.clientX > hitBoundX2 || event.clientY < hitBoundY1 || event.clientY > hitBoundY2) {
                return
            }

            if (this.widgetDragging.index >= 0) {
                this.moveWidget(this.widgetDragging.index, index)
            }
        },
        onWidgetDragLeave (event, index, item) {
            this.widgetDragging.dropIndex = -1
        },
        onWidgetDragEnd (event, index, item) {
            this.widgetDragging.active = false
            this.widgetDragging.widgetId = null
            this.widgetDragging.index = -1
            this.widgetDragging.dropIndex = -1
        },
        moveWidget (fromIndex, toIndex) {
            const movedItem = this.widgets.splice(fromIndex, 1)[0]
            this.widgets.splice(toIndex, 0, movedItem)
            // update .order property of widgets
            this.widgets.forEach((widget, index) => {
                widget.props.order = index + 1
                widget.layout.order = index + 1
            })
            this.widgetDragging.index = toIndex
        },
        getWidgetDragDropClass (item) {
            if (this.isDraggingWidget(item)) {
                return 'drag-start'
            }
            return ''
        },
        getWidgetResizingClass (item) {
            if (this.isResizingWidget(item)) {
                return 'resizing'
            }
            return ''
        },
        isDraggingWidget (widget) {
            if (!this.widgetDragging.active) {
                return false
            }
            return this.widgetDragging.widgetId === widget.id
        },
        isResizingWidget (widget) {
            if (!this.widgetResizing.active) {
                return false
            }
            return this.widgetResizing.widgetId === widget.id
        }
    }
}
