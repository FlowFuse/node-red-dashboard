---
description: Display real-time metrics with ui-gauge in FlowFuse Dashboard for immediate data visualization.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the dropdown with respect to the parent group. Maximum value is the width of the group.
    Type:
        description: Defines the shape of the gauge, "Tile", "Battery", "Water Tank", "Half Gauge" or "3/4 Gauge"
        dynamic: true
    Style:
        description: Defines the style of arc rendered, "Needle" or "Rounded". (only applicable to for 3/4 and Half gauges)
        dynamic: true
    Value:
        description: The value to be shown on the gauge. Can be a property of the message, e.g. `msg.payload` or `msg.myProperty`, a flow/global context variable, or a static value. You can also use the type "JSONata" to evaluate a JSONata expression and perform computations on the value, e.g. <code>$round(payload, 1)</code> to round to 1 decimal place.
        dynamic: true
    Range (min):
        description: The smallest value that can be shown on the gauge
        dynamic: true
    Range (max):
        description: The largest value that can be shown on the gauge
        dynamic: true
    Segments:
        description: Defines the barriers by which the arc is color coded. These segments can also be shown on the gauge.
        dynamic: true
    Label:
        description: Text shown above the gauge, labelling what the gauge is showing.
        dynamic: true
    Always Show Label:
        description: (only applicable to Tile gauges) If true, the label will be shown at all times.
        dynamic: false
    Floating Label Position:
        description: (only applicable to Tile gauges) The position of the label within the tile. Can be "top-left", "top-right", "bottom-left", or "bottom-right".
        dynamic: false
    Prefix:
        description: Text to be added _before_ the value in the middle of the gauge. (only applicable to for 3/4 and Half gauges)
        dynamic: true
    Suffix:
        description: Text to be shown _after_ the value in the middle of the gauge. (only applicable to for 3/4 and Half gauges)
        dynamic: true
    Units:
        description: Small text to be shown below the value in the middle of the gauge. (only applicable to for 3/4 and Half gauges)
        dynamic: true
    Icon:
        description: Icon to be shown below the value in the middle of the gauge. Uses <a href="https://pictogrammers.com/library/mdi/">Material Designs Icon</a>, no need to include the <code>mdi-</code> prefix. (only applicable to for 3/4 and Half gauges)
        dynamic: true
    Sizes (Gauge): (px) How thick the arc and backdrop of the gauge are rendered.
    Sizes (Gap): (px) How big the gap/padding is between the Gauge and the "Segments"
    Sizes (Segments): (px) How thick the segments are rendered.
controls:
    enabled:
        example: true | false
        description: Allow control over whether or not the number-input is enabled
dynamic:
    Label:
        payload: msg.ui_update.label
        structure: ["String"]
    Icon:
        payload: msg.ui_update.icon
        structure: ["String"]
    Type:
        payload: msg.ui_update.gtype
        structure: ["String"]
        examples: ['gauge-tile', 'gauge-battery', 'gauge-tank', 'gauge-half', 'gauge-34']
    Style:
        payload: msg.ui_update.gstyle
        structure: ["String"]
    Min:
        payload: msg.ui_update.min
        structure: ["Number"]
    Max:
        payload: msg.ui_update.max
        structure: ["Number"]
    Segments:
        payload: msg.ui_update.segments
        structure: ["Array<{color: String, from: Number}>"]
    Prefix:
        payload: msg.ui_update.prefix
        structure: ["String"]
    Suffix:
        payload: msg.ui_update.suffix
        structure: ["String"]
    Units:
        payload: msg.ui_update.units
        structure: ["String"]
---


<script setup>
    import AddedIn from '../../../components/AddedIn.vue';
    import TryDemo from "./../../../components/TryDemo.vue";
</script>

<TryDemo href="gauge">

# Gauge `ui-gauge` <AddedIn version="1.1.0"/>

</TryDemo>

