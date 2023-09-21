---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Label: The text shown within the button.
controls:
    enabled:
        example: true | false
        description: Allow control over whether or not the button is clickable.
---

<script setup>
</script>

# Button `ui-button`

Adds a clickable button to your dashboard.

## Properties

<PropsTable/>

## Controls

<ControlsTable/>

## Example

![Example of a Button](/images/node-examples/ui-button.png "Example of a Button"){data-zoomable}
*Example of a rendered button in a Dashboard.*
