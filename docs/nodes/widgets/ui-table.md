---
description: Display and manage complex datasets with ease using the ui-table widget in Node-RED Dashboard 2.0.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Label: The text shown within the button.
    Max Rows: Defines the maximum number of data-rows to render in the table. Excess rows will be available through pagination control.
    Selection: Provides three options for table interaction - "None", "Click" and "Checkbox"
    Show Search: Defines whether or not to show a search bar above the table. Will permit searching and filtering across all columns.
    Auto Columns: If checked, then the columns are calculated automatically based on the contents of received messages.
    Columns: If "Auto Columns" is false, then these columns are used when rendering the table instead.
dynamic:
    Class:
        payload: msg.class
        structure: ["String"]
---

<script setup>
    import { ref } from 'vue'

    import ExampleCellTypes from '../../examples/ui-table-cell-types.json'

    import FlowViewer from '../../components/FlowViewer.vue'
    import AddedIn from '../../components/AddedIn.vue'

    const examples = ref({
      'cellTypes': ExampleCellTypes
    })
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

### Selection

- **None**: No selection is allowed. The table will just display the data.
- **Click**: The full row becomes a clickable entity, and the `ui-table` node will _output the full object_ associated to a row when clicked.
- **Checkbox**: Each row has a checkbox, and the `ui-table` node will _output an array of objects_ associated to the checked rows when a checkbox is selected.


### Configuring Columns

![Screenshot of the configuration options available for column types in Node-RED](/images/node-examples/ui-table-column-config.png "Screenshot of the configuration options available for column types in Node-RED"){data-zoomable}
_Screenshot of the configuration options available for column types in Node-RED_

If you toggle "off" the "Auto Columns" option, you will have more control to define the columns for your table. For each column, you can define the following:

- **Key**: The key in the object to use for the column data.
- **Label**: The text to display in the column header.
- **Width**: The width of the column, can be in `px`, `%`, or any other valid CSS sizing.
- **Align:** The alignment of the text in the column. Can be `Left`, `Center`, or `Right`. Note that some columns do look odd with "Center" alignment as the header does also contain space for the sorting icon.
- **Type**: Defines the cell's type and controls how your data will be rendered for this column.

### Cell Types <AddedIn version="1.10.0" />

![An example of a ui-table displaying various of the cell types available](/images/node-examples/ui-table-cell-types.png "An example of a ui-table displaying various of the cell types available"){data-zoomable}
_An example of a ui-table displaying various of the cell types available_

- **Text**: Renders the cell as plain text.
- **Link**: Renders the cell as a hyperlink. The `Link` field should contain the URL to link to.
- **Color**: Renders the cell as a colored box. The `Color` field should contain a valid CSS color.
- **Tick/Cross**: Renders the cell as a tick or cross. The `Value` field should contain a boolean (`true`/`false`) value.
- **Progress**: Renders the cell as a progress bar. The `Value` field should contain a number between 0 and 100.
- **Sparkline - Trend**: Renders the cell as a small line chart without axes. The `Value` field should contain an array of numbers to be plotted.
- **Sparkline - Bar**: Renders the cell as a small bar chart without axes. The `Value` field should contain an array of numbers to be plotted.
- **Row Number**: Renders the row number into the cell.

#### Example

<FlowViewer :flow="examples['cellTypes']" height="200px"/>

## Dynamic Properties

<DynamicPropsTable/>

## Table Configuration

### Search & Filter

The `ui-table` node can be configured to include a search bar above the table. This will allow users to search and filter across all columns, and automatically search across all columns when you type.

#### Example

![Example of a Data Table with Search & Filter](/images/node-examples/ui-table-search.png "Example of a Data Table with Search & Filter"){data-zoomable}
*Example of a Data Table with Search & Filter" enabled.*

### Interaction

Example that show how a table will appear with different selection types chosen.

#### Default - No Selection Events

![Example of a Data Table](/images/node-examples/ui-table.png "Example of a Data Table"){data-zoomable}
*Example of a rendered data table in a Dashboard.*

#### Multi-Selection
![Example of a table that has "Multi Selection" enabled](/images/node-examples/ui-table-multi.png "Example of a table that has 'Multi Selection' enabled"){data-zoomable}
*Example of a table that has "Multi Selection" enabled.*

#### Single Row Selection

![Example of a data table that enables a row to be selected/clicked](/images/node-examples/ui-table-click.png "Example of a data table that enables a row to be selected/clicked"){data-zoomable}
*Example of a data table that enables a row to be selected/clicked.*

### Pagination

![Example of a Paginated Table](/images/node-examples/ui-table-pagination.png "Example of a Paginated Table"){data-zoomable}
*Example of a paginated table which has 10 rows of data, but with "Max Rows" set to 5.*

## Custom Styling & Content

If you're looking to add more customisation to how your data is rendered, you can do so by building your own data table inside a `ui-template`. Check out [this example](../../user/template-examples.md#custom-tables) for more details.