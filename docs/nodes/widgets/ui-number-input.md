---
description: Incorporate ui-number-input in Node-RED Dashboard 2.0 for customizable, user-driven data entry and feedback.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the number input field with respect to the parent group. Maximum value is the width of the group.
    Icon: Renders a Material Design icon within the Number Input. There is no need to include the "mdi-" prefix.
    Icon Position: If "Icon" is defined, this property controls which side of the "Label" the icon will render on.
    Icon Inner Position: If "Icon" is defined, this property controls if icon is render inside or outside the number input box
    Label: The number shown within the number input field.
    Tooltip: The number shown when hovering over the number input field.
    Passthrough: If this node receives a msg in Node-RED, should it be passed through to the output as if a new value was inserted to the input?
    Clear selection with button: If true, a clear icon/button appears on the rigth side to clear the number input
    Send On "Clear Button": Send a msg when the user clear the number input using the clear button, the "Clear Selection" button must be enabled.
controls:
    enabled:
        example: true | false
        description: Allow control over whether or not the number-input is enabled
dynamic:
    Class:
        payload: msg.class
        structure: ["String"]
---

<script setup>
    import TryDemo from "./../../components/TryDemo.vue"
</script>


<TryDemo href="number-input">

# Number Input `ui-number-input`

</TryDemo>

Adds a single number input row to your dashboard.

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Controls

<ControlsTable/>

## Example

![Example of Number Inputs Types](/images/node-examples/ui-number-input.png "Example of Number Inputs Types"){data-zoomable}
*Example of severall Number Inputs Types rendered in a Dashboard.*
