# UI Template Examples

The UI Template node allows you to create custom widgets for your dashboard, as well as define custom CSS to style your dashboard in anyway you like.

To help get you started on these, we've collected a few useful examples that you can use or modify to suit your own needs.

## Widgets

### Custom Data Tables

Whilst we do offer the [`ui-table`](../nodes/widgets/ui-table.md) widget out of the box, it's fairly basic in it's functionality, and doesn't allow for much customization of cells and styling. 

In Dashboard 1.0, there was a popular third-party `ui-table` widget, which offered wider customisation, but for Dashboard 2.0, we've taken a slightly different approach. Rather than defining a spec that you must put your data into, in order to utilise a set number of features in a library, with Dashboard 2.0, you can use the `ui-template` to customise a data table in anyway you like, and with any data format.

![Example of a Data Table](/images/template-examples/custom-data-table.png "Example of a Data Table"){data-zoomable}
_Example of a custom header and cell content using ui-template and Vuetify's Data Table_

Here we take a look at how you can use the UI Template node, and [Vuetify's Data Table](https://vuetifyjs.com/en/components/data-tables/basics/#usage) (which is what we use under the covers in `ui-table` anyway), to make data tables with unlimited customisations:

```vue
<template>
    <!-- Provide an input text box to search the content -->
    <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify" single-line variant="outlined"
    hide-details></v-text-field>
    <v-data-table v-model:search="search" :items="msg?.payload">
      <template v-slot:header.current>
        <!-- Override how we render the header for the "current" column -->
        <div class="text-center">Center-Aligned</div>
      </template>

      <template v-slot:item.target="{ item }">
        <!-- Add a custom suffix to the value for the "target" column -->
        {{ item.target }}°C
      </template>

      <template v-slot:item.current="{ item }">
        <!-- Render a Linear Progress Bar for the "current" column -->
        <v-progress-linear v-model="item.current" min="15" max="25" height="25" :color="getColor(item)">
          <template v-slot:default="{ value }">
            <strong>{{ item.current }}°C</strong>
          </template>
        </v-progress-linear>
      </template>
    
    </v-data-table>
</template>

<script>
    export default {
    data () {
      return {
        search: ''
      }
    },
    methods: {
        // add a function to determine the color of the progress bar given the row's item
      getColor: function (item) {
        if (item.current > item.target) {
          return 'red'
        } else {
          return 'green'
        }
      }
    }
  }
</script>
```

Where we pass in data such as:

```json
[
    {
        "Room": "Living Room",
        "id": "1234",
        "target": 18.1,
        "current": 20
    },
    {
        "Room": "Bathroom Room",
        "id": "5678",
        "target": 19.5,
        "current": 18
    },
    {
        "Room": "Kitchen Room",
        "id": "9101",
        "target": 18.1,
        "current": 17.6
    }
]
```

Vuetify's Data Table will automatically render a column for each item in the data provided, by default it will just render it as text (as we do in `ui-table`). However, we can also use the `<template v-slot:item.property />` syntax to override how we render a particular cell.

## Custom Styling

A lot of the styling for Node-RED Dashboard 2.0 is driven by the underlying [Vuetify](https://vuetifyjs.com/en/) library, which we use to render many of the widgets. This often means that, when defining your own CSS, we need to override the underlying Vuetify classes.

To add your own CSS you can add a `ui-template` node and select one of the following "Type" options:

- **CSS (Single Page)** - This will add the CSS to the `<style>` tag of a single page, and only that page.
- **CSS (All Pages)** - This will add the CSS to the `<style>` tag of all pages in your Dashboard.

Here are a few examples we've put together based on common requests we've seen in the forums.

### Font

![Example of a Data Table](/images/template-examples/style-font.png "Example of a Data Table"){data-zoomable}
_Example of a custom header and cell content using ui-template and Vuetify's Data Table_

To modify the default font used in your Dashboard, you can override the `font-family` field at the `body` level, which would ensure it's covered across _all_ elements in your Dashboard:

```css
body {
    font-family: monospace;
}
```


### Background Image

If you'd like to have a custom texture or background image such as:

![Example of a Data Table](/images/template-examples/style-bg.png "Example of a Data Table"){data-zoomable}
_Example of a custom header and cell content using ui-template and Vuetify's Data Table_

You can use the following CSS:

```css
.v-main {
    background-image: url("	https://www.transparenttextures.com/patterns/batthern.png");
    background-repeat: repeat;
}
```

### Group Styling

![Example of styling applied to the Groups rendered in Dashboard 2.0](/images/template-examples/style-group.png "Example of styling applied to the Groups rendered in Dashboard 2.0"){data-zoomable}
_Example of styling applied to the Groups rendered in Dashboard 2.0_

Groups in Node-RED Dashboard are made of a wrapping container with a class of `nrdb-ui-group`, and then a block within that which you see visually as the group, which is a Vuetify Card widget, and so has the class `v-card`.

We can use these classes to style the groups in our Dashboard, for example, to make the border's thicker we could define:

```css
/* All .v-card's inside a group */
.nrdb-ui-group .v-card {
    border-width: 10px;
}
```

### Navigation Styling

![Example of how to override the \"navigation drawer\" styling in Dashboard 2.0](/images/template-examples/style-side-nav.png "Example of how to override the \"navigation drawer\" styling in Dashboard 2.0"){data-zoomable}
_Example of how to override the \"navigation drawer\" styling in Dashboard 2.0_

By default, the side navigation drawer that lists all of the pages in your Dashboard is styled in accordance with the "Navigation" colour in your Theme. This means that its `background-color` will match the header of the Dashboard too. If you'd like to override this, you can do so by using the `.v-navigation-drawer` class:

```css
.v-navigation-drawer {
    background-color: white;
    color: black;
}
```