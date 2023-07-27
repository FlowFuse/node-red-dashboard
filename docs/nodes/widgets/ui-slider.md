---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the slider with respect to the parent group. Maximum value is the width of the group.
    Label: The text shown to the left of the slider.
---

<script setup>
</script>

# Slider `ui-slider`

Adds a slider to your dashboard that will emit values in Node-RED under `msg.payload` anytime it's value is changed.

## Properties

<PropsTable/>

## Example

![Example of a slider](../../assets/images/node-examples/ui-slider.png "Example of a slider"){data-zoomable}
*Example of a rendered slider in a Dashboard.*
