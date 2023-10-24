---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Label: The text shown within the button.
    Class: The text shown within the button.
    Chart Type: <code>Line</code> | <code>Bar</code> | <code>Scatter</code>
    Show Legend: Defines whether or not a legend is shown between the title and the chart. Each label is driven by <code>msg.topic</code>.
    X-Axis Type: <code>Timescale</code> | <code>Linear</code> | <code>Categorical</code>
    X-Axis Limit: Any data that is before the specific time limit (for time charts) or where there are more data points than the limit specified will be removed from the chart.
    Properties:
        <b>Series:</b> Controls how you want to set the Series of data stream into this widget. The default is <code>msg.topic</code>, where separate topics will render to a new line/bar in their respective plots.</br>
        <b>X:</b> Only available for Line & Scatter Charts. This defines the key (which can be nested) of the value that should be plotted onto the x-axis. If left blank, the x-value will be calculated as the current timestamp.</br>
        <b>Y:</b> Defines the key (which can be nested, e.g. <code>'nested.value'</code>) of the value that should be plotted onto the x-axis. This value is ignored if injecting single numerical values into the chart.
---

# Chart `ui-chart`

Provides configuration options to create the following chart types:

- [Line Chart](#line-chart)
- [Scatter Plot](#scatter-plot)
- [Bar Chart](#bar-graph)

## Properties

<PropsTable/>

## Controls

### Removing Data

In order to remove all data from a chart you can send a `msg.payload` of `[]` to the node.

Most commonly, this is done by wiring a `ui-button` to the `ui-chart` node and configuring the button to send a JSON payload with a value of `[]`.

## Working with Data

`ui-chart` allows you to define which "Properties" from your data you would like to render on the chart.

### Series

The `Series` property allows you to define how you want to set the Series of data stream into this widget.
The default is `msg.topic`, where separate topics will render to a new line/bar in their respective plots.

If you want to label a single line on your chart, you can set this to a static `string` value, e.g. `my-line`,
which saves you have to assign `msg.topic` to every data point.

#### Multiple Lines

If you would like to plot multiple lines on the same chart, you can do so by defining the `series` property, which defaults to `msg.topic`.
With this defined, you can assign different data to different satasets that will be plotted:

```js
msg = {
    "topic": "line-1",
    "payload": 1
}
```

```js
msg = {
    "topic": "line-2",
    "payload": 2
}
```

### Nested Data

It is a common use case that you would have data structured as JSON, and want to plot some of it e.g:

```js
msg = {
    "topic": "Sensor A" 
    "payload": {
        "id": "Dataset 1",
        "value": 3,
        "nested": {
            "value": 1
        }
    }
}
```

Here, we can utilise the "Properties" `series`, `x` and `y` to define which values we want to plot on the chart.

Some combinations to consider:

| series | x | y | description |
| - | - | - | - |
| `str:line1` | `value` | `nested.value` | This would plot `(3, 1)`, on a line labelled "line1". |
| `property:id` | `value` | `nested.value` | This would plot `(3, 1)`, on a line labelled "Dataset 1". |
| `property:id` |  | `value` | *Line Chart*: This would plot `(Date.now(), 3)`, labelled "Dataset 1".<br /><br />*Bar Chart:* this would plot a single bar, labelled "Dataset 1", with a height of `3`. |
| `msg.topic` |  | `nested.value` | On a bar chart, this would plot a single bar, labelled "Sensor A", with a height of `1`. |

### Live Data

If you're producing "live" data (from sensors for example), you do not need to define how the `x` property should be plotted. Instead, you can leave this blank and the chart will automatically calculate the current date/time.

This works equally well if you use `Object` formatted data, e.g.

```js
msg = {
    "topic": "Sensor A" 
    "payload": {
        "value": 3
    }
}
```

Where you could set the `y` property to `property:value`, as well as if you're providing raw numerical data, e.g.

```js
msg = {
    "topic": "Sensor A" 
    "payload": 3
}
```

Where the `y` property is ignored, as it detects that is stored as a raw number.

## Chart Types

### Line Chart

![Example of a Line Chart](/images/node-examples/ui-chart-line.png "Example of a Line Chart"){data-zoomable}
*Example of a rendered line chart with a "time" x-axis.*

#### Payloads

Line Charts accept a variety of payload formats. The following are all valid:

- `msg.payload = <value>`
    - In this case, the value received by the chart will be used as a `y` value, and the `x` value will be automatically added as the current date/time.
- `msg.payload = { y: <value> }`
    - In this case, the `y` value will be used as defined, and the `x` value will be calculated as the current date/time.
- `msg.payload = { x: <value>, y: <value> }`
    - In this case, the `x` and `y` values will be used as the `x` and `y` values of the data point.
- `msg.payload = [{ x: <value>, y: <value> }, { x: <value>, y: <value> }]`
    - In this case, multiple points will be plotted into a single line.
- `msg.payload = [{ x: <value>, y: <value>, line: <value> }, { x: <value>, y: <value>, line: <value> }]`
    - In this case, multiple points will be plotted, and if the `series` property is set to `property:line` then the `line` property will be used to determine which line each data point should be plotted on.

#### Multiple Lines

If you would like to plot multiple lines on the same chart, you can do so by including a `msg.topic` alongside the relevant `msg.payload`, e.g:

```js
msg = {
    "topic": "line-1",
    "payload": 1
}
```

```js
msg = {
    "topic": "line-2",
    "payload": 2
}
```

Whilst `msg.topic` is the default value for the `series` property on a `ui-chart`, this can be changed. You could also set it to `key:<series>` to differentiate each point to a separate line, in that case your data would like like:

```js
msg.payload = {
    "value": 2,
    "series": "my-series"
}
```


#### Multiple Data Points (Injecting an Array of Data)

If you would like to pass in multiple data points at the same time into a chart, you can do so by passing an `Array` in `msg.payload`.

```js
msg = {
    "topic": "line-1",
    "payload": [{
        "x": 30,
        "y": 43
    }, {
        "x": 40,
        "y": 56
    }, {
        "x": 50,
        "y": 74
    }]
}
```

Note how we can still define the `msg.topic` value (or whatever we have defined for `series`) such that these data points all appear on the same line.

If we wanted each point in a different series, we could set `series` to `key:series`, so that each data point is condsidered individually:

```js
msg = {
    "payload": [{
        "series": "Line 1",
        "x": 30,
        "y": 43
    }, {
        "series": "Line 2",
        "x": 40,
        "y": 56
    }, {
        "series": "Line 1",
        "x": 50,
        "y": 74
    }]
}
```

### Scatter Plot

![Example of a Scatter Plot](/images/node-examples/ui-chart-scatter.png "Example of a Scatter Plot"){data-zoomable}
*Example of a rendered scatter plot with a "time" x-axis.*

#### Payloads

Scatter Plots accept a variety of payload formats. The following are all valid:

- `msg.payload = <value>`
    - In this case, the value received by the chart will be used as a `y` value, and the `x` value will be automatically added as the current date/time.
- `msg.payload = { y: <value> }`
    - In this case, the `y` value will be used as defined, and the `x` value will be calculated as the current date/time.
- `msg.payload = { x: <value>, y: <value> }`
    - In this case, the `x` and `y` values will be used as the `x` and `y` values of the data point.
- `msg.payload = [{ x: <value>, y: <value> }, { x: <value>, y: <value> }]`
    - In this case, multiple points will be plotted into a single series.
- `msg.payload = [{ x: <value>, y: <value>, series: <value> }, { x: <value>, y: <value>, series: <value> }]`
    - In this case, multiple points will be plotted, and if the `series` property is set to `property:series` then the `series` property will be used to determine which data series each data point should be plotted on.

### Bar Graph

![Example of a Bar Graph](/images/node-examples/ui-chart-bar.png "Example of a Bar Graph"){data-zoomable}
*Example of a rendered bar graph.*