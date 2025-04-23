---
description: Create grouped button interfaces in FlowFuse Dashboard for efficient action management.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Label:  
        description: The text shown within the button.  Html content is allowed.
        dynamic: true
    Appearance: Specify whether the shape of the widget should be rectangular or have rounded corners.
    Use theme colors: Specify whether the theme colors should be used. If not active, custom colors can be specified for each option separately.
    Options:
        description: Specify which options need to be displayed. Each option can specify a label, icon, value and color.  Html content is allowed for the labels.
        dynamic: true
    Topic: The text that needs to be send in the msg.topic field.
    Passthrough: Specify whether input messages should be passed through as output messages.
    Class:
        payload: msg.ui_update.class
        structure: ["String"]
controls:
    enabled:
        example: true | false
        description: Allow control over whether or not the button is clickable.
dynamic:
    Disabled State:
        payload: msg.enabled
        structure: ["Boolean"]
    Label:
        payload: msg.ui_update.label
        structure: ["String"]
    Options:
        payload: msg.ui_update.options
        structure: ["Array<String>", "Array<{value: String}>", "Array<{value: String, label: String}>", "Array<{value: String, icon: String}>"]
---

<script setup>
    import AddedIn from '../../components/AddedIn.vue';
    import TryDemo from "./../../components/TryDemo.vue"
</script>

<TryDemo href="button-group">

# Button `ui-button-group` <AddedIn version="1.3.0" />

</TryDemo>

Adds a set of buttons that act as a multi-state switch to your dashboard. When an individual button is clicked, it will become active and all other buttons in the group will become inactive, with the newly selected value being emitted from the node in Node-RED.

The selected option can be set by sending a `msg.payload` with the value of the button to be selected.

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Examples

![Examples of a Button Group](/images/node-examples/ui-button-group.png "Example of a Button Group"){data-zoomable}
*Example of some rendered button groups in a Dashboard.*
