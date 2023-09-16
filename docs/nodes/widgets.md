<script setup>
    import { ref } from 'vue'
    import WidgetCard from '../components/WidgetCard.vue'
    import WidgetGrid from '../components/WidgetGrid.vue'

    const general = [{
        name: 'Button',
        widget: 'ui-button',
        image: '/assets/images/node-examples/ui-button.png',
        description: 'Adds a clickable button to your dashboard.'
    }, {
        name: 'Markdown',
        widget: 'ui-markdown',
        image: '/assets/images/node-examples/ui-markdown.png',
        description: 'Renders dynamic Markdown (including Mermaid Charts).'
    }, {
        name: 'Notification',
        widget: 'ui-notification',
        image: '/assets/images/node-examples/ui-notification.png',
        description: 'Displays a message for a defined duration of time.'
    }, {
        name: 'Template',
        widget: 'ui-notification',
        image: '/assets/images/node-examples/ui-template.png',
        description: 'Adds a clickable button to your dashboard.'
    }, {
        name: 'Text',
        widget: 'ui-notification',
        image: '/assets/images/node-examples/ui-text.png',
        description: 'Adds a clickable button to your dashboard.'
    }]

    const form = [{
        name: 'Dropdown',
        widget: 'ui-button',
        image: '/assets/images/node-examples/ui-dropdown.png',
        description: 'Adds a clickable button to your dashboard.'
    }, {
        name: 'Form',
        widget: 'ui-form',
        image: '/assets/images/node-examples/ui-form.png',
        description: 'Adds a clickable button to your dashboard.'
    }, {
        name: 'Radio Group',
        widget: 'ui-form',
        image: '/assets/images/node-examples/ui-radio.png',
        description: 'Adds a clickable button to your dashboard.'
    }, {
        name: 'Slider',
        widget: 'ui-form',
        image: '/assets/images/node-examples/ui-slider.png',
        description: 'Adds a clickable button to your dashboard.'
    }, {
        name: 'Switch',
        widget: 'ui-form',
        image: '/assets/images/node-examples/ui-switch.png',
        description: 'Adds a clickable button to your dashboard.'
    }, {
        name: 'Text Input',
        widget: 'ui-form',
        image: '/assets/images/node-examples/ui-text-input.png',
        description: 'Adds a clickable button to your dashboard.'
    }]

    const data = [{
        name: 'Chart',
        widget: 'ui-chart',
        image: '/assets/images/node-examples/ui-chart-line.png',
        description: 'Adds a clickable button to your dashboard.'
    }, {
        name: 'Table',
        widget: 'ui-button',
        image: '/assets/images/node-examples/ui-table.png',
        description: 'Adds a clickable button to your dashboard.'
    }]

    const widgets = ref({
        general,
        form,
        data
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