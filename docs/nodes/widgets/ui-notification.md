---
description: Notify users of important updates and alerts with ui-notification in Node-RED Dashboard 2.0.
props:
    UI: Unlike most widgets, notifications are owned by a "UI", not Group. This allows for notifications to be displayed across all pages.
    Position: The position on the screen whethere the notification will appear.
    Timeout: Number of seconds before the notification will automatically close.
    Show Countdown Bar: Whether or not to show a reducing progfress bar to indicate the time remaining before the notification will close.
    Allow Manual Dismissal: Whether or not to show a button that will allow the user to dismiss the notification. Otherwise, will only close after Timeout.
    Button Label: If "Allow Manual Dismissal" is enabled, this is the label for the button.
    Accept Raw: Whether you're passing in raw HTML that should be processed client-side.
    Class: Appends CSS classes to the widget
---

<script setup>
    import AddedIn from '../../components/AddedIn.vue'
</script>

# Notification `ui-notification` <AddedIn version="0.5.0" />

Known in Dashboard 1.0 as a "Toast", this widget displays text/HTML in a small window that will appear on the screen for a defined duration of time (`timeout`) and at a defined location on the screen (`position`).

If you want to have the notification show indefinitely, you can set `timeout` to `0`. It will not be possible to close the notification manually unless you also set `allowDismiss` to `true`.

## Properties

<PropsTable/>

## Example

![Example of rendered Notification](/images/node-examples/ui-notification.png "Example of rendered Notification"){data-zoomable}
*Example of rendered Notification in a Dashboard with a progress bar showing how long left until it will automatically close.*

This notification was created using a `msg.payload` of:

```html
<h3>Generated Notification</h3><p>This is custom HTML injected into <b>Node-RED</b></p>
```