---
description: Integrate ui-slider in Node-RED Dashboard 2.0 for dynamic value input through a simple sliding mechanism.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the slider with respect to the parent group. Maximum value is the width of the group.
    Label:
        description: The text shown to the left of the slider.
        dynamic: true
    Thumb Label:
        description: Defined when the thumb of the slider will show. Defaults to 'On Drag'.
        dynamic: true
    Show Ticks:
        description: Defined when the ticks will be visible on the track. Defaults to 'Always'.
        dynamic: true
    Range:
        description: min - the minimum value the slider can be changed to; max - the maximum value the slider can be changed to; step - the increment/decrement value when the slider is moved.
        dynamic: true
    Color:
        description: main - color of the slider and thumb; track - color of the slider track; thumb - color of the handle. It could be the name of a color (red, green, blue, ...) or a Hex color code (#b5b5b5).
        dynamic: false
    Output: Defines when a msg is emitted, either as the slider is moved, or as the slider is released.        
dynamic:
    Label:
        payload: msg.ui_update.class
        structure: ["String"]
    Thumb Label:
        payload: msg.ui_update.thumbLabel
        structure: ["true | false | 'always'"]
    Show Ticks:
        payload: msg.ui_update.showTicks
        structure: ["true | false | 'always'"]
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

## Example - Always Show Thumb

![Example of a slider with 'Show Thumb' set to 'Always'](/images/node-examples/ui-slider-thumb-always.png "Example of a slider with 'Show Thumb' set to 'Always'"){data-zoomable}
*Example of a slider with 'Show Thumb' set to 'Always'*

## Example - Show Ticks

![Example of a slider with ticks set to 'Always'](/images/node-examples/ui-slider-ticks.png "Example of a slider with ticks set to 'Always'"){data-zoomable}
*Example of a slider with ticks set to 'Always'*

## Example - Vertical Sliders

Sliders will automatically switch to a vertical orientation when the height is greater than the width.

![Example of a vertical slider](/images/node-examples/ui-slider-vertical.png "Example of a vertical slider"){data-zoomable}
*Example of a vertical slider in a Dashboard.*
