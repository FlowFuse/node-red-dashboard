---
description: Integrate ui-slider in Node-RED Dashboard 2.0 for dynamic value input through a simple sliding mechanism.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the slider with respect to the parent group. Maximum value is the width of the group.
    Label:
        description: The text shown to the left of the slider.  Html content is allowed.
        dynamic: true
    Thumb Label:
        description: Defined when the thumb of the slider will show. Defaults to 'On Drag'.
        dynamic: true
    Show Ticks:
        description: Defined when the ticks will be visible on the track. Defaults to 'Always'.
        dynamic: true
    Range:
        description: min - the minimum value the slider can be changed to.  When min > max then the slider will be reversed.; max - the maximum value the slider can be changed to; step - the increment/decrement value when the slider is moved.
        dynamic: true
    Color:
        description: main - color of the slider and thumb; track - color of the slider track; thumb - color of the handle. It could be the name of a color (red, green, blue, ...) or a Hex color code (#b5b5b5).
        dynamic: true
    Icons:
        description: Add <a href="https://pictogrammers.com/library/mdi/">mdi icon</a> before and after the slider. For example, "minus". There is no need to include the "mdi-" prefix, just the name of the icon.
        dynamic: true    
    Output: Defines when a msg is emitted, either as the slider is moved, or as the slider is released.        
controls:
    enabled:
        example: true | false
        description: Allow control over whether or not the button is clickable.
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
    Icon Prepend:
        payload: msg.ui_update.iconPrepend
        structure: ["String"]
    Icon Append:
        payload: msg.ui_update.iconAppend
        structure: ["String"]
    Color:
        payload: msg.ui_update.color
        structure: ["String"]
    Color Track:
        payload: msg.ui_update.colorTrack
        structure: ["String"]
    Color Thumb:
        payload: msg.ui_update.colorThumb
        structure: ["String"]
    Class:
        payload: msg.ui_update.class
        structure: ["String"]
    Show Text Field:
        payload: msg.ui_update.showTextField
        structure: ["true | false"]
---

<script setup>
    import TryDemo from "./../../components/TryDemo.vue";
</script>

<TryDemo href="slider">

# Slider `ui-slider`

</TryDemo>

Adds a slider to your dashboard that will emit values in Node-RED under `msg.payload` anytime it's value is changed.

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

### Setting Value

You can set the value of the slider by passing in the respective value in `msg.payload`.

## Controls

<ControlsTable/>

## Example - Basic

![Example of a slider](/images/node-examples/ui-slider.png "Example of a slider"){data-zoomable}
*Example of a rendered slider in a Dashboard.*

## Example - Always Show Thumb

![Example of a slider with 'Show Thumb' set to 'Always'](/images/node-examples/ui-slider-thumb-always.png "Example of a slider with 'Show Thumb' set to 'Always'"){data-zoomable}
*Example of a slider with 'Show Thumb' set to 'Always'*

## Example - Show Ticks

![Example of a slider with ticks set to 'Always'](/images/node-examples/ui-slider-ticks.png "Example of a slider with ticks set to 'Always'"){data-zoomable}
*Example of a slider with ticks set to 'Always'*

### Customize ticks

Ticks can customized by overriding the CSS for slider.

The appearance of ticks can be changed by using the following CSS variables

- <code>--tick-scaleX</code> to resize ticks horizontally
- <code>--tick-scaleY</code> to resize ticks vertically
- <code>--tick-color</code> to change ticks color

Note that you may need to create different classes for vertical and horizontal slider.


```css
.my-slider-horizontal.nrdb-ui-slider{
    --tick-scaleX: 0.25;
    --tick-scaleY: 4;
    --tick-color: rgba(var(--v-theme-primary),0.7);
}
.my-slider-vertical.nrdb-ui-slider{
    --tick-scaleX: 4;
    --tick-scaleY: 0.25; 
    --tick-color: orange;
}
```

Different styles can be applied to the ticks of the filled part of the slider.

```css
.my-slider-horizontal.nrdb-ui-slider .v-slider-track__tick--filled{
    --tick-color:violet;
}
```

## Example - Vertical Sliders

Sliders will automatically switch to a vertical orientation when the height is greater than the width.

![Example of a vertical slider](/images/node-examples/ui-slider-vertical.png "Example of a vertical slider"){data-zoomable}
*Example of a vertical slider in a Dashboard.*
