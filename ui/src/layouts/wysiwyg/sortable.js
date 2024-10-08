const sortable = {
    data () {

    },
    created: (el, binding) => {
        console.log(binding.instance)
        function onDragStart (event, index) {
            this.dragging.index = index
            event.dataTransfer.effectAllowed = 'move'
        }

        function onDragOver (event, index) {
            if (this.dragging.index >= 0) {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
                this.moveGroup(this.dragging.index, index)
            }
        }

        function onDrop (event, index) {
            event.preventDefault()
            if (this.dragging.index >= 0) {
                this.moveGroup(this.dragging.index, index)
                this.dragging.index = -1
            }
        }

        function onDragEnd (event, index) {
            this.dragging.index = -1
        }

        el.addEventListener('dragstart', onDragStart)
        el.addEventListener('dragover', onDragOver)
        el.addEventListener('drop', onDrop)
        el.addEventListener('dragend', onDragEnd)
    }
}

export default sortable
