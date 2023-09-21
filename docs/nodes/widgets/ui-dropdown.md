---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the dropdown with respect to the parent group. Maximum value is the width of the group.
    Label: The text shown to the left of the dropdown.
    Options: A list of the options available in the dropdown. Each row defines a `label` (shown in the dropdown) and `value` (emitted on selection) property.
    Allow Multiple: Whether or not a user can select multiple options, if so, checkboxes are shown, and value is emitted in an array.
---

<script setup>
</script>

# Dropdown `ui-dropdown`

Adds a dropdown to your dashboard that will emit values in Node-RED under `msg.payload` anytime it's value is changed.

## Programmatic Selections

You can dynamically make selections for this dropdown by passing in the respective `value` to `msg.payload`.

### Single Selection

To make a single selection, pass in the `value` of the option as `msg.payload`, e.g. `msg.payload = "option1"`.

### Multi-Selection

 To make a multi-selection selection, you must first have "Allow Multiple" enabled on the node, you can then pass an Array of `value` of the respective options as `msg.payload`, e.g. `msg.payload = ["option1", "option2"]`.

### Clear Selection

 To clear any selection for a dropdown, pass an empty array `[]` as `msg.payload`.

## Properties

<PropsTable/>

## Example

![Example of a dropdown](/images/node-examples/ui-dropdown.png "Example of a dropdown"){data-zoomable}
*Example of a rendered dropdown in a Dashboard.*
