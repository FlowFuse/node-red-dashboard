---
description: Group your widgets effectively in Node-RED Dashboard 2.0 for better organization and user navigation.
props:
    Name: Descriptive name for this group, will show in the Node-RED Editor and as a label in the Dashboard.
    Page: The Page (<code>ui-page</code>) that this group will render on.
    Type: Controls whether the group appears as a default group or as a dialog, which needs to be triggered manually using ui-control. You can choose between 'Default' and 'Dialog' types.
    Size: The width and height of the group. Height will always be reinforced by this value, the height is generally a <i>minimum</i> height, and will extend to fit it's content.
    Class: Any custom CSS classes you wish to add to the Group.
    Default State: <ul><li><b>Visibility</b> - Defines the default visibility of this group.</li><li><b>Interactivity</b> - Controls whether the group and it's contents are disabled/enabled when the page is loaded.</li></ul><p>Both of these can be overridden by the user at runtime using a <code>ui-control</code> node.</p>
---

<script setup>
    
    import { ref } from 'vue'
    import FlowViewer from '../../components/FlowViewer.vue'
    import ExampleGroupDialog from '../../examples/group-dialog-type.json'

    const examples = ref({
      'group-dialog': ExampleGroupDialog
    })
</script>

# Config: UI Group `ui-group`

Each group is rendered within a `ui-page` as part of a [Layout](../../contributing/guides/layouts). Each layout will differ in how those groups are rendered, but fundamentally, a group is a collection of widgets, and generally has a label to categorise the contents of a single group.

## Properties

<PropsTable :hide-dynamic="true"/>

## Type

Defines how the group will be displayed. Either as a regular (**Default**) group or as a **Dialog** group. A 'Default' group is visible by default, while a 'Dialog' group must be triggered manually using the `ui-control` node ([see documentation](/nodes/widgets/ui-control.html#show-hide)). You can choose between these two options based on your layout needs.

### Default Groups

![Example of how the type 'Default' option looks](/images/node-examples/ui-group-type-default.png "Example of how the type 'Default' option looks"){data-zoomable}
_Example of how the type 'Default' option looks_

### Dialog Groups

![Example of how the type 'Dialog' option looks](/images/node-examples/ui-group-type-dialog.png "Example of how the type 'Dialog' option looks"){data-zoomable}
_Example of how the type 'Dialog' option looks_

<FlowViewer :flow="examples['group-dialog']" height="250px" />