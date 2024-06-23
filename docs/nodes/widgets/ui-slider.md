---
description: Integrate ui-slider in Node-RED Dashboard 2.0 for dynamic value input through a simple sliding mechanism.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the slider with respect to the parent group. Maximum value is the width of the group.
    Label:
        description: The text shown to the left of the slider.
        dynamic: true
    Thumb Label:
        description: If true, will so a label on hte slider's thumb when moved/focussed.
        dynamic: true
    Range:
        description: min - the minimum valu the slider can be changed to; max - the maximum value the slider can be changed to; step - the increment/decrement value when the slider is moved.
        dynamic: true
    Color:
        description: main - color of the slider and thumb; track - color of the slider track; thumb - color of the handle. It could be the name of a color (red, green, blue, ...) or a Hex color code (#b5b5b5).
        dynamic: false
    Icons:
        description: Add [mdi icons](https://pictogrammers.com/library/mdi/) before and after the slider. For example, mdi-minus. Click option make icons clickable to change the value by step.
        dynamic: true    
    Output: Defines when a msg is emitted, either as the slider is moved, or as the slider is released.        
dynamic:
    Label:
        payload: msg.ui_update.class
        structure: ["String"]
    Thumb Label:
        payload: msg.ui_update.thumbLabel
        structure: ["Boolean"]
    Range (min):
        payload: msg.ui_update.min
        structure: ["Number"]
    Range (step):
        payload: msg.ui_update.step
        structure: ["Number"]
    Range (max):
        payload: msg.ui_update.max
        structure: ["Number"]
    Class:
        payload: msg.ui_update.class
        structure: ["String"]
---

<script setup>
</script>

# Slider `ui-slider`

Adds a slider to your dashboard that will emit values in Node-RED under `msg.payload` anytime it's value is changed.

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

### Setting Value

You can set the value of the slider by passing in the respective value in `msg.payload`.

## Example - Basic

![Example of a slider](/images/node-examples/ui-slider.png "Example of a slider"){data-zoomable}
*Example of a rendered slider in a Dashboard.*
