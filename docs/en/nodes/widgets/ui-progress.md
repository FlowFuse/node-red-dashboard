---
description: "Display progress and completion status with a visual progress bar"
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the progress bar with respect to the parent group. Maximum value is the width of the group.
    Label:
        description: "The text shown alongside the progress percentage. If provided, displays as \"Label: XX%\" within the progress bar."
        dynamic: true
    Color:
        description: Color for the progress bar, valid values include Vuetify theme colors (primary, secondary, success, error, warning, info) or custom colors (green, #a5a5a5, rgb(165,165,165), green-darken-2). Defaults to "primary".
        dynamic: true
    Class:
        description: Optional CSS class names to apply to the progress bar for custom styling.
        dynamic: false
controls:
    enabled:
        example: true | false
        description: Allow control over whether or not the progress bar updates are processed.
dynamic:
    Label:
        payload: msg.ui_update.label
        structure: ["String"]
    Color:
        payload: msg.ui_update.color
        structure: ["String"]
---

# Progress `ui-progress`

Displays a visual progress bar to show completion status or ongoing processes on your dashboard.

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Controls

<ControlsTable/>

## Input

The progress bar accepts numeric values via `msg.payload`:

- **Payload Type**: Number (0-100)
- **Description**: Represents the completion percentage. Values are automatically clamped to the 0-100 range.
- **Example**: `msg.payload = 75` displays a 75% complete progress bar

## Example

### Basic Progress Bar

![Example of a Progress Bar](/images/node-examples/ui-progress.png "Example of a Progress Bar"){data-zoomable}
*Example of a rendered progress bar in a Dashboard showing 79% completion.*

### Dynamic Updates

The progress bar can be updated in real-time by sending messages with numeric payloads. You can also dynamically change the label and color:

```javascript
// Update progress to 80%
msg.payload = 80;
return msg;

// Update progress and change label/color
msg.payload = 45;
msg.ui_update = {
    label: "Loading Data",
    color: "warning"
};
return msg;
```

The progress bar is commonly used for:
- File upload/download progress
- Task completion status  
- Data processing indicators
- System health metrics
- Battery level displays
