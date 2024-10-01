---
description: "Buttons create interactive UI's and can trigger flows in Node-RED"
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Icon:
        description: Renders a Material Design icon within the button. There is no need to include the "mdi-" prefix.
        dynamic: true 
    Icon Position:
        description: If "Icon" is defined, this property controls which side of the "Label" the icon will render on.
        dynamic: true
    Label:
        description: The text shown within the button. If not provided, then the button will only render the icon.
        dynamic: true
    Button Color:
        description: Button Color. If not provided, default theme color will be used.
        dynamic: true
    Text Color:
        description: Text (Label) color. If not provided calculated automatically based on Button color to be Black or White.
        dynamic: true
    Icon Color:
        description: Icon color. If not provided, will have the same color as text / label.
        dynamic: true
    Enable pointerup event:
        description: Enables the capturing of pointerup events on the button
        dynamic: false
    Enable pointerdown event:
        description: Enables the capturing of pointerdown events on the button
        dynamic: false
    Emulate Button Click: If enabled, any received message will trigger a button click, emitting the relevant payload and topic.
controls:
    enabled:
        example: true | false
        description: Allow control over whether or not the button is clickable.
dynamic:
    Icon:
        payload: msg.ui_update.icon
        structure: ["String"]
    Icon Position:
        payload: msg.ui_update.iconPosition
        structure: ["String"]
    Label:
        payload: msg.ui_update.label
        structure: ["String"]
    Button Color:
        payload: msg.ui_update.buttonColor
        structure: ["String"]
    Text Color:
        payload: msg.ui_update.textColor
        structure: ["String"]
    Icon Color:
        payload: msg.ui_update.iconColor
        structure: ["String"]
    Class:
        payload: msg.ui_update.class
        structure: ["String"]
---

<script setup>
    import TryDemo from "./../../components/TryDemo.vue"
</script>


<TryDemo href="button-example">

# Button `ui-button`

</TryDemo>

Adds a clickable button to your dashboard.

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Controls

<ControlsTable/>

## Example

![Example of a Button](/images/node-examples/ui-button.png "Example of a Button"){data-zoomable}
*Example of a rendered button in a Dashboard.*
