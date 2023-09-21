---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Label: The text shown within the button.
    Layout: Choose how to layout your label (if deifned) & value.
    Style: Checkbox to define whether or not to include custom styling for the text. Enabling this will then show the below options.
    Font: If "style" is enabled, this will define the font of the text.
    Text Size: If "style" is enabled, this will define the size of the text.
    Text Color: If "style" is enabled, this will define the color of the text.
---

<script setup>
</script>

# Text `ui-text`
 
Displays a non-editable text field on the user interface. Each received `msg.payload` will update the value shown alongside the (optional) label.

## Properties

<PropsTable/>

## Example

![Examples of Text](/images/node-examples/ui-text.png "Examples of Text"){data-zoomable}
*Examples of variants of ui-text rendered in a Dashboard.*
