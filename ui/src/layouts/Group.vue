<template>
    <div class="nrdb-layout-group--grid" :style="`grid-template-columns: repeat(${ group.width }, 1fr); grid-template-rows: repeat(${group.height}, minmax(${rowHeight}px, auto)); `">
        <div
            v-for="w in widgets"
            :id="'nrdb-ui-widget-' + w.id"
            :key="w.id"
            class="nrdb-ui-widget"
            :class="getWidgetClass(w)"
            style="display: grid"
            :style="`grid-template-rows: repeat(${w.props.height}, minmax(${rowHeight}px, auto)); grid-row-end: span ${w.props.height}; grid-column-end: span ${ w.props.width || group.width }`"
        >
            <component :is="w.component" :id="w.id" :props="w.props" :state="w.state" :style="`grid-row-end: span ${w.props.height}`" />
        </div>
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
        widgets: {
            type: Array,
            required: true
        },
        rowHeight: {
            type: Number,
            default: 48
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
