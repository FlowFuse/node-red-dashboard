export default {
    data () {
        return {
            pageGroups: [],
            resizing: {
                active: false,
                init: {
                    x: 0,
                    y: 0,
                    columns: 0,
                    rows: 0,
                    width: 0,
                    height: 0
                },
                current: {
                    columns: null,
                    rows: null,
                    width: null
                }
            }
        }
    },
    watch: {
        'resizing.active' (active) {
            // add class 'resize-active' to parent group v-card
            // that class is solely to raise the z-index of the group while resizing
            // the associated resize-active CSS is in `common.css`
            this.$el.parentElement.closest('.nrdb-ui-group > .v-card')?.classList.toggle('resize-active', active)
        }
    },
    methods: {
        onHandleDragStart (/** @type {DragEvent} */ event, vertical, horizontal) {
            this.resizing.parent = this.$el.parentElement.closest('.nrdb-ui-group > .v-card')
            this.resizing.init.columns = +this.group.width || 1
            this.resizing.init.rows = +this.group.height || 1
            this.resizing.init.width = this.$refs['resize-view'].clientWidth
            this.resizing.init.x = event.x
            this.resizing.active = true
            const EMPTY_IMAGE = this.$refs['blank-img'] // don't show image preview
            event.dataTransfer.setDragImage(EMPTY_IMAGE, 0, 0)
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.dropEffect = 'move'
            event.stopPropagation()
            return false
        },
        onHandleOver (/** @type {DragEvent} */ event, vertical, horizontal) {
            event.preventDefault() // required to allow dropEffect
            if (this.resizing.active === false) { return }
            event.dataTransfer.dropEffect = 'move'
        },
        onHandleDrag (/** @type {DragEvent} */ event, vertical, horizontal) {
            event.preventDefault() // required to allow drop and show dropEffect
            if (this.resizing.active === false) { return }
            event.dataTransfer.dropEffect = 'move'
            if (event.x > 0 && event.y > 0) {
                const dx = event.x - this.resizing.init.x
                this.resizing.current.width = this.resizing.init.width + dx
                const stepX = this.resizing.parent.clientWidth / +this.group.width
                const dw = Math.round(this.resizing.current.width / stepX) - this.resizing.init.columns
                const newColumns = Math.max(this.resizing.init.columns + dw, 1)

                let allowIncrease = false
                let allowDecrease = false
                const stepSnapAt = stepX * 0.85
                if (this.resizing.current.width > this.resizing.parent.clientWidth) {
                    const diff = this.resizing.current.width - this.resizing.parent.clientWidth
                    allowIncrease = diff > stepSnapAt
                } else if (this.resizing.current.width < this.resizing.parent.clientWidth) {
                    const diff = this.resizing.parent.clientWidth - this.resizing.current.width
                    allowDecrease = diff > stepSnapAt
                }
                if (allowIncrease && newColumns > +this.group.width) {
                    this.resizing.current.columns = newColumns
                    this.$emit('resize', { index: this.index, width: newColumns })
                } else if (allowDecrease && newColumns < +this.group.width) {
                    this.resizing.current.columns = newColumns
                    this.$emit('resize', { index: this.index, width: newColumns })
                }
            }
        },
        onHandleDragEnd (/** @type {DragEvent} */ event) {
            if (this.resizing.active === false) { return }
            this.resetDragState()
        },
        resetDragState () {
            this.resizing.active = false
            this.resizing.parent = null
            this.resizing.current.width = null
            this.resizing.current.columns = null
            this.resizing.current.rows = null
        },
        onGroupResize (opts) {
            // ensure opts.width is a number and is greater than 0
            if (typeof opts.width !== 'number' || opts.width < 1) {
                return
            }
            this.pageGroups[opts.index].width = opts.width
        }
    }
}
