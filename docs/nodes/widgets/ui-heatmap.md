---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Class: The text shown within the button.
    Grid size: <code>Rows</code> | <code>Columns</code>
        Choose the dimensions of the grid, by specifying the number of rows and columns.
    
    Radius: Defines the radius of a data point, in times the size of a grid cell.

    Min value: Define the minimum data value, i.e. the data value that will correspond to offset 0.0 in the color gradient.  If not specified, the minimum data value is automatically adjusted to the minimum value in the input data.  The minimum value needs to be set in case relative gradient calculations are required.  The minimum value corresponds to the first color in the gradient.
    Max value: Define the maximum data value, i.e. the data value that will correspond to offset 1.0 in the color gradient.  If not specified, the maximum data value is automatically adjusted to the maximum value in the input data.  The maximum value needs to be set in case relative gradient calculations are required.  The maximum value corresponds to the last color in the gradient.
    Opacity: Define the opacity factor that will be applied to the entire heatmap.
    Angle: Define the rotation angle of the entire heatmap.
    X: Define the translation distance of the entire heatmap into the X direction.
    Y: Define the translation distance of the entire heatmap into the Y direction.
    Zoom: Define the zoom factor of the entire heatmap.
    Background: Define the url of the background image that needs to be drawn behind the heatmap.  A base64 encoded url will contain the image data.
    Color gradient:
        <b>Offset:</b> The position at which a particular color starts in the gradient.</br>
        <b>Color:</b> The visible hue, which represents a value or category (e.g. red is hot and blue is cold).</br>
        <b>Opacity:</b> How transparent the color is.
dynamic:
    Class:
        payload: msg.class
        structure: ["String"]
---

<script setup>
    import AddedIn from '../../components/AddedIn.vue';
</script>

# Heatmap `ui-heatmap`


## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Controls

### "Set" data

You can set data for a heatmap by sending a `msg.topic` of `setData` to the node.  Any existing data will first be removed, then new data will be added.

The input data can be injected in the `msg.payload` in two different formats:

1. As an array of numbers:
   ```js
   msg = {
      "topic": "setData",
      "payload": [87, 23, 3, ... ]
   }
   ```
   These numbers will be used as values in the grid cells, from left to right and top to bottom.

2. As an array of objects:
   ```js
   msg = {
      "topic": "setData",
      "payload": [{ row: 1, column: 1, value: 87}, { row: 5, column: 7, value: 47}, ... ]
   }
   ```
   These numbers will be used as values in the grid cells at the specified location.

### "Add" data

You can add data for a heatmap by sending a `msg.topic` of `addData` to the node.  Any new data provided will be added to the existing data on the heatmap.

The input data can only be injected in the `msg.payload` as an array of objects:
```js
msg = {
    "topic": "addData",
    "payload": [
        {
            "row": 1,
            "column": 1,
            "value": 87
        },
        {
            "row": 5,
            "column": 7,
            "value": 47
        },
        ...
    ]
}
```
These numbers will be used as values in the grid cells at the specified location.  When there is no value yet in the specified grid cell, then the new value will be added there.  Otherwise the existing data in the cell will be overwritten by the new data.

### Clear All Data

You can remove all data from a heatmap at any time by sending a `msg.topic` of `clear` to the node. 

### Set opacity

You can set the opacity of the heatmap by sending a `msg.topic` of `setOpacity` to the node.  This allows you to configure the transparency of the heatmap, for example to show the background image partially through the heatmap.  The opacity is a value between 0.0 and 1.0.

```js
msg = {
    "topic": "setOpacity",
    "payload": 0.8
}
```

### Set rotation angle

You can set the rotation angle of the heatmap by sending a `msg.topic` of `setRotationAngle` to the node.  This allows you to rotate the entire heatmap.

```js
msg = {
    "topic": "setRotationAngle",
    "payload": 45
}
```

### Set zoom factor

You can set the zoom factor of the heatmap by sending a `msg.topic` of `setZoom` to the node.  This allows you to zoom in or out the entire heatmap.  A zoom factor of 1.0 means no zooming.

```js
msg = {
    "topic": "setZoom",
    "payload": 45
}
```

### Set min value

You can set the minimum data value of the heatmap by sending a `msg.topic` of `setMin` to the node.  When no minimum value has been set explicit (via an input msg or via the node config screen), then the minimum value of all injected values will be used.  

```js
msg = {
    "topic": "setMin",
    "payload": 9
}
```

### Set max value

You can set the maximum data value of the heatmap by sending a `msg.topic` of `setMax` to the node.  When no maximum value has been set explicit (via an input msg or via the node config screen), then the maximum value of all injected values will be used.  

```js
msg = {
    "topic": "setMax",
    "payload": 98
}
```

### Set translation

You can set the translation value of the heatmap by sending a `msg.topic` of `setTranslate` to the node.  This allows you to move the entire heatmap in the X and/or Y direction.  The translation is specified as an array, with first the X translation and secondly the Y translation.  Both values are specified in grid cell units.

```js
msg = {
    "topic": "setTranslate",
    "payload": [20, 10]
}
```

### Set background image

You can set a new background image by sending a `msg.topic` of `setBackgroundImageUrl` to the node.  That url refers to a public available static image resource.  

Remark: to avoid CORS issues in your browser (when the url refers to another hostname), you might consider to convert the image once to a base64 encoded image.  Then you simple need to inject that base64 encoded image embedded in the url, i.e. push it to your dashboard without having to make the image url public available:

```js
msg = {
    "topic": "setGradient",
    "payload": "data:image/jpeg;base64,..."
}
```

### Set color gradient

You can set a new color gradient dynamically by sending a `msg.topic` of `setGradient` to the node.

```js
msg = {
    "topic": "setGradient",
    "payload": [
        {
            "color": "#000000",
            "opacity": 0,
            "offset": 0
        },
        {
            "color": "#00FF00",
            "opacity": 0.2,
            "offset": 0.2
        },
        {
            "color": "#FF0000",
            "opacity": 0.5,
            "offset": 0.45
        },
        {
            "color": "#00FFFF",
            "opacity": 1,
            "offset": 0.85
        },
        {
            "color": "#0000FF",
            "opacity": 1,
            "offset": 1
        }
    ]
}
```
