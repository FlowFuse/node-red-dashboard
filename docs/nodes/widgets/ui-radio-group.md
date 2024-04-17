---
description: Facilitate easy option selection with ui-radio-group in Node-RED Dashboard 2.0 for streamlined user choices.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Label: The text shown above the radio group to inform the user of what options are available.
    Options: A list of the options available in the radio group. Each row defines a `label` (shown alongisde each radio button) and `value` (emitted on selection) property.
    Columns: The number of grid columns within which to render the radio group. This is useful for when you want to render the options horizontally, or if you have many ptions and want to save vertical space.
    Topic: The `msg.topic` that will be included in any emitted values
dynamic:
    Options:
        payload: msg.options
        structure: ["Array<String>", "Array<{value: String}>", "Array<{value: String, label: String}>"]
    Class:
        payload: msg.class
        structure: ["String"]
---

<script setup>
</script>

# Radio Group `ui-radio-group`

Adds a Radio Group to your dashboard that will emit values in Node-RED under `msg.payload` anytime a value is selected.

## Programmatic Selections

You can dynamically make selections for this dropdown by passing in the respective `value` to `msg.payload`, e.g. `msg.payload = "option1"`.

### Clear Selection

 To clear any selection for a dropdown, pass a `null` as `msg.payload`.

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Example

![Example of a radio group](/images/node-examples/ui-radio.png "Example of a radio group"){data-zoomable}
*Example of a rendered radio group in a Dashboard with 2 columns.*
