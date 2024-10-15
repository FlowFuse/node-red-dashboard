---
description: Facilitate easy option selection with ui-radio-group in Node-RED Dashboard 2.0 for streamlined user choices.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Label:
        description: The text shown above the radio group to inform the user of what options are available.  Html content is allowed.
        dynamic: true
    Options:
        description: A list of the options available in the radio group. Each row defines a `label` (shown alongisde each radio button) and `value` (emitted on selection) property.
        dynamic: true
    Columns:
        description: The number of grid columns within which to render the radio group. This is useful for when you want to render the options horizontally, or if you have many ptions and want to save vertical space.
        dynamic: true
    Topic: The `msg.topic` that will be included in any emitted values
dynamic:
    Label:
        payload: msg.ui_update.label
        structure: ["String"]
    Options:
        payload: msg.ui_update.options
        structure: ["Array<String>", "Array<{value: String}>", "Array<{value: String, label: String}>"]
    Class:
        payload: msg.ui_update.class
        structure: ["String"]
    Columns:
        payload: msg.ui_update.columns
        structure: ["Number"]
---

<script setup>
    import TryDemo from "./../../components/TryDemo.vue";
</script>


<TryDemo href="radio-group">

# Radio Group `ui-radio-group`

</TryDemo>

Adds a Radio Group to your dashboard that will emit values in Node-RED under `msg.payload` anytime a value is selected.

## Programmatic Selections

You can dynamically make selections for this dropdown by passing in the respective `value` to `msg.payload`, e.g. `msg.payload = "option1"`.

### Clear Selection

 To clear any selection for a dropdown, pass an empty string `""` as `msg.payload`.

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Example

![Example of a radio group](/images/node-examples/ui-radio.png "Example of a radio group"){data-zoomable}
*Example of a rendered radio group in a Dashboard with 2 columns.*
