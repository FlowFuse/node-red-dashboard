---
description: Visualize your data beautifully with ui-chart in Node-RED Dashboard 2.0 for insightful analytics.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Label: The text shown within the button.
    Class: The text shown within the button.
    Chart Type: <code>Line</code> | <code>Bar</code> | <code>Scatter</code>
    Show Legend: Defines whether or not a legend is shown between the title and the chart. Each label is driven by <code>msg.topic</code>.
    Action:
        dynamic: true
        description: Controls how new data is added to a chart. It will either "append", keeping existing data, or "replace", removing existing data, before adding any newly provided data points.
    Point Shape: Define the shape of the point shown in Scatter & Line charts.
    Point Radius: Define the radius (in pixels) of each point rendered onto a Scatter or Line chart.
    X-Axis Type: <code>Timescale</code> | <code>Linear</code> | <code>Categorical</code>
    X-Axis Format: <code>HH:mm:ss</code> | <code>HH:mm</code> | <code>YYYY-MM-DD</code> | <code>DD/MM</code> | <code>dd HH:mm</code> | <code>Custom</code> | <code>Auto</code>
        Defines how the values are displayed on the axis, when X-Axis type is <code>'timescale'</code>.
        See <a target="_blank" href="https://moment.github.io/luxon/#/formatting?id=table-of-tokens">here</a> for an overview of all available Luxon tokens.
    X-Axis Limit: Any data that is before the specific time limit (for time charts) or where there are more data points than the limit specified will be removed from the chart.
    Properties:
        <b>Series:</b> Controls how you want to set the Series of data stream into this widget. The default is <code>msg.topic</code>, where separate topics will render to a new line/bar in their respective plots.</br>
        <b>X:</b> Only available for Line & Scatter Charts. This defines the key (which can be nested) of the value that should be plotted onto the x-axis. If left blank, the x-value will be calculated as the current timestamp.</br>
        <b>Y:</b> Defines the key (which can be nested, e.g. <code>'nested.value'</code>) of the value that should be plotted onto the x-axis. This value is ignored if injecting single numerical values into the chart.
    Text Color: Option to override Chart.Js default color for text.
        At moment overrides the text color for <code>Chart Title</code>, <code>Ticks Text</code>, <code>Axis Title</code> and <code>Legend Text</code></br>
        It is possible to return to Chart.Js defaults by using the checkbox <code>Use ChartJs Default Text Colors</code>
    Grid Line Color: Option to override Chart.Js default color for <code>Grid Lines</code> and <code>Axis Border</code>.</br>
        It is possible to return to Chart.Js defaults by using the checkbox <code>Use ChartJs Default Grid Colors</code>
dynamic:
    Class:
        payload: msg.class
        structure: ["String"]
---

<script setup>
    import AddedIn from '../../components/AddedIn.vue';
    
    import { ref } from 'vue'
    import FlowViewer from '../../components/FlowViewer.vue'
    import ExampleCustomChartLine from '../../examples/custom-chart-slider-line.json'
    import ExampleCustomChartPolar from '../../examples/custom-chart-slider-polar.json'

    const examples = ref({
      'custom-chart-line': ExampleCustomChartLine,
      'custom-chart-polar': ExampleCustomChartPolar
    })
</script>


# Chart `ui-chart`

Provides configuration options to create the following chart types:

