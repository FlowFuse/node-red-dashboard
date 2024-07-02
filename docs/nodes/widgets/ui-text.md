---
description: Employ the ui-text widget in Node-RED Dashboard 2.0 to display static or dynamic text content elegantly on your dashboard.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Label: The text shown within the button.
    Layout: Choose how to layout your label (if deifned) & value.
    Style: Checkbox to define whether or not to include custom styling for the text. Enabling this will then show the below options.
    Font: If "style" is enabled, this will define the font of the text.
    Text Size: If "style" is enabled, this will define the size of the text.
    Text Color: If "style" is enabled, this will define the color of the text.
dynamic:
    Class:
        payload: msg.class
        structure: ["String"]
---

<script setup>
    import { ref } from 'vue'
    import FlowViewer from '../../components/FlowViewer.vue'
    import ExampleHTMLInjection from '../../examples/ui-text-html-injection.json'

    const examples = ref({
      'html-injection': ExampleHTMLInjection
    })
</script>


# Text `ui-text`
 
Displays a non-editable text field on the user interface. Each received `msg.payload` will update the value shown alongside the (optional) label.

## Properties

<PropsTable/>

## Rendering HTML

The `ui-text` widget supports HTML content (via `msg.payload`). This allows you to render formatted text, links, images, and more. 

### Static HTML

For example, injecting:

```html
<a href="https://flowfuse.com" target="_blank">FlowFuse</a>
```

as a `msg.payload` would render:

![HTML Injection in Text](/images/node-examples/ui-text-html-injection.png "HTML Injection in Text"){data-zoomable}

### Rendering `msg.` Content

If you want to render the content of a `msg.` and still wrap this with HTML, you can use Node-RED's standard `template` to define the HTML structure:

<FlowViewer :flow="examples['html-injection']" height="200px"/>

With the content of the `template` node set to:

![HTML content in Text](/images/node-examples/ui-text-html-example.png "HTML Injection in Text"){data-zoomable}
_Example of a "template" node to structure HTML injection into a Text Node_

## Dynamic Properties

<DynamicPropsTable/>

## Example

![Examples of Text](/images/node-examples/ui-text.png "Examples of Text"){data-zoomable}
*Examples of variants of ui-text rendered in a Dashboard.*
