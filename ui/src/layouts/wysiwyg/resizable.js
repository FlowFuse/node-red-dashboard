function getNumeric (numberLike) {
    if (typeof numberLike === 'number') {
        return numberLike
    } else if (typeof numberLike === 'string') {
        if (numberLike === '') {
            return 0
        }
        const num = parseFloat(numberLike)
        return isNaN(num) ? 0 : num
    }
    return 0
}
export default {
    emits: ['resize'],
    data () {
        const EMPTY_IMAGE = new Image()
        EMPTY_IMAGE.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
        return {
            pageGroups: [],
            resizeType: null,
            resizeMode: false,
            widgetResizing: {
                active: false,
                widgetId: null,
                parentEl: null,
                widgetEl: null,
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
                    width: null,
                    height: null
                }
            },
            groupResizing: {
                active: false,
                parent: null,
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
            },
            EMPTY_IMAGE
        }
    },
    watch: {
        'groupResizing.active' (active) {
            // add class 'resize-active' to parent group v-card
            // that class is solely to raise the z-index of the group while resizing
            // the associated resize-active CSS is in `common.css`
            this.$el.parentElement.closest('.nrdb-ui-group > .v-card')?.classList.toggle('resize-active', active)
        }
    },
    methods: {
        onHandleDragStart (/** @type {DragEvent} */ event, index, type, item, mode) {
            this.resizeType = type
            this.resizeMode = mode // 'ew' or 'ns'

            if (type === 'group') {
                this.groupResizing.parent = this.$el.parentElement.closest('.nrdb-ui-group > .v-card')
                this.groupResizing.init.columns = +this.group.width || 1
                this.groupResizing.init.rows = +this.group.height || 1
                this.groupResizing.init.width = this.$refs['group-resize-view'].clientWidth
                this.groupResizing.init.x = event.x
                this.groupResizing.active = true
            } else if (type === 'widget') {
                const itemCols = getNumeric(item.props.width) || getNumeric(item.layout.width) || 3 // 3 is the default set in ui_base registration
                const itemRows = getNumeric(item.props.height) || getNumeric(item.layout.height) || 1 // 1 is the default set in ui_base registration
                this.widgetResizing.widgetId = item.id
                this.widgetResizing.parentEl = event.target.closest('.nrdb-resizable-widget')
                this.widgetResizing.widgetEl = event.target.closest('.nrdb-ui-widget')
                this.widgetResizing.init.columns = itemCols
                this.widgetResizing.init.rows = itemRows
                this.widgetResizing.init.width = this.widgetResizing.parentEl.clientWidth
                this.widgetResizing.init.height = this.widgetResizing.parentEl.clientHeight
                this.widgetResizing.init.x = event.x
                this.widgetResizing.init.y = event.y
                this.widgetResizing.active = true
            } else {
                return
            }
            event.dataTransfer.setDragImage(this.EMPTY_IMAGE, 0, 0)
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.dropEffect = 'move'
            event.stopPropagation()
            return false
        },
        onHandleOver (/** @type {DragEvent} */ event, index, type, item, mode) {
            event.preventDefault() // required to allow dropEffect
            if (this.resizeType !== type) { return }
            if (type === 'group') {
                if (this.groupResizing.active === false) { return }
            } else if (type === 'widget') {
                if (this.widgetResizing.active === false) { return }
            }
            event.dataTransfer.dropEffect = 'move'
        },
        onHandleDrag (/** @type {DragEvent} */ event, index, type, item, mode) {
            event.preventDefault() // required to allow drop and show dropEffect
            if (type === 'group') {
                this.groupHandleDragHandler(event, index, type, item, mode)
            } else if (type === 'widget') {
                this.widgetHandleDragHandler(event, index, type, item, mode)
            }
        },
        groupHandleDragHandler (event, index, type, item, mode) {
            if (this.groupResizing.active === false) { return }
            event.dataTransfer.dropEffect = 'move'
            if (event.x > 0 && event.y > 0) {
                const dx = event.x - this.groupResizing.init.x
                this.groupResizing.current.width = this.groupResizing.init.width + dx
                const stepX = this.groupResizing.parent.clientWidth / +this.group.width
                const dw = Math.round(this.groupResizing.current.width / stepX) - this.groupResizing.init.columns
                const newColumns = Math.max(this.groupResizing.init.columns + dw, 1)

                let allowIncrease = false
                let allowDecrease = false
                const stepSnapAt = stepX * 0.85
                if (this.groupResizing.current.width > this.groupResizing.parent.clientWidth) {
                    const diff = this.groupResizing.current.width - this.groupResizing.parent.clientWidth
                    allowIncrease = diff > stepSnapAt
                } else if (this.groupResizing.current.width < this.groupResizing.parent.clientWidth) {
                    const diff = this.groupResizing.parent.clientWidth - this.groupResizing.current.width
                    allowDecrease = diff > stepSnapAt
                }
                if (allowIncrease && newColumns > +this.group.width) {
                    this.groupResizing.current.columns = newColumns
                    this.$emit('resize', { index: this.index, width: newColumns })
                } else if (allowDecrease && newColumns < +this.group.width) {
                    this.groupResizing.current.columns = newColumns
                    this.$emit('resize', { index: this.index, width: newColumns })
                }
            }
        },
        widgetHandleDragHandler (event, index, type, item, mode) {
            if (this.widgetResizing.active === false) { return }
            event.dataTransfer.dropEffect = 'move'
            if (event.x > 0 && mode === 'ew') {
                const itemCols = getNumeric(item.props.width) || getNumeric(item.layout.width) || 3 // 3 is the default set in ui_base registration
                const dx = event.x - this.widgetResizing.init.x
                this.widgetResizing.current.width = this.widgetResizing.init.width + dx
                const stepX = this.widgetResizing.widgetEl.clientWidth / (itemCols || 1)
                const dw = Math.round(this.widgetResizing.current.width / stepX) - this.widgetResizing.init.columns
                const newColumns = Math.max(this.widgetResizing.init.columns + dw, 1)

                let allowIncrease = false
                let allowDecrease = false
                const stepSnapAt = stepX * 0.85
                if (this.widgetResizing.current.width > this.widgetResizing.widgetEl.clientWidth) {
                    const diff = this.widgetResizing.current.width - this.widgetResizing.widgetEl.clientWidth
                    allowIncrease = diff > stepSnapAt
                } else if (this.widgetResizing.current.width < this.widgetResizing.widgetEl.clientWidth) {
                    const diff = this.widgetResizing.widgetEl.clientWidth - this.widgetResizing.current.width
                    allowDecrease = diff > stepSnapAt
                }

                if (allowIncrease && newColumns > itemCols && newColumns <= this.group.width) {
                    this.widgetResizing.current.columns = newColumns
                    console.log('widgetResizing width', { index: this.index, width: newColumns })
                    item.layout.width = newColumns
                    item.props.width = newColumns
                } else if (allowDecrease && newColumns < itemCols && newColumns > 0) {
                    this.widgetResizing.current.columns = newColumns
                    console.log('widgetResizing width', { index: this.index, width: newColumns })
                    item.layout.width = newColumns
                    item.props.width = newColumns
                }
            }
            if (event.y > 0 && mode === 'ns') {
                const itemRows = getNumeric(item.props.height) || getNumeric(item.layout.height) || 1 // 1 is the default set in ui_base registration
                const dy = event.y - this.widgetResizing.init.y
                this.widgetResizing.current.height = this.widgetResizing.init.height + dy
                const stepY = this.widgetResizing.widgetEl.clientHeight / (itemRows || 1)
                const dh = Math.round(this.widgetResizing.current.height / stepY) - this.widgetResizing.init.rows
                const newRows = Math.max(this.widgetResizing.init.rows + dh, 1)

                let allowIncrease = false
                let allowDecrease = false
                const stepSnapAt = stepY * 0.85
                if (this.widgetResizing.current.height > this.widgetResizing.widgetEl.clientHeight) {
                    const diff = this.widgetResizing.current.height - this.widgetResizing.widgetEl.clientHeight
                    allowIncrease = diff > stepSnapAt
                } else if (this.widgetResizing.current.height < this.widgetResizing.widgetEl.clientHeight) {
                    const diff = this.widgetResizing.widgetEl.clientHeight - this.widgetResizing.current.height
                    allowDecrease = diff > stepSnapAt
                }

                if (allowIncrease && newRows > itemRows /* && newRows <= this.group.height */) {
                    this.widgetResizing.current.rows = newRows
                    console.log('widgetResizing height', { index: this.index, height: newRows })
                    item.layout.height = newRows
                    item.props.height = newRows
                } else if (allowDecrease && newRows < itemRows && newRows > 0) {
                    this.widgetResizing.current.rows = newRows
                    console.log('widgetResizing height', { index: this.index, height: newRows })
                    item.layout.height = newRows
                    item.props.height = newRows
                }
            }
        },
        onHandleDragEnd (/** @type {DragEvent} */ event, index, type, item, mode) {
            if (this.groupResizing.active === false && this.widgetResizing.active === false) { return }
            this.resetDragState()
        },
        resetDragState () {
            this.groupResizing.active = false
            this.groupResizing.parent = null
            this.groupResizing.current.width = null
            this.groupResizing.current.columns = null
            this.groupResizing.current.rows = null

            this.widgetResizing.active = false
            this.widgetResizing.widgetId = null
            this.widgetResizing.parentEl = null
            this.widgetResizing.widgetEl = null
            this.widgetResizing.current.width = null
            this.widgetResizing.current.height = null
            this.widgetResizing.current.columns = null
            this.widgetResizing.current.rows = null
        }
    }
}
