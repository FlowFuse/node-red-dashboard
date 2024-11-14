<template>
    <div class="nrdb-layout-group--grid" :style="`grid-template-columns: repeat(min(${ columns }, var(--layout-columns)), 1fr); grid-template-rows: repeat(${group.height}, minmax(var(--widget-row-height), auto)); `">
        <div
            v-if="resizable" ref="group-resize-view" class="nrdb-resizable" :class="{'resizing': groupResizing.active}"
            :style="{ 'width': groupResizing.current.width ? `${groupResizing.current.width}px` : null, 'z-index': 99 }"
        >
            <div
                draggable="true"
                class="nrdb-resizable--handle nrdb-resizable--right"
                @dragstart="onHandleDragStart($event, index, 'group', group, 'top', 'right')"
                @drag="onHandleDrag($event, index, 'group', group, 'top', 'right')"
                @dragover="onHandleOver($event, index, 'group', group, 'top', 'right')"
                @dragend="onHandleDragEnd($event, index, 'group', group, 'top', 'right')"
                @dragenter.prevent
            />
        </div>
        <div
            v-for="(w, $index) in widgets"
            :id="'nrdb-ui-widget-' + w.id"
            :key="w.id"
            :draggable="resizable"
            class="nrdb-ui-widget"
            :class="getWidgetClass(w)"
            :style="[{display: 'grid', 'grid-template-columns': 'minmax(0, 1fr)'}, widgetStyles(w)]"
            @dragstart="!resizable ? null : onWidgetDragStart($event, $index, w)"
            @dragover="!resizable ? null : onWidgetDragOver($event, $index, w)"
            @dragend="!resizable ? null : onWidgetDragEnd($event, $index, w)"
            @dragleave="!resizable ? null : onWidgetDragLeave($event, $index, w)"
            @drop.prevent
            @dragenter.prevent
        >
            <!-- <div style="font-size: small; background-color: aquamarine;">w.props.height: {{ w.props.height }}</div> -->
            <component :is="w.component" :id="w.id" :props="w.props" :state="w.state" :style="`grid-row-end: span ${w.props.height}`" />
            <div
                v-if="resizable && !groupDragging" ref="widget-resize-view"
                class="nrdb-resizable nrdb-resizable-widget"
                :class="widgetResizing.widgetId === w.id || widgetDragging.widgetId === w.id ? getWidgetEditingClass(w) : null"
                style="z-index: 100; min-width: 28px; min-height: 28px;"
                :style="widgetResizing.widgetId === w.id ? getWidgetEditingStyle(w) : null"
            >
                <div
                    draggable="true"
                    class="nrdb-resizable--handle nrdb-resizable--right"
                    @dragstart="onHandleDragStart($event, index, 'widget', w, 'ew')"
                    @drag="onHandleDrag($event, index, 'widget', w, 'ew')"
                    @dragover="onHandleOver($event, index, 'widget', w, 'ew')"
                    @dragend="onHandleDragEnd($event, index, 'widget', w, 'ew')"
                    @dragenter.prevent
                    @dblclick="w.props.width = ''; w.layout.width = '3'"
                />
                <div
                    draggable="true"
                    class="nrdb-resizable--handle nrdb-resizable--bottom"
                    @dragstart="onHandleDragStart($event, index, 'widget', w, 'ns')"
                    @drag="onHandleDrag($event, index, 'widget', w, 'ns')"
                    @dragover="onHandleOver($event, index, 'widget', w, 'ns')"
                    @dragend="onHandleDragEnd($event, index, 'widget', w, 'ns')"
                    @dragenter.prevent
                    @dblclick="w.props.height = ''; w.layout.height = '1'"
                />
            </div>
        </div>
    </div>
</template>

<script>
import WYSIWYG from './wysiwyg/index.js'

function hasNumberProperty (obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop) && !isNaN(+obj[prop])
}

export default {
    name: 'WidgetGroup',
    mixins: [WYSIWYG],
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
        },
        groupDragging: {
            type: Boolean,
            default: false
        }
    },
    emits: ['resize'],
    data () {
        return {
            localWidgets: null
        }
    },
    computed: {
        columns () {
            return this.groupResizing.current.columns > 0 ? this.groupResizing.current.columns : +this.group.width
        },
        widgetStyles () {
            return (widget) => {
                // `grid-template-columns: minmax(0, 1fr); grid-template-rows: repeat(${w.props.height}, minmax(var(--widget-row-height), auto)); grid-row-end: span ${w.props.height}; grid-column-end: span min(${ getWidgetWidth(w.props.width) }, var(--layout-columns))`"
                const styles = {}
                const height = widget.props.height || widget.layout.height
                const width = widget.props.width || widget.layout.width
                if (height) {
                    styles['grid-row-end'] = `span ${height}`
                    styles['grid-template-rows'] = `repeat(${height}, minmax(var(--widget-row-height), auto))`
                }
                if (width) {
                    styles['grid-column-end'] = `span min(${this.getWidgetWidth(width)}, var(--layout-columns))`
                }
                console.log('widgetStyles', styles)
                return styles
            }
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
        getWidgetEditingClass (widget) {
            const classes = []
            // dragging interaction classes
            const dragClass = this.resizable ? this.getWidgetDragDropClass(widget) : null // Mixin method
            if (dragClass) {
                classes.push(dragClass)
            }
            const resizeClass = this.getWidgetResizingClass(widget) // Mixin method
            if (resizeClass) {
                classes.push(resizeClass)
            }
            return classes.join(' ')
        },
        getWidgetEditingStyle (widget) {
            if (!this.widgetResizing.active || this.resizeType !== 'widget') {
                return null
            }
            const style = { }
            if (this.resizeMode === 'ew' && hasNumberProperty(this.widgetResizing.current, 'width')) {
                style.width = `${this.widgetResizing.current.width}px`
            }
            if (this.resizeMode === 'ns' && hasNumberProperty(this.widgetResizing.current, 'height')) {
                style.height = `${this.widgetResizing.current.height}px`
            }
            return style
        },
        getWidgetWidth (width) {
            if (width) {
                return Math.min(width, this.columns)
            } else {
                return this.columns
            }
        }
    }
}
</script>

<style scoped lang="scss">
@import './wysiwyg/resizable.scss';
</style>
