---
description: Employ the ui-text widget in FlowFuse Dashboard to display static or dynamic text content elegantly on your dashboard.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the text widget with respect to the parent group. Maximum value is the width of the group.
    Label: The text shown within the widget label.  Html content is allowed.
    Layout: Choose how to layout your label (if defined) & value.
    Style: Checkbox to define whether or not to include custom styling for the text. Enabling this will then show the below options.
    Font: If "style" is enabled, this will define the font of the text.
    Text Size: If "style" is enabled, this will define the size of the text.
    Text Color: If "style" is enabled, this will define the color of the text.
    Value:
        description: The value to be shown by the text widget. Can be a property of the message, e.g. `msg.payload` or `msg.myProperty`, a flow/global context variable, or a static value. You can also use the type "JSONata" to evaluate a JSONata expression and perform computations on the value, e.g. <code>$round(payload, 1)</code> to round to 1 decimal place.
        dynamic: true
dynamic:
    Label:
        payload: msg.ui_update.label
        structure: ["String"]
    Layout:
        payload: msg.ui_update.layout
        structure: ["String<'row-left', 'row-center', 'row-right', 'row-spread', 'col-center'>"]
    Font:
        payload: msg.ui_update.font
        structure: ["String"]
    Font Size:
        payload: msg.ui_update.fontSize
        structure: ["String"]
    Color:
        payload: msg.ui_update.color
        structure: ["String"]
    Class:
        payload: msg.class
        structure: ["String"]
---

<script setup>
    import { ref } from 'vue'
    import FlowViewer from '../../../components/FlowViewer.vue'
    import ExampleSuffix from '../../../examples/ui-text-suffix.json'
    import ExampleHTMLInjection from '../../../examples/ui-text-html-injection.json'
    import TryDemo from "./../../../components/TryDemo.vue"

    const examples = ref({
      'suffix': ExampleSuffix,
      'html-injection': ExampleHTMLInjection
    })
</script>


<TryDemo href="text">

# Text `ui-text`

</TryDemo>
 
Displays a non-editable text field on the user interface. Each received `msg.payload` will update the value shown alongside the (optional) label.

## Properties

<PropsTable/>

## Adding Prefixes & Suffixes

In Node-RED Dashboard an option existed called `valueFormat` which allowed you to add a prefix or suffix to a `ui-text` widget within the node's configuration. Whilst valuable, this had a lot of security vulnerabilities, so with FlowFuse Dashboard we made the decision to remove it.

Instead, we take a different approach, and use Node-RED's built-in "template" node:

<FlowViewer :flow="examples['suffix']" height="200px" />

Which renders:

![Adding a suffix to a UI Text element](/images/node-examples/ui-text-prefix.gif "Adding a suffix to a UI Text element"){data-zoomable}
_Example of a rendered suffix on a UI Text element_

We do this because this approach can be used far beyond just the `ui-text` widget, and can be used to inject HTML content into any widget through [dynamic properties](../../user/dynamic-properties.md).

## Rendering HTML

The `ui-text` widget supports HTML content (via `msg.payload`). This allows you to render formatted text, links, images, and more. 

### Static HTML

For example, injecting:

```html
<a href="https://flowfuse.com" target="_blank">FlowFuse</a>
```

as a `msg.payload` would render:

![HTML content in Text](/images/node-examples/ui-text-html-injection.png "HTML Injection in Text"){data-zoomable}

### Rendering `msg.` Content

If you want to render the content of a `msg.` and still wrap this with HTML, you can use Node-RED's standard `template` to define the HTML structure:

<FlowViewer :flow="examples['html-injection']" height="200px"/>

With the content of the `template` node set to:

![HTML content in Text](/images/node-examples/ui-text-html-example.png "HTML Injection in Text"){data-zoomable}
_Example of a "template" node to structure HTML content in a Text Node_

## Dynamic Properties

<DynamicPropsTable/>

## Formatting Value

![Example of a Text with a formatted value](/images/node-examples/ui-text-jsonata-value.png "Example of a Text with a formatted value"){data-zoomable}
_Example of a Text with a formatted value, using JSONata to round the value to 1 decimal place._

If you're passing in a `msg` that needs formatting, before being displayed on the Text, you can use the `Value` property to format the value.

For example, if you want to round the value to 1 decimal place, you can set the type of Value to "JSONata" and use the following:

```js
$round(payload, 1) // round to 1 decimal place
```

You can read more about the JSONata expression language and in particular, its numeric functions, [here](https://docs.jsonata.org/numeric-functions)

## Example

![Examples of Text](/images/node-examples/ui-text.png "Examples of Text"){data-zoomable}
*Examples of variants of ui-text rendered in a Dashboard.*
