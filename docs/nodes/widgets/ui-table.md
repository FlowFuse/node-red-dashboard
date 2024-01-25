---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Label: The text shown within the button.
    Max Rows: Defines the maximum number of data-rows to render in the table. Excess rows will be available through pagination control.
    Auto Columns: If checked, then the columns are calculated automatically based on the contents of received messages.
    Columns: If "Auto Columns" is false, then these columns are used when rendering the table instead.
dynamic:
    Class:
        payload: msg.class
        structure: ["String"]
---

<script setup>
    import AddedIn from '../../components/AddedIn.vue'
</script>

# Data Table `ui-table` <AddedIn version="0.4.0" />

Renders a set of data in a tabular format. Expects an input (`msg.payload`) in the format of:

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

## Dynamic Properties

<DynamicPropsTable/>

## Examples

![Example of a Data Table](/images/node-examples/ui-table.png "Example of a Data Table"){data-zoomable}
*Example of a rendered data table in a Dashboard.*

![Example of a Paginated Table](/images/node-examples/ui-table-pagination.png "Example of a Paginated Table"){data-zoomable}
*Example of a paginated table which has 10 rows of data, but with "Max Rows" set to 5.*

## Custom Styling & Content

If you're looking to add more customisation to how your data is rendered, you can do so by building your own data table inside a `ui-template`. Check out [this example](../../user/template-examples.md#custom-tables) for more details.