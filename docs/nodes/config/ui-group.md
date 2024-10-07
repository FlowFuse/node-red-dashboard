---
description: Group your widgets effectively in Node-RED Dashboard 2.0 for better organization and user navigation.
props:
    Name: Descriptive name for this group, will show in the Node-RED Editor and as a label in the Dashboard.
    Page: The Page (<code>ui-page</code>) that this group will render on. 
    Size: The width and height of the group. Height will always be reinforced by this value, the height is generally a <i>minimum</i> height, and will extend to fit it's content.
    Class: Any custom CSS classes you wish to add to the Group.
    Default State: <ul><li><b>Visibility</b> - Defines the default visibility of this group. </li><li><b>Interactivity</b> - Controls whether the group and it's contents are disabled/enabled when the page is loaded. </li><li><b>Type</b> - Controls whether the group appears as a default group or as a dialog, which needs to be triggered manually using ui-control. You can choose between 'Default' and 'Dialog' types. </li></ul><p>Both of these can be overridden by the user at runtime using a <code>ui-control</code> node.</p>
---

<script setup>
</script>

# Config: UI Group `ui-group`

Each group is rendered within a `ui-page` as part of a [Layout](../../contributing/guides/layouts). Each layout will differ in how those groups are rendered, but fundamentally, a group is a collection of widgets, and generally has a label to categorise the contents of a single group.

## Properties

<PropsTable :hide-dynamic="true"/>