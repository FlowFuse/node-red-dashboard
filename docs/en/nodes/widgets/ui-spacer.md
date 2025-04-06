---
description: The Spacer widget is a simple spacer to aid with element layout.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width and height of the spacer with respect to the parent group. Maximum value is the width of the group.
---

<script setup>
    import AddedIn from '../../components/AddedIn.vue';
    import TryDemo from "./../../components/TryDemo.vue";
</script>

<TryDemo href="spacer">

# Spacer `ui-spacer` <AddedIn version="1.9.0" />

</TryDemo>

This widget allows users to add a simple spacer to their dashboard groups, aiding with element layout.

## Properties

<PropsTable/>


## Current Limitations

_Currently_
* the spacer widgets belong to the global flow and are not exported along with the group unless the entire flow is exported. This means that if you want to export a group with spacer widgets, you will need to either export the entire flow or add the spacer widgets manually after importing the group.
* Editing a spacer is only possible on the Dashboard 2.0 sidebar and not from the the Node-RED config sidebar.

## Using the Spacer Widget

From the Dashboard 2.0 sidebar, hover over the group you want to add the spacer to and click the `↔ spacer` button. This will add a spacer to the group that you can then drag to the desired location. Opening the spacer's edit dialog will allow you to set the size of the spacer.