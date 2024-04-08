---
description: Create grouped button interfaces in Node-RED Dashboard 2.0 for efficient action management.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Label: The text shown within the button.
    Appearance: Specify whether the shape of the widget should be rectangular or have rounded corners.
    Use theme colors: Specify whether the theme colors should be used. If not active, custom colors can be specified for each option separately.
    Options: Specify which options need to be displayed. Each option can specify a label, icon, value and color.
    Topic: The text that needs to be send in the msg.topic field.
    Passthrough: Specify whether input messages should be passed through as output messages.
controls:
    enabled:
        example: true | false
        description: Allow control over whether or not the button is clickable.
dynamic:
    Class:
        payload: msg.class
        structure: ["String"]
---

<script setup>
    import AddedIn from '../../components/AddedIn.vue';
</script>

# Button `ui-button-group` <AddedIn version="1.3.0" />

Adds a set of buttons that act as a multi-state switch to your dashboard. When an individual button is clicked, it will become active and all other buttons in the group will become inactive, with the newly selected value being emitted from the node in Node-RED.

The selected option can be set by sending a `msg.payload` with the value of the button to be selected.

## Properties

<PropsTable/>

## Examples

![Examples of a Button Group](/images/node-examples/ui-button-group.png "Example of a Button Group"){data-zoomable}
*Example of some rendered button groups in a Dashboard.*
