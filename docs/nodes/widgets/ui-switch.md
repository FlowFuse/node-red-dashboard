---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Label: The text shown within the button.
    On Payload: The type & value to output in <code>msg.payload</code> when the switch is turned on.
    Off Payload: The type & value to output in <code>msg.payload</code> when the switch is turned off.
    On Icon: If provided, this <a href="https://pictogrammers.com/library/mdi/" target="_blank">Material Design icon</a> will replace the default switch when in "on" state
    Off Icon: If provided, this <a href="https://pictogrammers.com/library/mdi/" target="_blank">Material Design icon</a> will replace the default switch when in "off" state
    On Color: If provided with a icons, this colour is used for the icon when in "on" state
    Off Color: If provided with a icons, this colour is used for the icon when in "off" state
dynamic:
    Class:
        payload: msg.class
        structure: ["String"]
---

<script setup>
</script>

# Toggle Switch `ui-switch`

Adds a toggle switch to the user interface.

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Example

![Example of a Toggle Switch](/images/node-examples/ui-switch.png "Example of a Toggle Switch"){data-zoomable}
*Example of rendered switches in a Dashboard.*
