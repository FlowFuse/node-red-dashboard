---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Label: The text shown within the button.
    Auto Columns: If checked, then the columns are calculated automatically based on the contents of received messages.
    Columns: If "Auto Columns" is false, then these columns are used when rendering the table instead.
---

<script setup>
</script>

# Data Table `ui-table`

Renders a set of data in a tabular format. Expects an input (`mag.payload`) in the format of:

```json
[{
    "colA": "A",
    "colB": "Hello",
    "colC": 3
}, {
    "colA": "B",
    "colB": "World",
    "colC": 5
}]
```

The table will be rendered with colums `colA`, `colB` and `colC`, unless "Columns" are explicitely defined on the node, with "Auto Columns" toggled off.

## Properties

<PropsTable/>

## Example

![Example of a Data Table](../../assets/images/node-examples/ui-table.png "Example of a Data Table"){data-zoomable}
*Example of a rendered data table in a Dashboard.*
