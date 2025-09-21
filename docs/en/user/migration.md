---
description: Easily migrate from Node-RED Dashboard to FlowFuse Dashboard with this comprehensive guide, ensuring a smooth transition for your projects.
---
<script setup>
    import { ref } from 'vue'
    import MigrationWidgetProfile from '../../components/MigrationWidgetProfile.vue'

    import uiButton from './migration/ui_button.json'
    import uiChart from './migration/ui_chart.json'
    import uiControl from './migration/ui_control.json'
    import uiDropdown from './migration/ui_dropdown.json'
    import uiForm from './migration/ui_form.json'
    import uiGauge from './migration/ui_gauge.json'
    import uiLink from './migration/ui_link.json'
    import uiSlider from './migration/ui_slider.json'
    import uiSwitch from './migration/ui_switch.json'
    import uiTemplate from './migration/ui_template.json'
    import uiText from './migration/ui_text.json'
    import uiTextInput from './migration/ui_text_input.json'
    import uiToast from './migration/ui_toast.json'

    const widgets = ref({
        'ui_button': uiButton,
        'ui_chart': uiChart,
        'ui_control': uiControl,
        'ui_dropdown': uiDropdown,
        'ui_form': uiForm,
        'ui_gauge': uiGauge,
        'ui_link': uiLink,
        'ui_slider': uiSlider,
        'ui_switch': uiSwitch,
        'ui_template': uiTemplate,
        'ui_text': uiText,
        'ui_text_input': uiTextInput,
        'ui_toast': uiToast
    })
</script>
    
# Node-RED Dashboard Migration Guide


## Why Migrate?

