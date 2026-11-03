---
description: "Buttons create interactive UI's and can trigger flows in Node-RED"
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Icon:
        description: Renders a Material Design icon within the button. There is no need to include the "mdi-" prefix.
        dynamic: true 
    Icon Position:
        description: If "Icon" is defined, this property controls which side of the "Label" the icon will render on.
        dynamic: true
    Label:
        description: The text shown within the button. If not provided, then the button will only render the icon.
        dynamic: true
    Button Color:
        description: Button Color. If not provided, default theme color will be used.
        dynamic: true
    Text Color:
        description: Text (Label) color. If not provided calculated automatically based on Button color to be Black or White.
        dynamic: true
    Icon Color:
        description: Icon color. If not provided, will have the same color as text / label.
        dynamic: true
    Enable pointerup event:
        description: Enables the capturing of pointerup events on the button. The output will contain <code>msg._event</code> which details the <i>type</i> of interaction causing the event.
        dynamic: false
    Enable pointerdown event:
        description: Enables the capturing of pointerdown events on the button. The output will contain <code>msg._event</code> which details the <i>type</i> of interaction causing the event.
        dynamic: false
    Enable click event:
        description: Enables the capturing of click events on the button, i.e.g when both the pointerdown and pointerup events occur whilst the mouse stays inside the button. The output will contain <code>msg._event</code> which details the <i>type</i> of interaction causing the event.
        dynamic: false
    Payload:
        description: The <code>msg.payload</code> sent on click. As well as the usual value types, <i>navigate</i>, <i>popup</i> and <i>modal</i> make the button go to a page or open a dialog group. See <a href="#navigation-and-dialogs">Navigation and dialogs</a>.
        dynamic: false
    Emulate Button Click: If enabled, any received message will trigger a button click, emitting the relevant payload and topic.
controls:
    enabled:
        example: true | false
        description: Allow control over whether or not the button is clickable.
dynamic:
    Icon:
        payload: msg.ui_update.icon
        structure: ["String"]
    Icon Position:
        payload: msg.ui_update.iconPosition
        structure: ["String"]
    Label:
        payload: msg.ui_update.label
        structure: ["String"]
    Button Color:
        payload: msg.ui_update.buttonColor
        structure: ["String"]
    Text Color:
        payload: msg.ui_update.textColor
        structure: ["String"]
    Icon Color:
        payload: msg.ui_update.iconColor
        structure: ["String"]
    Class:
        payload: msg.ui_update.class
        structure: ["String"]
---

<script setup>
    import { ref } from 'vue'

    import ExampleButtonHold from '../../../examples/ui-button-hold.json'

    import TryDemo from "./../../../components/TryDemo.vue"
    import FlowViewer from '../../../components/FlowViewer.vue'
    
    const examples = ref({
      'hold': ExampleButtonHold
    })
</script>


<TryDemo href="button-example">

# Button `ui-button`

</TryDemo>

Adds a clickable button to your dashboard.

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Controls

<ControlsTable/>

## Navigation and dialogs

The click payload can make the button act in the dashboard without any extra nodes:

- **navigate**: go to a page picked from the list, or to *Back*, *Previous page* or *Next page*. Previous and next follow the pages in the navigation menu, skipping hidden pages, disabled pages and links, and wrap around. Back returns to the previous dashboard page, and does nothing if the dashboard was just opened.
- **popup**: open a [dialog group](../config/ui-group.md). Clicking outside it or pressing Esc closes it.
- **modal**: open a dialog group that only closes with its close button.

The lists only show pages and dialog groups of the dashboard the button is in. If a dialog group is on another page, the dashboard switches to that page first and then opens it.

If the page or dialog group a button points at is deleted, the node is marked as invalid in the editor and the list shows it as missing.

The button still sends its message, so a flow can react to the click. `msg.payload` is set to the page or group name, or to `back`, `prev` or `next`.

"Emulate Button Click" sends the message for a received `msg`, but doesn't navigate or open the dialog, because the click happens in the browser. Use a [`ui-control`](./ui-control.md) node to navigate or open a dialog from a flow.

## Example

### Simple Button

![Example of a Button](/images/node-examples/ui-button.png "Example of a Button"){data-zoomable}
*Example of a rendered button in a Dashboard.*

### Measuring Hold Duration

It's possible to configure a button to emit `pointerdown` and `pointerup` events. With this, it's possible to measure how long a button is held down for.

<video controls height="200px">
    <source src="/videos/demo-button-hold.mp4" type="video/mp4">
</video>

The flow to achieve this demo is as follows:

<FlowViewer :flow="examples['hold']" height="200px"/>