---
description: Notify users of important updates and alerts with ui-notification in Node-RED Dashboard 2.0.
props:
    UI: Unlike most widgets, notifications are owned by a "UI", not Group. This allows for notifications to be displayed across all pages.
    Position: The position on the screen whethere the notification will appear.
    Color: The color that should be used for the notification border.
    Timeout: Number of seconds before the notification will automatically close.
    Show Countdown Bar: Whether or not to show a reducing progress bar to indicate the time remaining before the notification will close.
    Allow Manual Dismissal: Show a button for users to <b>dismiss</b> the notification. Otherwise, will only close after Timeout.
    Allow Manual Dismissal - Button Label: If <i>"Allow Manual Dismissal"</i> is enabled, this is the label for the button.
    Allow Manual Confirmation: Show a button for users to <b>confirm</b> the notification. Otherwise, will only close after Timeout.
    Allow Manual Confirmation - Button Label: If <i>"Allow Manual Confirmation"</i> is enabled, this is the label for the button.
    Accept Raw: Whether you're passing in raw HTML that should be processed client-side.
    Class: Appends CSS classes to the widget
dynamic:
    Disabled State:
        payload: msg.enabled
        structure: ["Boolean"]
    Allow confirmation:
        payload: msg.ui_update.allowConfirm
        structure: ["Boolean"]
    Allow dismissal:
        payload: msg.ui_update.allowDismiss
        structure: ["Boolean"]
    Color:
        payload: msg.ui_update.color
        structure: ["String"]
    Confirmation button text:
        payload: msg.ui_update.confirmText
        structure: ["String"]
    Dismissal button text:
        payload: msg.ui_update.dismissText
        structure: ["String"]
    Display time(out):
        payload: msg.ui_update.displayTime
        structure: ["Number"]
    Position:
        payload: msg.ui_update.position
        structure: ["top right", "top center", "top left", "bottom right", "bottom center", "bottom left", "center center"]
    Progress bar color:
        payload: msg.ui_update.progressColor
        structure: ["String"]
    Accept raw html:
        payload: msg.ui_update.raw
        structure: ["Boolean"]
    Show:
        payload: msg.ui_update.show
        structure: ["Boolean"]
    Show countdown bar:
        payload: msg.ui_update.showCountdown
        structure: ["Boolean"]
---

<script setup>
    import AddedIn from '../../components/AddedIn.vue';
    import TryDemo from "./../../components/TryDemo.vue";
</script>

# Notification `ui-notification` <AddedIn version="0.5.0" />

<TryDemo href="notification" />

Known in Dashboard 1.0 as a "Toast", this widget displays text/HTML in a small window that will appear on the screen for a defined duration of time (`timeout`) and at a defined location on the screen (`position`).

If you want to have the notification show indefinitely, you can set `timeout` to `0`. It will not be possible to close the notification manually unless you also set `allowDismiss` or `allowConfirm` to `true`.

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Example

![Example of rendered Notification](/images/node-examples/ui-notification.png "Example of rendered Notification"){data-zoomable}
*Example of rendered Notification in a Dashboard with a progress bar showing how long left until it will automatically close.*

This notification was created using a `msg.payload` of:

```html
<h3>Generated Notification</h3><p>This is custom HTML injected into <b>Node-RED</b></p>
```

### Sending to all clients

Notifications are, by default, constrained to send to a single user/client. In Dashboard 2.0 this constraint is defined by `msg._client`. You can read more about this [here](../../user/multi-tenancy.md#configuring-client-data).

If you want to send a notification to _all_ connected clients, you can remove the `msg._client` value using a "change" node, configured to "Delete" the `_client` property.