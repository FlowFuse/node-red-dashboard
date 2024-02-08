---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the dropdown with respect to the parent group. Maximum value is the width of the group.
    Type: Defines the shape of the gauge, "Half Gauge" or "3/4 Gauge"
    Style: Defines the style of arc rendered, "Needle" or "Rounded"
    Range (min): The smallest value that can be shown on the gauge
    Range (max): The largest value that can be shown on the gauge
    Segments: Defines the barriers by which the arc is color coded. These segments can also be shown on the gauge.
    Label: Text shown above the gauge, labelling what the gauge is showing.
    Prefix: Text to be added _before_ the value in the middle of the gauge.
    Suffix: Text to be shown _after_ the value in the middle of the gauge.
    Units: Small text to be shown below the value in the middle of the gauge.
    Sizes (Gauge): (px) How thick the arc and backdrop of the gauge are rendered.
    Sizes (Gap): (px) How big the gap/padding is between the Gauge and the "Segments"
    Sizes (Segments): (px) How thick the segments are rendered.
---


<script setup>
    import AddedIn from '../../components/AddedIn.vue';
</script>

# Gauge `ui-gauge` <AddedIn version="1.1.0"/>

Adds a Guage Chart to your Dashboard. This can be configured with custom types (half, 3/4), styles (rounded, needle) and segmentation with examples detailed [below](#examples).

## Properties

<PropsTable/>

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