The [original Node-RED Dashboard](https://flows.nodered.org/node/node-red-dashboard) is no longer being actively developed, with the following note on the GH repository:

> This project is based on Angular v1 - As that is now no longer maintained, this project should be considered to be on "life support". Small patches will be applied on a best can do basis, but there will be no major feature upgrades, and underlying security breakage may occur.

This guide is intended to help users migrate from the original Node-RED Dashboard to this new project, FlowFuse Dashboard.

We have, where possible, replicated functionality from Node-RED Dashboard, and in some cases, improved upon it. If there are any features you feel are missing, please raise an issue on the [GitHub repository](https://github.com/FlowFuse/node-red-dashboard/issues)

## Where to start

Whilst we spent a lot of time trying to work out how we could make FlowFuse Dashboard backward compatible with Node-RED Dashboard, unfortunately, we've just been unable to accomplish that. As such, re-building Dashboards in FlowFuse Dashboard is (currently) a manual process.

### Installing

You can get started by installing the FlowFuse Dashboard module through Node-RED's palette manager - search `@flowfuse/node-red-dashboard`.

FlowFuse Dashboard will work alongside Node-RED Dashboard, so you can start building your new Dashboard in parallel with your existing one, with the new Dashboard being available at `http://<node-red-host>:<node-red-port>/dashboard`.

### Migration Script

We have a [Migration Service](https://flowfuse.com/product/dashboard/#migration-service) available to help you get started on moving your existing Node-RED Dashboard to FlowFuse Dashboard.

Whilst it will not migrate _everything_, it will give you a significant head start, and automate the majority of it for you. Anything that cannot be automatically migrated, are left in the flow, but disabled, so that they're flagged as requiring manual intervention.

## Node-RED Dashboard Nodes

The following details a direct comparison of all properties available on each node in Node-RED Dashboard, and what changes have been made, if any, in FlowFuse Dashboard.

### `ui_audio`

<MigrationWidgetProfile :profile="widgets['ui_audio']" />

You can track progress, and input thoughts and ideas on this here: [Widget: Audio #52](https://github.com/FlowFuse/node-red-dashboard/issues/52)

### `ui_button`

<MigrationWidgetProfile :profile="widgets['ui_button']" />

### `ui_chart`

<MigrationWidgetProfile :profile="widgets['ui_chart']" />

#### Injecting Data

There is a significant crossover between Node-RED Dashboard and FlowFuse Dashboard in how you can inject data into a chart, but some important, and notable differences that utilises the new `series` and `property` options available.

Injecting raw data can be done with:

- `msg.payload = <value>`
    - In this case, the value received by the chart will be used as a `y` value, and the `x` value will be automatically added as the current date/time.
- `msg.payload = { y: <value> }`
    - In this case, the `y` value will be used as defined, and the `x` value will be calculated as the current date/time.
- `msg.payload = { x: <value>, y: <value> }`
    - In this case, the `x` and `y` values will be used as the `x` and `y` values of the data point.
- `msg.payload = [{ x: <value>, y: <value> }, { x: <value>, y: <value> }]`
    - In this case, multiple points will be plotted into a single line.
- `msg.payload = [{ x: <value>, y: <value>, line: <value> }, { x: <value>, y: <value>, line: <value> }]`
    - In this case, multiple points will be plotted, and if the `series` property is set to `property:line` then the `line` property will be used to determine which line each data point should be plotted on.

When wanting to separate data into multiple `series` in Node-RED Dashboard, you had to define an appropriate `msg.topic`. This is now a configurable option in FlowFuse Dashboard, with the default value as per Node-RED Dashboard. This means, that if you want to inject multiple data points, you could now send:

```js
msg.payload = [{
    "category": "cat-1",
    "value": 2,
    "date": "2023-10-23"
}, {
    "category": "cat-2",
    "value": 3,
    "date": "2023-10-23"
}, {
    "category": "cat-1",
    "value": 1,
    "date": "2023-10-24"
}, {
    "category": "cat-2",
    "value": 6,
    "date": "2023-10-24"
}]
```

Where the `series` property of this chart could be set to `key:category`.

Charts now store data on a message-by-message basis for clearer auditing, and so do not store as per [Node-RED Dashboard](https://github.com/node-red/node-red-dashboard/blob/master/Charts.md#line-charts-1). This means that the format:

```
[{
    "series": ["A", "B"],
    "data": [
        [
            { "x": 1504029632890, "y": 5 },
            { "x": 1504029636001, "y": 4 },
            { "x": 1504029638656, "y": 2 }
        ],
        [
            { "x": 1504029633514, "y": 6 },
            { "x": 1504029636622, "y": 7 },
            { "x": 1504029639539, "y": 6 }
        ]
    ],
    "labels": [""]
}]
```

is currently _not_ supported. If this is of particular importance, please do voice your support [here](https://github.com/FlowFuse/node-red-dashboard/issues/229).

### `ui_colour_picker`

Whilst there is currently not an explicit `ui_colour_picker` widget, the `ui_text_input` widget can be used to achieve the same result, by setting _"type"_ to _"color"_

### `ui_control`

<MigrationWidgetProfile :profile="widgets['ui_control']" />

#### Controls List

All Node-RED Dashboard controls are supported in FlowFuse Dashboard, with the exception of the `open/close` control for a group, which is currently not supported.

You can see detailed documentation of the available controls, and emitted events [here](/en/nodes/widgets/ui-control.html).

### `ui_date_picker`

Whilst there is currently not an explicit `ui_date_picker` widget, the `ui_text_input` widget can be used to achieve the same result, by setting _"type"_ to _"date"_,  _"time"_,  _"week"_ or  _"month"_.

There has also been a [request](https://github.com/FlowFuse/node-red-dashboard/issues/32) for a Time/Date Range component, which is in the plans.

### `ui_dropdown`

<MigrationWidgetProfile :profile="widgets['ui_dropdown']" />

### `ui_form`

<MigrationWidgetProfile :profile="widgets['ui_form']" />

### `ui_gauge`

<MigrationWidgetProfile :profile="widgets['ui_gauge']" />

### `ui_link`

<MigrationWidgetProfile :profile="widgets['ui_link']" />

### `ui_numeric`

Whilst this widget has no explicitly been transferred into FlowFuse Dashboard, the functionality is still available in the `ui-text-input` widget, where you can select the _"type"_ to be _"number"_.

You can track progress of this development effort here: [Issue #41](https://github.com/FlowFuse/node-red-dashboard/issues/41)

### `ui_slider`

<MigrationWidgetProfile :profile="widgets['ui_slider']" />

### `ui_switch`

<MigrationWidgetProfile :profile="widgets['ui_switch']" />

### `ui_template`

<MigrationWidgetProfile :profile="widgets['ui_template']" />

### `ui_text`

<MigrationWidgetProfile :profile="widgets['ui_text']" />

### `ui_text_input`

<MigrationWidgetProfile :profile="widgets['ui_text_input']" />


### `ui_toast`

<MigrationWidgetProfile :profile="widgets['ui_toast']" />


## Theming

We have tried to make theming in FlowFuse Dashboard more low-code friendly, by providing a number of exposed properties, and a wrapping `ui-theme` config node which is assigned at the `ui-page` level.

![Example of editing a theme](/images/theme-config.png "Example of editing a theme"){data-zoomable}
_Example of the properties exposed in the Node-RED Editor when defining a theme_

We have plans to extend this theming configuration further, such that you can also define grid spacing, fonts, etc.

Any further customisation of the overall layout and theme of the Dashboard will require custom CSS, which can be injected via the `ui_template` node.

## Layouts

FlowFuse Dashboard follows a similar architecture to Node-RED Dashboard for managing hierarchy in the UI. The differences can be seen if we compare them side-by-side:

| Node-RED Dashboard | FlowFuse Dashboard | Difference |
| --- | --- | --- |
| `ui-base` | `ui-base` | We've exposed this as a config node in FlowFuse Dashboard, where a `ui-page` is assigned a parent `ui-base`. Whilst not yet supported, eventually, we wish to support _multiple_ base Dashboards in the same Node-RED instance. |
| `ui-tab` | `ui-page` | In addition to a renaming here, we've also added support for a `ui-page` to have a defined "Theme" (driven by our new `ui-theme` config nodes). Each `ui-page` also has a new _"Layout"_ option, which can be set on a page-by-page basis. |
| `ui-group` | `ui-group` | Currently no "collapse" behaviour, but other functionality is the same. |

We currently have three layouts available in FlowFuse Dashboard:

- [**Grid**](../layouts/types/grid.md) - Modelled with CSS's `grid` layout, this is the default layout, and uses a fixed 12 column approach, whereby content will scale horizontally with screen width, making it far more friendly for responsive layouts.
- [**Fixed**](../layouts/types/fixed.md) - This uses a CSS Flex Layout and is the most similar we currently have to the only layout in Node-RED Dashboard. Improvements are required here to improve the "packing" nature of the layout though.
- [**Notebook**](../layouts/types/notebook.md) - Mimicking a Jupyter Notebook layout, this provides content with a maximum width, scales with mobile devices, and allows for content to be stacked vertically.

We also have future plans to support injection of third-party layouts, and even client-side editable layouts (e.g. drag-and-drop layout design).

## Third-Party Widgets

Any addons that were built for Node-RED Dashboard (e.g. `ui-svg`, `ui-worldmap`) are not supported in FlowFuse Dashboard.

We do need community contributions to re-build them the "FlowFuse Dashboard way". If you're interested in helping us with this exercise, we have a [guide on how to build custom widgets](/contributing/widgets/third-party.md) to help you get started.
