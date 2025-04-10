---
description: Explore the wide range of widgets available in Node-RED Dashboard 2.0 to enhance your dashboard's interactivity.
---

<script setup>
    import { ref } from 'vue'
    import WidgetCard from '../../components/WidgetCard.vue'
    import WidgetGrid from '../../components/WidgetGrid.vue'

    const general = [{
        name: 'Audio',
        widget: 'ui-audio',
        image: '/images/node-examples/ui-audio.png',
        description: 'Adds a audio player to your dashboard.'
    }, {
        name: 'Button',
        widget: 'ui-button',
        image: '/images/node-examples/ui-button.png',
        description: 'Adds a clickable button to your dashboard.'
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
        widget: 'ui-template',
        image: '/images/node-examples/ui-template.png',
        description: 'Renders custom templates on your dashboard.'
    }, {
        name: 'Text',
        widget: 'ui-text',
        image: '/images/node-examples/ui-text.png',
        description: 'Displays a non-editable text field on your dashboard.'
    }, {
        name: 'Spacer',
        widget: 'ui-spacer',
        description: 'Adds a simple spacer to your group.'
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
        widget: 'ui-radio-group',
        image: '/images/node-examples/ui-radio.png',
        description: 'Adds a radio group to your dashboard.'
    }, {
        name: 'Slider',
        widget: 'ui-slider',
        image: '/images/node-examples/ui-slider.png',
        description: 'Adds a slider to your dashboard.'
    }, {
        name: 'Switch',
        widget: 'ui-switch',
        image: '/images/node-examples/ui-switch.png',
        description: 'Adds a clickable switch to your dashboard.'
    }, {
        name: 'Text Input',
        widget: 'ui-text-input',
        image: '/images/node-examples/ui-text-input.png',
        description: 'Adds a text input to your dashboard.'
    }]

    const data = [{
        name: 'Chart',
        widget: 'ui-chart',
        image: '/images/node-examples/ui-chart-line.png',
        description: 'Adds a chart to your dashboard.'
    }, {
        name: 'Table',
        widget: 'ui-table',
        image: '/images/node-examples/ui-table.png',
        description: 'Adds a table to your dashboard.'
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

## Core Widgets

Dashboard widgets are the building blocks of your dashboard. Wire them together however you like to build out your custom data visualisations and user interfaces.

The following widgets are packaged with Node-RED Dashboard 2.0:

### General

<WidgetGrid>
    <WidgetCard v-for="widget in widgets.general" :widget="widget"></WidgetCard>
</WidgetGrid>

### Form & Controls

<WidgetGrid>
    <WidgetCard v-for="widget in widgets.form" :widget="widget"></WidgetCard>
</WidgetGrid>

### Data Visualisation

<WidgetGrid>
    <WidgetCard v-for="widget in widgets.data" :widget="widget"></WidgetCard>
</WidgetGrid>

### Events & Control

Collection of widgets that do not render content into the Dashboard, but instead allow communication to/from the Dashboard to monitor activity and control Dashboard state.

<WidgetGrid>
    <WidgetCard v-for="widget in widgets.events" :widget="widget"></WidgetCard>
</WidgetGrid>

## Third-Party Widgets

In addition to the core widgets, we have the architecture to support third-party widgets. If you're interested in developing some yourself, you can check out our [Third Party Widgets Contributing Guide](../contributing/widgets/third-party.md).

Here is a list of the third-party widgets we're aware of to make it easier to find what you might be after. These widgets are created by us and the community and can be installed via the Node-RED Palette Manager.

- [@sumit_shinde_84/ui-webcam](https://flows.nodered.org/node/@sumit_shinde_84/node-red-dashboard-2-ui-webcam): Enables users to integrate webcam functionality into Node-RED Dashboard 2.0, allowing users to capture images and stream video through different cameras.
- [@flowfuse/ui-iframe](https://flows.nodered.org/node/@flowfuse/node-red-dashboard-2-ui-iframe): Embed an external webpage into your Dashboard using an iframe.
- [@flowfuse/ui-led](https://flows.nodered.org/node/@flowfuse/node-red-dashboard-2-ui-led): Adds an LED status indicator to your Dashboard.
- [@flowfuse/ui-flowviewer](https://flows.nodered.org/node/@flowfuse/node-red-dashboard-2-ui-flowviewer): Visualises valid Node-RED `flow.json` into a static flow viewer.
- [@flowfuse/user-addon](https://flows.nodered.org/node/@flowfuse/node-red-dashboard-2-user-addon): Adds user data to all Dashboard events under `msg._client.user` if Node-RED is running on FlowFuse, with "FlowFuse User Authentication" enabled.
- [@colinl/ui-gauge-classic](https://flows.nodered.org/node/@colinl/node-red-dashboard-2-ui-gauge-classic): Render a multi-needle gauge on your Dashboard, with a more "Classic" visual style.
- [@fullmetal-fred/cloudflare-auth](https://flows.nodered.org/node/@fullmetal-fred/node-red-dashboard-2-cloudflare-auth): Adds user data to all Dashboard events under `msg._client.user` if Node-RED is configured with Cloudflare authentication.
- [@omrid01/table-tabulator](https://flows.nodered.org/node/@omrid01/node-red-dashboard-2-table-tabulator): Provides a rich table widget for Dashboard that extends the popular [Tabulator](http://tabulator.info/) JavaScript library.
- [@revolutionpi/hmi](https://flows.nodered.org/node/@revolutionpi/node-red-dashboard-2-hmi): A customisable round button designed after industrial HMI Push-buttons.
- [@cgjgh/ui-scheduler](https://flows.nodered.org/node/@cgjgh/node-red-dashboard-2-ui-scheduler): A scheduler widget for UI-based schedule management.

### In-Development

The following are a list of nodes that we've been made aware of, are in active development, but have not yet been published to the Node-RED Palette Manager.

- [@bartbutenaers/ui-svg](https://github.com/bartbutenaers/node-red-dashboard-2-ui-svg/tree/master): Adds an SVG widget to your Dashboard, with dynamic controls over plotting and styling.
