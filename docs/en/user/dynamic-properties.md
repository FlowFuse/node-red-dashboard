---
description: Learn how to use dynamic properties in FlowFuse Dashboard to create flexible and responsive dashboard interfaces.
---

# Dynamic Properties

Node-RED offers functionality to set properties of a node at runtime. This can be useful to generate dynamic functionality and behaviour, and in FlowFuse Dashboard, this is possible on most fields too.

For each node, you can look in the in-Editor help to see which properties can be set dynamically, or checkout the relevant documentation page for that node in this online documentation. 

In most cases, the dynamic properties are controlled via a `msg.ui_update` object. This object can contain any of the properties that are available for that node. For example, for a `ui-button` node, you can send a message like this to change the label:

```json
msg = {
    "ui_update": {
        "label": "New Label"
    }
}
```

## Updating Classes

If we consider an example with a `ui-button`, you can send the following `msg` to the button itself:

```json
msg = {
    "ui_update": {
        "class": "my-class"
    }
}
```

Note that for `class` updates, the class is appended the widget's container, so this means that your class' style definitions may need to take that into account. If you want to affect the background-color of a button for example:

```css
.my-class button.v-btn {
    background-color: red;
}
```

Will do the trick. Notice that we sometimes have to over-define the CSS selector to ensure that the style is applied correctly, overriding any underlying Vuetify/built-in stylesheets.

The CSS itself can be defined in a `ui-template` node with a "CSS (Single Page)" or "CSS (All Pages)" scope.

Note also that `msg.class` injection is still supported for legacy reasons, but it is recommended to use `ui_update.class` where possible.