---
description: Incorporate ui-text-input in Node-RED Dashboard 2.0 for customizable, user-driven data entry and feedback.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the text input field with respect to the parent group. Maximum value is the width of the group.
    Icon:
        description: Renders a Material Design icon within the Text Input. There is no need to include the "mdi-" prefix.
        dynamic: true
    Icon Position:
        description: If "Icon" is defined, this property controls which side of the "Label" the icon will render on.
        dynamic: true
    Icon Inner Position:
        description: If "Icon" is defined, this property controls if icon is render inside or outside the text input box.
        dynamic: true
    Label:
        description: The text shown within the text input field.  Html content is allowed.
        dynamic: true
    Tooltip: The text shown when hovering over the text input field.
    Mode:
        description: The type of HTML input to display. Options - text | password | email | number | tel | color | date | time | week | month | datetime-local
        dynamic: true
    Passthrough: If this node receives a msg in Node-RED, should it be passed through to the output as if a new value was inserted to the input?
    Send On "Delay": If true, then a msg will be emitted will be sent after the delay specified in "Delay (ms)".
    Delay: If "Send on Delay" is true, then the value in the text input will be send after this (ms) delay.
    Clear selection with button:
        description: If true, a clear icon/button appears on the right side to clear the text input
        dynamic: true
    Send On "Focus Leave": Sends a msg when the text input loses focus. Will always send, even if the value has not changed.
    Send On "Press Enter": Sends a msg when the user presses the enter key. Will always send, even if the value has not changed.
    Send On "Clear Button": Send a msg when the user clear the text input using the clear button, the "Clear Selection" button must be enabled.
controls:
    enabled:
        example: true | false
        description: Allow control over whether or not the text-input is enabled
dynamic:
    Class:
        payload: msg.class
        structure: ["String"]
    Mode:
        payload: msg.ui_update.mode
        structure: ["String"]
    Label:
        payload: msg.ui_update.label
        structure: ["String"]
    Icon:
        payload: msg.ui_update.icon
        structure: ["String"]
    Icon Position:
        payload: msg.ui_update.iconPosition
        structure: ["String"]
        examples: ["left", "right"]
    Icon Inner Position:
        payload: msg.ui_update.iconInnerPosition
        structure: ["String"]
        examples: ["inside", "outside"]
    Clearable:
        payload: msg.ui_update.clearable
        structure: ["Boolean"]
---

<script setup>
    import TryDemo from "./../../components/TryDemo.vue"
</script>


<TryDemo href="text-input">

# Text Input `ui-text-input`

</TryDemo>

Adds a single text input row to your dashboard, with a configurable "type" (text, password, etc).

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Controls

<ControlsTable/>

## Example

![Example of Text Inputs Types](/images/node-examples/ui-text-input.png "Example of Text Inputs Types"){data-zoomable}
*Example of several Text Inputs Types rendered in a Dashboard.*
