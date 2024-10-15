<template>
    <div class="nrdb-layout-group--grid" :style="`grid-template-columns: repeat(min(${ columns }, var(--layout-columns)), 1fr); grid-template-rows: repeat(${group.height}, minmax(var(--widget-row-height), auto)); `">
        <div
            v-for="w in widgets"
            :id="'nrdb-ui-widget-' + w.id"
            :key="w.id"
            class="nrdb-ui-widget"
            :class="getWidgetClass(w)"
            style="display: grid"
            :style="`grid-template-columns: minmax(0, 1fr); grid-template-rows: repeat(${w.props.height}, minmax(var(--widget-row-height), auto)); grid-row-end: span ${w.props.height}; grid-column-end: span min(${ w.props.width || columns }, var(--layout-columns))`"
        >
            <component :is="w.component" :id="w.id" :props="w.props" :state="w.state" :style="`grid-row-end: span ${w.props.height}`" />
        </div>
        <div
            v-if="resizable" ref="resize-view" class="nrdb-resizable" :class="{'resizing': resizing.active}"
            :style="{'width': resizing.current.width ? `${resizing.current.width}px` : null }"
        >
            <div
                draggable="true"
                class="nrdb-resizable--handle nrdb-resizable--right"
                @dragstart="onHandleDragStart($event, 'top', 'right')"
                @drag="onHandleDrag($event, 'top', 'right')"
                @dragend="onHandleDragEnd($event, 'top', 'right')"
                @dragover="onHandleOver($event, 'top', 'right')"
                @dragenter.prevent
            />
        </div>
        <img ref="blank-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" alt="">
    </div>
</template>

<script>

export default {
    name: 'WidgetGroup',
    props: {
        group: {
            type: Object,
            required: true
        },
        index: {
            type: Number,
            required: true
        },
        widgets: {
            type: Array,
            required: true
        },
        resizable: {
            type: Boolean,
            default: false
        }
    },
    emits: ['resize'],
    data () {
        return {
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
    computed: {
        columns () {
            return this.resizing.current.columns > 0 ? this.resizing.current.columns : +this.group.width
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
        getWidgetClass (widget) {
            const classes = []
            // ensure each widget has a class for its type
            classes.push(`nrdb-${widget.type}`)
            if (widget.props.className) {
                classes.push(widget.props.className)
            }
            if (widget.state.class) {
                classes.push(widget.state.class)
            }
            return classes.join(' ')
        },
        onHandleDragStart (/** @type {DragEvent} */ event, vertical, horizontal) {
            this.resizing.active = true
            this.resizing.init.columns = +this.group.width || 1
            this.resizing.init.rows = +this.group.height || 1
            this.resizing.init.width = this.$refs['resize-view'].clientWidth
            this.resizing.init.x = event.x
            const EMPTY_IMAGE = this.$refs['blank-img'] // don't show image preview
            event.dataTransfer.setDragImage(EMPTY_IMAGE, 0, 0)
            event.dataTransfer.effectAllowed = 'all'
            event.dataTransfer.dropEffect = 'move'
            event.stopPropagation()
            return false
        },
        onHandleOver (/** @type {DragEvent} */ event, vertical, horizontal) {
            if (this.resizing.active === false) { return }
            console.log('onHandleOver', event)
            event.dataTransfer.dropEffect = 'move'
            event.preventDefault()
        },
        onHandleDrag (/** @type {DragEvent} */ event, vertical, horizontal) {
            if (this.resizing.active === false) { return }
            console.log('onHandleDrag', event)
            event.dataTransfer.dropEffect = 'move'
            if (event.x > 0 && event.y > 0) {
                const stepX = this.$el.clientWidth / +this.group.width
                const dx = event.x - this.resizing.init.x
                const dw = dx < 0 ? Math.ceil(dx / stepX) : Math.floor(dx / stepX)
                this.resizing.current.width = this.resizing.init.width + dx
                const width = Math.max(this.resizing.init.columns + dw, 1)
                if (width !== +this.group.width) {
                    this.resizing.current.columns = width
                    this.$emit('resize', { index: this.index, width })
                }
            }
        },
        onHandleDragEnd (/** @type {DragEvent} */ event) {
            if (this.resizing.active === false) { return }
            this.resizing.active = false
            if (this.resizing.current.columns === null && this.resizing.current.rows === null) {
                this.resetDragState()
                return
            }
            const columns = Math.max(this.resizing.current.columns, 1)
            const rows = Math.max(this.resizing.current.rows, 1)
            const changed = this.resizing.init.columns !== columns || this.resizing.init.rows !== rows
            this.resetDragState()
            if (changed) {
                this.$emit('resize', { index: this.index, width: columns, height: rows })
            }
        },
        resetDragState () {
            this.resizing.active = false
            this.resizing.current.width = null
            this.resizing.current.columns = null
            this.resizing.current.rows = null
        }
    }

}
</script>

<style scoped lang="scss">
.nrdb-resizable {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    --handler-size: 12px;
    cursor: grab;
    &.resizing {
        background-color: #ff00001f;
        border: 1px dashed red;
    }
}
.nrdb-resizable--handle {
    position: absolute;
    width: var(--handler-size);
    height: var(--handler-size);
    background-color: white;
    border: 1px solid black;
    border-radius: 6px;
    cursor: ew-resize;
    &:active {
        cursor: ew-resize !important;
    }
}
.nrdb-resizable--top-right {
    top: calc(-1 * var(--handler-size) / 2);
    right: calc(-1 * var(--handler-size) / 2);
}

.nrdb-resizable--right {
    height: calc(2 * var(--handler-size));
    top: 50%;
    margin-top: calc(-1 * var(--handler-size));
    right: calc(-1 * var(--handler-size) / 2);
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
        cursor: ew-resize;
        background-color: #eee;
    }
    &:active {
        cursor: ew-resize !important;
    }
}

.nrdb-resizable--right:after {
    content: '';
    height: calc(0.75 * var(--handler-size));
    width: 1px;
    display: inline-block;
    background-color: red;
}

.nrdb-resizable--bottom-left {
    bottom: calc(-1 * var(--handler-size) / 2);
    left: calc(-1 * var(--handler-size) / 2);
}

.nrdb-resizable--top-left {
    top: calc(-1 * var(--handler-size) / 2);
    left: calc(-1 * var(--handler-size) / 2);
}

</style>
