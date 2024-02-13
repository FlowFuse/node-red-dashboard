<script setup>
    import { ref } from 'vue'
    import WidgetCard from '../components/WidgetCard.vue'
    import WidgetGrid from '../components/WidgetGrid.vue'

    const general = [{
        name: 'Button',
        widget: 'ui-button',
        image: '/images/node-examples/ui-button.png',
        description: 'Adds a clickable button to your dashboard.'
    }, {
        name: 'Heatmap',
        widget: 'ui-heatmap',
        image: '/images/node-examples/ui-heatmap.png',
        description: 'Renders a heatmap.'
    }, {
        name: 'Markdown',
        widget: 'ui-markdown',
        image: '/images/node-examples/ui-markdown.png',
        description: 'Renders dynamic Markdown (including Mermaid Charts).'
    }, {
        name: 'Notification',
        widget: 'ui-notification',
        image: '/images/node-examples/ui-notification.png',
        description: 'Displays a message for a defined duration of time.'
    }, {
        name: 'Template',
        widget: 'ui-notification',
        image: '/images/node-examples/ui-template.png',
        description: 'Adds a clickable button to your dashboard.'
    }, {
        name: 'Text',
        widget: 'ui-notification',
        image: '/images/node-examples/ui-text.png',
        description: 'Adds a clickable button to your dashboard.'
    }]

    const form = [{
        name: 'Dropdown',
        widget: 'ui-button',
        image: '/images/node-examples/ui-dropdown.png',
        description: 'Adds a clickable button to your dashboard.'
    }, {
        name: 'Form',
        widget: 'ui-form',
        image: '/images/node-examples/ui-form.png',
        description: 'Adds a clickable button to your dashboard.'
    }, {
        name: 'Radio Group',
        widget: 'ui-form',
        image: '/images/node-examples/ui-radio.png',
        description: 'Adds a clickable button to your dashboard.'
    }, {
        name: 'Slider',
        widget: 'ui-form',
        image: '/images/node-examples/ui-slider.png',
        description: 'Adds a clickable button to your dashboard.'
    }, {
        name: 'Switch',
        widget: 'ui-form',
        image: '/images/node-examples/ui-switch.png',
        description: 'Adds a clickable button to your dashboard.'
    }, {
        name: 'Text Input',
        widget: 'ui-form',
        image: '/images/node-examples/ui-text-input.png',
        description: 'Adds a clickable button to your dashboard.'
    }]

    const data = [{
        name: 'Chart',
        widget: 'ui-chart',
        image: '/images/node-examples/ui-chart-line.png',
        description: 'Adds a clickable button to your dashboard.'
    }, {
        name: 'Table',
        widget: 'ui-button',
        image: '/images/node-examples/ui-table.png',
        description: 'Adds a clickable button to your dashboard.'
    }]
    const events = [{
        name: 'Event',
        widget: 'ui-event',
        description: 'Monitors for events in the Dashboard and emits accordingly.'
    }]
    const widgets = ref({
        general,
        form,
        data,
        events
    })
</script>

# Widgets

Dashboard widgets are the building blocks of your dashboard. Wire them together however you like to build out your custom data visualisations and user interfaces.

## General

<WidgetGrid>
    <WidgetCard v-for="widget in widgets.general" :widget="widget"></WidgetCard>
</WidgetGrid>

## Form & Controls

<WidgetGrid>
    <WidgetCard v-for="widget in widgets.form" :widget="widget"></WidgetCard>
</WidgetGrid>

## Data Visualisation

<WidgetGrid>
    <WidgetCard v-for="widget in widgets.data" :widget="widget"></WidgetCard>
</WidgetGrid>

## Events & Control

Collection of widgets that do not render content into the Dashboard, but instead allow communication to/from the Dashboard to monitor activity and control Dashboard state.

<WidgetGrid>
    <WidgetCard v-for="widget in widgets.events" :widget="widget"></WidgetCard>
</WidgetGrid>