- [Line Chart](#line-chart)
- [Scatter Plot](#scatter-plot)
- [Bar Chart](#bar-graph)

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Controls

### Removing Data

#### "Append" or "Replace" <AddedIn version="0.11.3" />

The "Action" property on the chart allows you to control whether you:

- Append: Any new data provided will be added to the existing data on the chart
- Replace: Any existing data will first be removed, then new data will be added.

If you ever want to override the property on a message-by-message basis, you can also do this by including a `msg.action` property, which will override the default behaviour. For example:

```js
msg = {
    "action": "append",
    "payload": 1
}
```

Would append this data point to the chart, leaving existing data, even if the underlying chart has been configured to always "Replace".

#### Clear All Data

Alternatively, you can remove all data from a chart at any time by sending a `msg.payload` of `[]` to the node. Most commonly, this is done by wiring a `ui-button` to the `ui-chart` node and configuring the button to send a JSON payload with a value of `[]`.

## Working with Data

`ui-chart` allows you to define which "keys" from your data you would like to render on the chart.

![Example keymapping config for UI Chart](/images/node-examples/ui-chart-keymapping.png "Example keymapping config for UI Chart"){data-zoomable}
_Example keymapping config for UI Chart_

In this example, each received datapoint would plot to a fixed "Temperature" series, and UI Chart would read the `.time` value to plot on the x-axis, and the `.temp` value to plot on the y-axis.
### Series

The `Series` property allows you to define how you want to control which line/bar (series) data belongs to when streamed into this widget.
The default is `msg.topic`, where separate topics will render to a new line/bar in their respective plots.

If you want to label a single line on your chart, you can set this to a static `string` value, e.g. `Temperature`,
which saves you have to assign `msg.topic` to every data point.

#### Multiple Lines

If you would like to plot multiple lines on the same chart, you can do so by defining the `Series` property, which defaults to `msg.topic`.

With this defined, you can assign different data to different datasets that will be plotted:

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

This use case is great if you have multiple sensors feeding data into the same chart. You can assign `msg.topic` accordignly for each sensor.

This behaviour is mimicked here with three sliders, each with a different `msg.topic`:

![Example Line Chart rendering data from different "sensors" using msg.topic](/images/node-examples/ui-chart-msgtopic.png "Example Line Chart rendering data from different \"sensors\" using msg.topic"){data-zoomable}
_Example Line Chart rendering data from different "sensors" using msg.topic_


Alternatively, you can set the `series` property to type `JSON`, and then provide an array of keys (e.g. `["key1", "key2"]`), which will plot a data point for each key provided, from a single data point. For example:

```js
msg.payload = [
    {
        "x_value": 12,
        "value": 17,
        "nested": {
            "value": 24
        }
    },
    {
        "x_value": 17,
        "value": 36,
        "nested": {
            "value": 10
        }
    },
    {
        "x_value": 23,
        "value": 19,
        "nested": {
            "value": 75
        }
    },
    {
        "x_value": 34,
        "value": 12,
        "nested": {
            "value": 23
        }
    }
]
```
with a chart config of:

![Example config of a Line Chart to render multiple lines of data from a single data point](/images/node-examples/ui-chart-multiline-config.png "Example config of a Line Chart to render multiple lines of data from a single data point"){data-zoomable}

Would result in:

![Example of a Line Chart rendering multiple data points per injecting payload](/images/node-examples/ui-chart-multiline.png "Example of a Line Chart rendering multiple data points per injecting payload"){data-zoomable}

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

Bar charts can only be configured with a "Categorical" x-axis type, the series that each data point will group into is then defined by the "Series" property, with the "y" property defining the value of each bar.

#### Configuration

- **X Axis Type**: `Categorical`
- **Series**: Define how to separate your data into individual bars
    - `msg.<variable>`: Each message sent to the chart will assign to the category depending on `msg.<variable>`. In Dashboard 1.0 this was the default behaviour, where `msg.topic` would control the series of the data, and this is still supported in Dashboard 2.0.
    - `string`: Each message received will always bind to the same bar, this restricts the chart to only being able to show a single column/category of data.
    - `key:<key>`: Each message, or object within an array payload, will be assigned the category based on it's value `<key>`. If you have raw numerical data, and not an object, leave this blank.
    - `JSON:`: This combines the "Series" and "y" options, where you can provide an Array of strings, pointing to the property/value that you want to render. The category label is then defined by the property itself.
- **Y**: Describe how to retrieve the value you want to plot on the y-axis. Leave blank if you're sending raw numerical data, otherwise, provide the key (which can be nested) of the value that should be plotted onto the x-axis, e.g. `{"nested": {"value": 34}}` would plot `34` on the y-axis if you set this to `nested.value`.


#### Examples

The payload will heavily depend on the "Series" value used, as such, we provide examples of each as follows:

##### Series: `msg.<property>`

Each message send to the chart will assign to the category depending on `msg.<property>`. In Dashboard 1.0 this was the default behaviour, where `msg.topic` would control the series of the data, and this is still supported in Dashboard 2.0.

```js
const msg = {
    "topic": "bar-1",
    "payload": 1
}
```

would set the value of the `bar-1` series to `1`.

##### Series: `string`

Each message received will always bind to the same bar, this restricts the chart to only being able to show a single column/category of data.

```js
const msg = {
    "payload": 12
}
```

would set the value of the single series to `12`.

##### Series: `key:<key>`

Each message received will bind to the category defined by the value of `<key>` in the message payload. So, if we set the "Series" value to be `key:category`, then the following message:

```js
const msg = {
    "payload": {
        "category": "bar-1",
        "value": 34
    }
}
```

Would set the value of the `bar-1` series to `34`.

Additionally, with this option it's then easy to control multiple bars from a single `msg`:

```js
const msg = {
    "payload": [
        {
            "category": "bar-1",
            "value": 34
        },
        {
            "category": "bar-2",
            "value": 12
        },
        {
            "category": "bar-3",
            "value": 23
        },
        {
            "category": "bar-1",
            "value": 17
        }
    ]
}
```

##### Series: `JSON:`

This combines the "Series" and "y" options, where you can provide an Array of strings, pointing to the property/value that you want to render. The category label is then defined by the property itself.

So in an example where we set "Series" to `["value", "nested.value"]`

```js
const msg = {
    "payload": {
        "value": 34,
        "nested": {
            "value": 12
        }
    }
}
```

This would render two bars, one labelled `value` with a value of `34`, and one labelled `nested.value` with a value of `12`.

## Building Custom Charts

ChartJS has a rich set of configuration options, of which we only expose a small subsection via the Node-RED configuration. If you want to customise the appearance of your chart further, or even render charts we don't yet support, you can do so with a UI Template node.

Currently, although not ideal, we do need to load the ChartJS library from a CDN, and then watch for the file to have been loaded before we can use it, as per the [Loading External Dependencies](http://localhost:5173/nodes/widgets/ui-template.html#loading-external-dependencies) details in the UI Template documentation.

### Example: Static Data

![Example of a static 2D bar chart](/images/node-examples/ui-template-chartjs-example-1.png "Example of a static 2D bar chart"){data-zoomable}

Here here is the template code that will render this bar chart:

```html
<template>
    <canvas ref="chart" />
</template>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
    export default {
        mounted() {
            // code here when the component is first loaded
            let interval = setInterval(() => {
                if (window.Chart) {
                    // Babylon.js is loaded, so we can now use it
                    clearInterval(interval);
                    this.draw()
                }
            }, 100);
        },
        methods: {
            draw () {
                const ctx = this.$refs.chart
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                        datasets: [{
                            label: '# of Votes',
                            data: [12, 19, 3, 5, 2, 3],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        }
    }
</script>
```

### Example: Plotting Incoming Data

It's unlikely, as per the first example, we just want to render static data - this is Node-RED after all. So as a quick example, we can also wire this example to a `ui-slider` for a quick demo, here's a flow that can get you started:

<FlowViewer :flow="examples['custom-chart-line']" height="200px"/>

and what it'll look like when rendered to the Dashboard:

![Example of a line chart plotting incoming data](/images/node-examples/ui-template-chartjs-example-2.png "Example of a line chart plotting incoming data"){data-zoomable}

Taking a deep-dive into the contents of the `ui-template` for this chart, we can see:

```html
<template>
    <canvas ref="chart" />
</template>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
    export default {
        mounted() {
            // register a listener for incoming data
            this.$socket.on('msg-input:' + this.id, this.onInput)

            // check with ChartJS has loaded
            let interval = setInterval(() => {
                if (window.Chart) {
                    // clear the check for ChartJS
                    clearInterval(interval);
                    // draw our initial chart
                    this.draw()
                }
            }, 100);
        },
        methods: {
            draw () {
                // get reference to the <canvas /> element
                const ctx = this.$refs.chart
                
                // Render the chart
                const chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: "My Label",  // label for the single line we'll render
                            data: []            // start with no data
                        }]
                    },
                    options: {
                        animation: false, // don't run the animation for incoming data
                        responsive: true, // ensure we auto-resize the content
                        scales: {
                            x: {
                                type: 'time' // in this example, we're rendering timestamps
                            }
                        },
                        parsing: {
                            xAxisKey: 'time', // the property to render on the x-axis
                            yAxisKey: 'value' // the property to render on the y-axis
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Chart.js Line Chart'
                            }
                        }   
                    },
                });
                // make this available to all elements of the component
                this.chart = chart
            },
            onInput (msg) {
                // add a new data point ot our existing dataset
                this.chart.data.datasets[0].data.push({
                    time: (new Date()).getTime(),
                    value: msg.payload
                }) 
                // ensure the chart re-renders
                this.chart.update()      
            }
        }
    }
</script>
```

### Example: Categorising Data

Let's take a more complex example, where we can render a chart type that we don't _currently_ support in core Dashboard, a Polar Area Chart.

![Example of a bar chart categorising incoming data](/images/node-examples/ui-template-chartjs-example-3.png "Example of a bar chart categorising incoming data"){data-zoomable}


This example is adapted from [this example](https://www.chartjs.org/docs/latest/samples/other-charts/polar-area-center-labels.html#polar-area-centered-point-labels) from the ChartJS documentation

In this example, we wire multiple `ui-sliders`, each defining a `msg.topic` of a different color, into our custom chart:

<FlowViewer :flow="examples['custom-chart-polar']" height="250px"/>

A deep-dive into the contents of the `ui-template` shows:

```html
<template>
    <canvas ref="chart" />
</template>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
    export default {
        mounted() {
            // register a listener for incoming data
            this.$socket.on('msg-input:' + this.id, this.onInput)

            // code here when the component is first loaded
            let interval = setInterval(() => {
                if (window.Chart) {
                    // Babylon.js is loaded, so we can now use it
                    clearInterval(interval);
                    this.draw()
                }
            }, 100);
        },
        methods: {
            draw () {
                const ctx = this.$refs.chart
                const data = {
                    labels: [],
                    datasets: [{
                        label: 'Colors',
                        data: [],
                        backgroundColor: []
                    }]
                }
                
                // Render the chart
                const chart = new Chart(ctx, {
                    type: 'polarArea',
                    data: data,
                    options: {
                        responsive: true,
                        scales: {
                            r: {
                                pointLabels: {
                                    display: true,
                                    centerPointLabels: true,
                                    font: {
                                        size: 18
                                    }
                                }
                            }
                            },
                            plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Chart.js Polar Area Chart With Centered Point Labels'
                            }
                        }
                    },
                });
                this.chart = chart
            },
            onInput (msg) {
                // in this example, our topics will be colors
                const color = msg.topic

                // have we seen this color before?
                const index = this.chart.data.labels.indexOf(color)
                
                if (index === -1) {
                    console.log('new color', color)
                    // add new dataset for this topic
                    this.chart.data.labels.push(color)
                    this.chart.data.datasets[0].data.push(msg.payload)
                    this.chart.data.datasets[0].backgroundColor.push(color)
                } else {
                    // we've already got data for this color, update the value
                    this.chart.data.datasets[0].data[index] = msg.payload
                }

                // ensure the chart re-renders
                this.chart.update()      
            }
        }
    }
</script>
```