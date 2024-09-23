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
            v-if="resizable" ref="resize-view" class="nrdb-resizable" :class="{'active': dragging.active}"
            :style="{'width': dragging.current.width ? `${dragging.current.width}px` : null }"
        >
            <div
                draggable="true"
                class="nrdb-resizable--handle nrdb-resizable--right"
                @dragstart="onHandleDragStart($event, 'top', 'right')"
                @drag="onHandleDrag($event, 'top', 'right')"
                @dragend="onHandleDragEnd($event, 'top', 'right')"
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
            dragging: {
                active: false,
                init: {
                    x: 0,
                    y: 0,
                    columns: 0,
                    rows: 0,
                    width: 0,
                    heigh: 0
                },
                current: {
                    columns: 0,
                    rows: 0,
                    width: null
                }
            }
        }
    },
    computed: {
        columns () {
            const cols = this.dragging.current.columns > 0 ? this.dragging.current.columns : this.group.width
            return cols
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
        onHandleDragStart (event, vertical, horizontal) {
            this.dragging.active = true
            this.dragging.init.columns = parseFloat(this.group.width)
            this.dragging.init.rows = parseFloat(this.group.height)
            // event.preventDefault()
            event.stopPropagation()
            // don't show image preview
            const EMPTY_IMAGE = this.$refs['blank-img']
            event.dataTransfer.setDragImage(EMPTY_IMAGE, 0, 0)

            this.dragging.init.x = event.x
            this.dragging.init.width = this.$refs['resize-view'].clientWidth
            return false
        },
        onHandleDrag (event, vertical, horizontal) {
            if (event.x > 0 && event.y > 0) {
                // odd event fired on mouse up with x/y = 0
                const stepX = this.$el.clientWidth / this.group.width
                // const stepY = 50

                const dx = event.x - this.dragging.init.x
                // what change does this reflect in the grid?
                const dw = dx < 0 ? Math.ceil(dx / stepX) : Math.floor(dx / stepX)

                // const dh = Math.floor(event.offsetY / stepY)

                this.dragging.current.width = this.dragging.init.width + dx

                if (dw !== 0) {
                    const width = this.dragging.init.columns + dw
                    // const height = this.dragging.init.rows + dh

                    if (width !== this.group.width) {
                        this.dragging.current.columns = width
                        this.$emit('resize', {
                            index: this.index,
                            width
                        })
                    }
                }
            }
        },
        onHandleDragEnd () {
            this.dragging.active = false
            const width = Math.max(this.dragging.current.columns, 1)
            const height = Math.max(this.dragging.current.rows, 1)
            this.resetDragState()
            this.$emit('resize', { index: this.index, width, height })
        },
        resetDragState () {
            this.dragging.current.width = null
            this.dragging.current.columns = null
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
    &.active {
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
    cursor: pointer;
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
