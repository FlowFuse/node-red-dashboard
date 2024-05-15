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
    Emulate Button Click: If enabled, any received message will trigger a button click, emitting the relevant payload and topic.
controls:
    enabled:
        example: true | false
        description: Allow control over whether or not the button is clickable.
dynamic:
    Icon:
        payload: msg.icon
        structure: ["String"]
    Icon Position:
        payload: msg.iconPosition
        structure: ["String"]
    Label:
        payload: msg.label
        structure: ["String"]
    Class:
        payload: msg.class
        structure: ["String"]
---

<script setup>
</script>

# Button `ui-button`

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
