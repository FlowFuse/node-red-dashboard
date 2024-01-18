---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Label: The text shown within the button.
    Mode: The type of HTML input to display. Options - text | password | email | number | tel | color | date | time | week | month | datetime-local
    Passthrough: If this node receives a msg in Node-RED, should it be passed through to the output as if a new value was inserted to the input?
    Send On "Delay": If true, then a msg will be emitted will be sent after the delay specified in "Delay (ms)".
    Delay: If "Send on Delay" is true, then the value in the text input will be send after this (ms) delay.
    Send On "Focus Leave": Sends a msg when the text input loses focus. Will only send if the value has changed from the last msg sent
    Send On "Press Enter": Sends a msg when the user presses the enter key. Will always send, even if the value has not changed.
dynamic:
    Class:
        payload: msg.class
        structure: ["String"]
---

<script setup>
</script>

# Text Input `ui-text-input`

Adds a single text input row to your dashboard, with a configurable "type" (text, password, etc).

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Example

![Example of a Button](/images/node-examples/ui-text-input.png "Example of a Button"){data-zoomable}
*Example of a rendered button in a Dashboard.*
