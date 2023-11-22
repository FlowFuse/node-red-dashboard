---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the slider with respect to the parent group. Maximum value is the width of the group.
    Label: The text shown to the left of the slider.
    Thumb Label: If true, will so a label on hte slider's thumb when moved/focussed.
    Range: min - the minimum valu the slider can be changed to; max - the maximum value the slider can be changed to; step - the increment/decrement value when the slider is moved.
    Output: Defines when a msg is emitted, either as the slider is moved, or as the slider is released.
---

<script setup>
</script>

# Slider `ui-slider`

Adds a slider to your dashboard that will emit values in Node-RED under `msg.payload` anytime it's value is changed.

## Properties

<PropsTable/>

## Example - Basic

![Example of a slider](/images/node-examples/ui-slider.png "Example of a slider"){data-zoomable}
*Example of a rendered slider in a Dashboard.*
