---
description: Visualize your data beautifully with ui-chart in FlowFuse Dashboard for insightful analytics.
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
    X-Axis Format: <code>{HH}:{mm}:{ss}</code> | <code>{HH}:{mm}</code> | <code>{yyyy}-{M}-{d}</code> | <code>{d}/{M}</code> | <code>{ee} {HH}:{mm}</code> | <code>Custom</code> | <code>Auto</code>
        Defines how the values are displayed on the axis, when X-Axis type is <code>'timescale'</code>.
        See <a target="_blank" href="https://echarts.apache.org/en/option.html#xAxis.axisLabel.formatter">here</a> for an overview of the available format types.
    X-Axis Limit: Any data that is before the specific time limit (for time charts) or where there are more data points than the limit specified will be removed from the chart.
    Properties:
        <b>Series:</b> Controls how you want to set the Series of data stream into this widget. The default is <code>msg.topic</code>, where separate topics will render to a new line/bar in their respective plots.</br>
        <b>X:</b> Defines which data to use when rendering the x-value of any data point.</br>
        <b>Y:</b> Defines how to render the y-value of any data point.
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
    import AddedIn from '../../../components/AddedIn.vue';
    import TryDemo from "./../../../components/TryDemo.vue"
    
    import { ref } from 'vue'
    import FlowViewer from '../../../components/FlowViewer.vue'
    import ExampleChartLineTimestamp from '../../../examples/chart-line-timestamp.json'
    import ExampleChartLineMultiple from '../../../examples/chart-line-multiple.json'
    import ExampleChartBarSWCharacters from '../../../examples/chart-bar-sw-characters.json'
    import ExampleChartBarFinance from '../../../examples/chart-bar-finance-grouped.json'
    import ExampleChartBarElection from '../../../examples/chart-bar-election-grouped.json'
    import ExampleChartPieDoughnut from '../../../examples/chart-pie-doughnut.json'
    import ExampleChartHistogramBins from '../../../examples/chart-histogram-bins.json'
    import ExampleChartHistogramCategories from '../../../examples/chart-histogram-categories.json'
    import ExampleChartHistogramSeries from '../../../examples/chart-histogram-series.json'
    import ExampleChartScatter from '../../../examples/chart-scatter-grouped.json'
    import ExampleCustomChartLine from '../../../examples/custom-chart-slider-line.json'
    import ExampleCustomChartPolar from '../../../examples/custom-chart-slider-polar.json'

    const examples = ref({
      'chart-line-timestamp': ExampleChartLineTimestamp,
      'chart-line-multiple': ExampleChartLineMultiple,
      'chart-bar-sw-characters': ExampleChartBarSWCharacters,
      'chart-bar-finance': ExampleChartBarFinance,
      'chart-bar-election': ExampleChartBarElection,
      'chart-pie-doughnut': ExampleChartPieDoughnut,
      'chart-histogram-bins': ExampleChartHistogramBins,
      'chart-histogram-categories': ExampleChartHistogramCategories,
      'chart-histogram-series': ExampleChartHistogramSeries,
      'chart-scatter-grouped': ExampleChartScatter,
      'custom-chart-line': ExampleCustomChartLine,
      'custom-chart-polar': ExampleCustomChartPolar
    })
</script>

<TryDemo href="charts-example">

# Chart `ui-chart`

</TryDemo>

Provides configuration options to create the following chart types:

