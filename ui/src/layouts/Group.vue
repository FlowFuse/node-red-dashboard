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
                @dragover="onHandleOver($event, 'top', 'right')"
                @dragend="onHandleDragEnd($event, 'top', 'right')"
                @dragenter.prevent
            />
        </div>
    </div>
</template>

<script>
import WYSIWYG from './wysiwyg/index.js'
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
        }
    },
    emits: ['resize'],
    computed: {
        columns () {
            return this.resizing.current.columns > 0 ? this.resizing.current.columns : +this.group.width
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
        }
    }
}
</script>

<style scoped lang="scss">
@import './wysiwyg/resizable.scss';
</style>
