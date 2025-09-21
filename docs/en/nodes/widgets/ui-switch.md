---
description: Utilize the ui-switch widget in FlowFuse Dashboard to create interactive toggle controls for dynamic dashboard interactions.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Label:
        description: The text shown within the button.  Html content is allowed.
        dynamic: true
    Layout:
        description: Defines how the label and the switch are arranged. Users can choose between different layout options such as aligning elements to the left, left reversed, spread evenly or spread evenly but in reversed order.
        dynamic: true
    Clickable:
        description: The clickable area (which will result in the switch toggling).
        dynamic: true
    On Icon:
        description: If provided, this <a href="https://pictogrammers.com/library/mdi/" target="_blank">Material Design icon</a> will replace the default switch when in "on" state. No need to include the <code>mdi</code> prefix.
        dynamic: true
    Off Icon:
        description: If provided, this <a href="https://pictogrammers.com/library/mdi/" target="_blank">Material Design icon</a> will replace the default switch when in "off" state. No need to include the <code>mdi</code> prefix.
        dynamic: true
    On Color:
        description: If provided with a icons, this colour is used for the icon when in "on" state
        dynamic: true
    Off Color:
        description: If provided with a icons, this colour is used for the icon when in "off" state
        dynamic: true
    Passthrough: If enabled, the widget will pass through the input message to the output.
    Indicator: Only available when "Passthrough" is set to <code>false</code>. Defines whether the switch shows the status of the output, or any provided input via <code>msg.payload</code>.
    On Payload: The type & value to output in <code>msg.payload</code> when the switch is turned on.
    Off Payload: The type & value to output in <code>msg.payload</code> when the switch is turned off.
controls:
    enabled:
        example: true | false
        description: Allow control over whether or not the switch can be toggled via the UI.
dynamic:
    Class:
        payload: msg.ui_update.class
        structure: ["String"]
    Label:
        payload: msg.ui_update.label
        structure: ["Boolean"]
    Layout:
        payload: msg.ui_update.layout
        structure: ["String"]
    Clickable:
        payload: msg.ui_update.clickableArea
        structure: ["String"]
    Passthrough:
        payload: msg.ui_update.passthru
        structure: ["Boolean"]
    Indicator:
        payload: msg.ui_update.decouple
        structure: ["Boolean"]
    On Color:
        payload: msg.ui_update.oncolor
        structure: ["String"]
    Off Color:
        payload: msg.ui_update.offcolor
        structure: ["String"]
    On Icon:
        payload: msg.ui_update.onicon
        structure: ["String"]
    Off Icon:
        payload: msg.ui_update.officon
        structure: ["String"]
---

<script setup>
    import TryDemo from "./../../../components/TryDemo.vue";
</script>


<TryDemo href="switch">

# Toggle Switch `ui-switch`

</TryDemo>

Adds a toggle switch to the user interface.

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Controls

<ControlsTable/>

## Example

![Example of a Toggle Switch](/images/node-examples/ui-switch.png "Example of a Toggle Switch"){data-zoomable}
*Example of rendered switches in a Dashboard.*