Adds a Gauge Chart to your Dashboard. This can be configured with custom types (half, 3/4), styles (rounded, needle) and segmentation with examples detailed [below](#examples).

![Screenshot showing each gauge type side-by-side](/images/node-examples/ui-gauge-types.png "Screenshot showing each gauge type side-by-side"){data-zoomable}
_Screenshot showing each gauge type side-by-side_

## Input

Values for the gauges can be set by sending a numerical value in `msg.payload`. The gauge will then update to reflect this value.

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Controls

<ControlsTable/>

## Formatting Value

![Example of a Gauge with a formatted value](/images/node-examples/ui-gauge-jsonata-value.png "Example of a Gauge with a formatted value"){data-zoomable}
_Example of a Gauge with a formatted value, using JSONata to round the value to 1 decimal place._

If you're passing in a `msg` that needs formatting, before being displayed on the gauge, you can use the `Value` property to format the value.

For example, if you want to round the value to 1 decimal place, you can set the type of Value to "JSONata" and use the following:

```js
$round(payload, 1) // round to 1 decimal place
```

You can read more about the JSONata expression language and in particular, it's numeric functions, [here](https://docs.jsonata.org/numeric-functions).

## Examples

### Half Gauge - Rounded

| Type | Style | Size (Gauge) | Size (Gap) | Size (Segments) |
| --- | --- | --- | --- | --- |
| Half Gauge | Rounded | 16 | 2 | 8 |

![Example of a Half Gauge, showing a rounded arc](/images/node-examples/ui-gauge-half-rounded.png "Example of a Half Gauge, showing a rounded arc"){data-zoomable}
*Example of a Half Gauge, showing a rounded arc.*

### Half Gauge - Needle

| Type | Style | Suffix | Size (Gauge) | Size (Gap) | Size (Segments) |
| --- | --- | --- | --- | --- | --- |
| Half Gauge | Needle | % | 0 | 0 | 32 |

![Example of a Half Gauge, showing a needle with segments-only](/images/node-examples/ui-gauge-half-needle.png "Example of a Half Gauge, showing a needle with segments-only"){data-zoomable}
*Example of a Half Gauge, showing a needle with segments-only.*

### 3/4 Gauge - Rounded

| Type | Style | Size (Gauge) | Size (Gap) | Size (Segments) |
| --- | --- | --- | --- | --- |
| 3/4 Gauge | Rounded | 16 | 0 | 0 |

![Example of a 3/4 Gauge, showing a rounded arc with no segments](/images/node-examples/ui-gauge-34-rounded.png "Example of a 3/4 Gauge, showing a rounded arc with no segments"){data-zoomable}
*Example of a 3/4 Gauge, showing a rounded arc with no segments.*

### 3/4 Gauge - Needle

| Type | Style | Size (Gauge) | Size (Gap) | Size (Segments) |
| --- | --- | --- | --- | --- |
| 3/4 Gauge | Needle | 32 | 2 | 6 |

![Example of a 3/4 Gauge, showing a needle with segments and an arc](/images/node-examples/ui-gauge-34-needle.png "Example of a 3/4 Gauge, showing a needle with segments and an arc"){data-zoomable}
*Example of a 3/4 Gauge, showing a needle with segments and an arc.*

### Tile

| Type | Label |
| --- | --- |
| Tile | My Tile |

![Examples of some Tile Gauges](/images/node-examples/ui-gauge-tiles.png "Examples of some Tile Gauges"){data-zoomable}
*Examples of some Tile Gauges*

![Examples of Tile gauges with the 'Always Show Label' option enabled](/images/node-examples/ui-gauge-tile-labels.png "Examples of Tile gauges with the 'Always Show Label' option enabled"){data-zoomable}
*Examples of Tile gauges with the 'Always Show Label' option enabled*

### Battery <AddedIn version="1.15.0" />

| Type |
| --- |
| Battery |

![Examples of some horizontal Battery Gauges](/images/node-examples/ui-gauge-battery.png "Examples of some Battery Gauges"){data-zoomable}
*Examples of some horizontal Battery Gauges*

### Water Tank <AddedIn version="1.15.0" />

| Type |
| --- |
| Water Tank |

![Examples of some Water Tank gauges](/images/node-examples/ui-gauge-water-tank.png "Examples of some Water Tank gauges"){data-zoomable}
*Examples of some Water Tank gauges*

When switching to a "Water Tank" type, the segments will be overridden with the following values:

```js
[{
    color: '#A8F5FF',
    from: 0
}, {
    color: '#55DBEC',
    from: 15
}, {
    color: '#53B4FD',
    from: 35
}, {
    color: '#2397D1',
    from: 50
}]
```

## Overriding CSS

The gauge can be styled further by adding custom CSS to the `ui_template` node. Some useful classes that are available for styling include:

- `.nrdb-ui-gauge-value span` - The value in the middle of the gauge
- `.nrdb-ui-gauge-value label` - The unit label
- `.nrdb-ui-gauge-value i` - The icon
- `.nrdb-ui-gauge-icon-only i` - Available when a gauge has an icon but no "unit" label
- `.nrdb-ui-gauge #limits` - The containing `<g>` element that wraps min/max `<text>` elements
