---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Label: The text shown above the radio group to inform the user of what options are available.
    Options: A list of the options available in the radio group. Each row defines a `label` (shown alongisde each radio button) and `value` (emitted on selection) property.
    Columns: The number of grid columns within which to render the radio group. This is useful for when you want to render the options horizontally, or if you have many ptions and want to save vertical space.
    Topic: The `msg.topic` that will be included in any emitted values
---

<script setup>
</script>

# Radio Group `ui-radio-group`

Adds a Radio Group to your dashboard that will emit values in Node-RED under `msg.payload` anytime a value is selected.

## Properties

<PropsTable/>

## Example

![Example of a radio group](/images/node-examples/ui-radio.png "Example of a radio group"){data-zoomable}
*Example of a rendered radio group in a Dashboard with 2 columns.*