- [Line Chart](#line-chart)
- [Scatter Plot](#scatter-charts)
- [Bar Chart](#bar-charts)
- [Pie/Doughnut Charts](#pie-doughnut-charts)
- [Histograms](#histograms)

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Building Charts

In FlowFuse Dashboard, the `ui-chart` offers a simple way to render data in a variety of chart types. The chart is configurable to tailor to your data. 

To map your data to the chart, the most important properties to configure are:

![Example key mapping config for UI Chart](/images/node-examples/ui-chart-keymapping.png "Example key mapping config for UI Chart"){data-zoomable}
_Example key mapping config for UI Chart_

- **Series**: Controls how you want to group your data. On a line chart, different series result in different lines for example, on a bar chart, different series result in different bars for a single x-value (stacked or grouped side-by-side).
- **X**: Defines where to read the value to plot on the x-axis. This can be read from the `msg` object, as a `key` on an object, or generate a new `timestamp` for each data point being received to the node.
- **Y**: Define where to read the value to plot on the y-axis. This can be read as a property on the `msg` object, or as a `key` on objects in an array of data.

The next most important properties to configure are the "Chart Type" and "X-Axis Type".

- **Chart Type**: Choose between a Line, Scatter, or Bar chart.
- **X-Axis Type**: Choose between a "Timescale" (for time-based data), "Linear" (for numerical data), or "Categorical" (for non-numeric data). You'll notice that some x-axis types are only available for certain chart types.


### Line Charts

#### Timeseries Data

<FlowViewer :flow="examples['chart-line-timestamp']" height="250px"/>

In this example we wire a [Slider](./ui-slider.md) to our Chart to plot it's output over time:

![Example of a Line Chart](/images/node-examples/ui-chart-line.png "Example of a Line Chart"){data-zoomable}
*Example of a rendered line chart with a "time" x-axis.*

A very common use case of Node-RED is to process timeseries data, such as sensor readings. In this case, you would set the following:

| Property | Value |
| - | - |
| **Chart Type** | `Line` |
| **X-Axis Type** | `Timescale` |

The value for the `x` property would then be one of two things:

- If your data is a simple numerical value, you can leave this blank, and the chart will automatically use the current date/time.
- If your data is an object, you can provide the key of the timestamp in your data, e.g. `{"myTime": 1743608192522}` would set the "X" property to the type `key` and the value `myTime`.

Then, the last piece of the puzzle would be to set the `y` property would be one of two options:

- If your data is a simple numerical value, you can leave this blank, and the chart will automatically use the value of `msg.payload`.
- If your data is an object, you can provide the key of the value in your data, e.g. `{"myTime": 1743608192522, "myValue": 123}` would set the "Y" property to the type `key` and the value `myValue`.

Note: Timestamps must be in milliseconds (ms). This follows the JavaScript standard for representing time as the number of milliseconds elapsed since the Unix epoch (January 1, 1970, 00:00:00 UTC).

##### Formatting Timestamps

You can set a formatting option on the x-axis when using timeseries data. Included, as defaults, are:

- `{HH}:{mm}:{ss}`: e.g. 12:00:00
- `{HH}:{mm}`: e.g. 12:00
- `{yyyy}-{M}-{d}`: e.g. 2020-01-01
- `{d}/{M}`: e.g. 01/01
- `{ee} {HH}:{mm}`: e.g. Sun 12:00

You can also choose "Custom" option and provide your own formatting string, using the following tokens:

| Group | Template | Value (EN) |
|-------|----------|------------|
| Year | `{yyyy}` | e.g. 2020, 2021, ... |
| | `{yy}` | 00-99 |
| Quarter | `{Q}` | 1, 2, 3, 4 |
| Month | `{MMMM}` | e.g. January, February, ... |
| | `{MMM}` | e.g. Jan, Feb, ... |
| | `{MM}` | 01-12 |
| | `{M}` | 1-12 |
| Day of Month | `{dd}` | 01-31 |
| | `{d}` | 1-31 |
| Day of Week | `{eeee}` | Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday |
| | `{ee}` | Sun, Mon, Tues, Wed, Thu, Fri, Sat |
| | `{e}` | 1-54 |
| Hour | `{HH}` | 00-23 |
| | `{H}` | 0-23 |
| | `{hh}` | 01-12 |
| | `{h}` | 1-12 |
| Minute | `{mm}` | 00-59 |
| | `{m}` | 0-59 |
| Second | `{ss}` | 00-59 |
| | `{s}` | 0-59 |
| Millisecond | `{SSS}` | 000-999 |
| | `{S}` | 0-999 |

The above table is taken from the [eCharts documentation](https://echarts.apache.org/en/option.html#xAxis.axisLabel.formatter).

For any versions below, and including, `1.26.0`, FlowFuse Dashboard used ChartJS for formatting timestamps. This has been migrated to eCharts in `1.27.0`. For documentation on ChartJS timestamps, see the [ChartJS documentation](https://www.chartjs.org/docs/latest/axes/cartesian/time.html#time-axis-specific-options).

#### Interpolation Methods for Line Charts

Interpolation defines how the line is drawn between data points on a line chart. In Dashboard, you can choose between several interpolation methods to suit your data visualization needs:
- Linear: Draws a straight line between each data point. Best for continuous datasets with smooth transitions.
- Step: Creates a stepped line between points, where the value jumps abruptly to the next point. This method is ideal for visualizing data that changes in discrete steps, such as states or thresholds.
- Bezier: Produces a smooth curve with slight tension between points, creating a more aesthetically pleasing line. Useful for datasets where a smooth transition is important.
- Cubic: Draws a cubic curve for even more smoothing between data points, providing a rounded visual representation.
- Cubic-Mono: Similar to cubic, but with an additional constraint that ensures the curve maintains a monotonic behavior. This means it avoids overshooting between points, making it more stable.

![Example Line Chart with stepped interpolation](/images/node-examples/ui-chart-line-interpolation-stepped.png "Example Line Chart with stepped interpolation"){data-zoomable}
_Example Line Chart with stepped interpolation_

![Example Line Chart with bezier interpolation](/images/node-examples/ui-chart-line-interpolation-bezier.png "Example Line Chart with bezier interpolation"){data-zoomable}
_Example Line Chart with bezier interpolation_

#### Multiple Lines

<FlowViewer :flow="examples['chart-line-multiple']" height="250px"/>

![Example Line Chart with multiple lines](/images/node-examples/ui-chart-line-multiple-lines.png "Example Line Chart with multiple lines"){data-zoomable}
_Example Line Chart with multiple lines_

You can group data together into multiple lines using the `Series` property. A common use case here is to use `msg.topic`, where each message sent to the chart will be assigned to a different line based on the `msg.topic` value. Alternatively, you can set this to `key` and provide a key in your data to group by.

If you want a single piece of data to plot multiple lines, you can set the `Series` property to `JSON`, and then provide an array of keys (e.g. `["key1", "key2"]`), which will plot a data point for each key provided, from a single data point.


### Scatter Charts

![Example of a Scatter Plot](/images/node-examples/ui-chart-scatter.png "Example of a Scatter Plot"){data-zoomable}
*Example of a rendered scatter plot with a "time" x-axis.*

We can also use "Series" to group points. Let's take an example with the following data set:

```json
[
    { "series": "A", "x": 5, "y": 84 },
    { "series": "A", "x": 9, "y": 10 },
    { "series": "A", "x": 11, "y": 70 },
    { "series": "B", "x": 12, "y": 28 },
    { "series": "B", "x": 15, "y": 35 },
    { "series": "B", "x": 26, "y": 42 },
    { "series": "C", "x": 20, "y": 12 },
    { "series": "C", "x": 24, "y": 54 },
    { "series": "C", "x": 27, "y": 60 },
    { "series": "C", "x": 30, "y": 66 }]
```

In our flow, we'd have:

<FlowViewer :flow="examples['chart-scatter-grouped']" height="250px" />

With the following configuration:

![Example of a Scatter Plot with data grouped into "Series"](/images/node-examples/ui-chart-scatter-config.png "Example of a Scatter Plot with data grouped into 'Series'"){data-zoomable}


Which results in:

![Example of a rendered scatter plot with a "Linear" x-axis, and data grouped into "Series"](/images/node-examples/ui-chart-scatter-series.png "Example of a rendered scatter plot with a 'Linear' x-axis, and data grouped into 'Series'"){data-zoomable}
*Example of a rendered scatter plot with a "Linear" x-axis, and data grouped into "Series".*


### Bar Charts

Currently, we only support "Category" x-axis types for Bar Charts. This means that the x-axis values will be a string, and the y-axis will be a numerical value.

Let's take an example of loading data for the Star Wars API:

<FlowViewer :flow="examples['chart-bar-sw-characters']" height="250px" />

![Example of a bar chart showing character 'height' data](/images/node-examples/ui-chart-bar-sw.png "Example of a bar chart showing character 'height' data"){data-zoomable}
_Example of a bar chart showing character "height" data_

If we take a look at the configuration for this chart:

![Example of a bar chart showing character 'height' data](/images/node-examples/ui-chart-bar-sw-config.png "Example of a bar chart showing character 'height' data"){data-zoomable}

We could easily modify the "Y" property to plot a different value, without needing to modify our data.


#### Grouped Bars - Financial Data Example

<FlowViewer :flow="examples['chart-bar-finance']" height="250px" />

Here we have an example of some financial data:

```json
[
    { "year": 2021, "Q1": 115, "Q2": 207, "Q3": 198, "Q4": 163 },
    { "year": 2022, "Q1": 170, "Q2": 200, "Q3": 230, "Q4": 210 },
    { "year": 2023, "Q1": 86, "Q2": 140, "Q3": 180, "Q4": 138 }
]
```

Bar charts will automatically group data by common x-axis values, but maintain separate bars for each _series_. When you select a "Bar" chart, then you can choose the "Group By" option to be "Side-by-Side" or "Stacks".

Default behavior for a Bar Chart is to group content "Side-by-Side".

In our chart config we can define:

![Configuration for of a bar chart showing financial data, grouped by year](/images/node-examples/ui-chart-bar-grouped-finance-config.png "Configuration for of a bar chart showing financial data, grouped by year"){data-zoomable}
_Configuration for of a bar chart showing financial data, grouped by year_


where we have defined "Series" as a type `JSON` because we want to render multiple bars for each data point, in this case, one for each quarter:

![Example of a bar chart showing financial data, grouped by year](/images/node-examples/ui-chart-bar-grouped-finance.png "Example of a bar chart showing financial data, grouped by year"){data-zoomable}
_Example of a bar chart showing financial data, grouped by year_

If we switch over the "Group By" option to be "Stacks", we'd see:

![Example of a bar chart showing the same data, but stacked](/images/node-examples/ui-chart-bar-grouped-finance-stacks.png "Example of a bar chart showing the same data, but stacked"){data-zoomable}
_Example of a bar chart showing the same data, but stacked_


#### Grouped Bars - Election Data Example

<FlowViewer :flow="examples['chart-bar-election']" height="250px" />

Here we have a piece of data for each candidate, for each year, which details the number of "Votes" that candidate won.

```json
[
    { "candidate": "Dave", "year": 2019, "votes": 100 },
    { "candidate": "Sarah", "year": 2019, "votes": 90 },
    { "candidate": "Chris", "year": 2019, "votes": 160 },
    { "candidate": "Lucy", "year": 2019, "votes": 125 },
    { "candidate": "Dave", "year": 2024, "votes": 20 },
    { "candidate": "Sarah", "year": 2024, "votes": 170 },
    { "candidate": "Chris", "year": 2024, "votes": 150 },
    { "candidate": "Lucy", "year": 2024, "votes": 60 }
]
```

We have a couple of different ways we could group this data, firstly, we have a series for each "Year" and the x-value defined as the "candidate":

![Configuration for of a bar chart showing election data, grouped by candidate, and a series for each year](/images/node-examples/ui-chart-bar-grouped-election-config-A.png "Configuration for of a bar chart showing election data, grouped by candidate, and a series for each year"){data-zoomable}
_Configuration for of a bar chart showing election data, grouped by candidate, and a series for each year_

Resulting in:

![Example of a bar chart showing election data, grouped by candidate, and a series for each year](/images/node-examples/ui-chart-bar-grouped-election.png "Example of a bar chart showing election data, grouped by candidate, and a series for each year"){data-zoomable}
_Example of a bar chart showing election data, grouped by candidate, and a series for each year_


Alternatively, we could have a series per candidate, and then the x-value defined as the "year":

![Configuration for of a bar chart showing election data, grouped by year, and a series for each candidate](/images/node-examples/ui-chart-bar-grouped-election-config-B.png "Configuration for of a bar chart showing election data, grouped by year, and a series for each candidate"){data-zoomable}
_Configuration for of a bar chart showing election data, grouped by year, and a series for each candidate_


Resulting in:

![Example of a bar chart showing election data, grouped by year, and a series for each candidate](/images/node-examples/ui-chart-bar-grouped-election-B.png "Example of a bar chart showing election data, grouped by year, and a series for each candidate"){data-zoomable}


### Pie/Doughnut Charts

These chart types use "Radial" axes. The "Series" property is used to define the layer that the particular data is rendered in, multiple series results in nested pie/doughnut charts.

The "X" value defines the key within a single Series", and the "Y" property should point to the numerical value that dictates the size of a given segment.

Let's take a look at a couple of examples:

<FlowViewer :flow="examples['chart-pie-doughnut']" height="300px" />

With a sample data set such as:

```json
[
    { "year": 2021, "quarter": "Q1", "earnings": 115 },
    { "year": 2021, "quarter": "Q2", "earnings": 120 },
    { "year": 2021, "quarter": "Q3", "earnings": 100 },
    { "year": 2021, "quarter": "Q4", "earnings": 180 }
]
```

We can configure our chart to render a Pie or Doughnut chart like so:

![Configuration for of a Pie and Doughnut Chart](/images/node-examples/ui-chart-pie-doughnut-config.png "Configuration for of a Pie and Doughnut Chart"){data-zoomable}

Results in the following, where for the "Doughnut" chart has two "Series" worth of data.

![Example of Pie and Doughnut Charts](/images/node-examples/ui-chart-pie-doughnut.png "Example of Pie and Doughnut Charts"){data-zoomable}
_Example of Pie and Doughnut Charts_

### Histograms

Histograms are unique in that they do not _just_ plot the data provided to them. Instead, they calculate and keep track of frequencies of messages received, grouped by the "X" and "Series" properties.

#### Bins

<FlowViewer :flow="examples['chart-histogram-bins']" height="200px"/>

If you want to render numerical data on the x-axis, then you should use the "Bins" x-axis type. This will allow you to define the range of values that should be grouped together, and how many "bins" your range should be split into.

![Example Histogram with numerical bins](/images/node-examples/ui-chart-histogram-bins.png "Example Histogram with numerical bins"){data-zoomable}

Here, we have a slider that inject a payload into the chart everytime it is moved, with numbers being split into 5 bins between 0 and 10.

#### Categorical

<FlowViewer :flow="examples['chart-histogram-categories']" height="400px"/>

If instead, you have fixed string or categorical values for your x-axis, you should use the "Categorical" x-axis type. This will group data by the x-axis value, and then calculate the frequency of each value.

![Example Histogram with categorical bins](/images/node-examples/ui-chart-histogram-categories.png "Example Histogram with categorical bins"){data-zoomable}

Here, each button emits a payload matching a given letter (the x-axis value), and the chart calculates the frequency of each letter received. Additionally, we have the first row of buttons belonging to the "Series 1", and the second row of buttons belonging to the "Series 2", defined through `msg.topic`.

#### Grouping into Series

<FlowViewer :flow="examples['chart-histogram-series']" height="200px"/>

We can also add an extra dimension of data to our Histogram with "Series".

![Example Histogram with categorical bins and grouped by Series](/images/node-examples/ui-chart-histogram-bins-series.png "Example Histogram with categorical bins and grouped by Series"){data-zoomable}
_Screenshot showing two histograms rendering hte same data source, but with different series_ 

Here, we have a sample data set which details licenses for software running for _n_ days. Each license details the operating system (`os`), which `version` of the software it is running, and whether or not it is a paid for `license`.

Our two side-by-side charts show the same frequency data (with bins for the `age` on the x-axis), but one breaks it down by `version` and the other by `os`.

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

### Nested Data

It is a common use case that you would have data structured as JSON, and want to plot some of it e.g:

```js
msg = {
    "payload": {
        "id": "Dataset 1",
        "value": 3,
        "nested": {
            "value": 1
        }
    }
}
```

Here, we can utilize the "Properties" `series`, `x` and `y` to define which values we want to plot on the chart. To access the relevant data point here you can use the `key:` type and use dot-notation, e.g: `nested.value`.

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

Where you could set the `y` property to `key:value`. The `x` value, if left blank in the configuration would be calculated as the current date/time.


## Building Custom Charts

ChartJS has a rich set of configuration options, of which we only expose a small subsection via the Node-RED configuration. If you want to customise the appearance of your chart further, or even render charts we don't yet support, you can do so with a UI Template node.

Currently, although not ideal, we do need to load the ChartJS library from a CDN, and then watch for the file to have been loaded before we can use it, as per the [Loading External Dependencies](/en/nodes/widgets/ui-template.html#loading-external-dependencies) details in the UI Template documentation.

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