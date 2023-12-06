---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Scope: "Template nodes can be used  for 3 purposes/scopes: <ul><li><b>Widget:</b>A standard HTML/Vue widget rendered in a group in the Dashboard.</li><li><b>CSS (All Pages):</b>Define custom CSS classes/styling that applies to the entire Dashboard.</li><li><b>CSS (Single Page):</b>Define custom CSS classes/styling that applies just a single page of your Dashboard.</li></ul>"
    Class: Appends CSS classes to the widget
    Template: The content of the widget or CSS &lt;style&gt;. If using this for CSS, you do not need to include any &lt;style&gt; tags, as these will be automatically added.
---

<script setup>
    import AddedIn from '../../components/AddedIn.vue';
</script>

# Text `ui-template` <AddedIn version="0.10.0"/>
 
Provide custom JS and HTML (including any [Vuetify components](https://vuetifyjs.com/en/components/all/)) to render in the Dashboard.

- Define your own Vue components
- Load external JS dependencies
- Write raw JavaScript
- Use Vuetify components

## Properties

<PropsTable/>

## Built In Functionality

Any Vue Components that you define in `ui-template` extend the underlying `ui-template` Vue component. This includes a collection of builtin methods, data and supported Widgets. You can also render dynamic content using any VueJS data-binding expressions, (e.g. `v-if`, `v-for`).

### Vuetify Widgets

The `ui-template` node also has access to the [Vuetify component library](https://vuetifyjs.com/en/components/all/) by default. The library provides a large number of pre-built widgets that you can use in your Dashboard.

These are particularly useful as they provide easy access to a large number of pre-built widgets that aren't necessarily included in the core nodes of Node-RED Dashboard 2.0.

Some example widgets that you may find useful are:

- [File Input](https://vuetifyjs.com/en/components/file-inputs/) - Allows for the selection of a file from the user's local filesystem.
- [Star Rating Widget](https://vuetifyjs.com/en/components/ratings/) - A star rating widget, where users can select a rating from 1-n stars.
- [Progress Linear](https://vuetifyjs.com/en/components/progress-linear/) - A horizontal bar to show progress of a task or single bar-graph type visualisations. 

### Reading Node Input

Whenever a `ui-template` receives a `msg` in Node-RED, that is automatically assigned to the `msg` variable in the template.

Additionally, we also bind a computed variable `value` to `msg.payload`. This means that you can access the `msg` object in your template, as well as binding the `value` variable to any widgets you use. 

Such an example would be:

```html
<div>
    <h2>Latest <code>msg</code> received:</h2>
    <pre>{{ msg }}</pre>
</div>
```

![Example of UI Template displaying the last received message](/images/node-examples/ui-template-lastmsg.png "Example of UI Template displaying the last received message"){data-zoomable}

### Sending Messages in Node-RED

Two exposed methods, `send` and `submit`, allow you to send messages from the Dashboard to the Node-RED flow. 

- `send` - Outputs a message (defined by the input to this function call) from this node in the Node-RED flow. 
- `submit` - Send a `FormData` object when attached to a `<form>` element. The created object will consnist of the `name` attributes for each form element, corresponding to their respective `value` attributes.

#### Sending on Click
Here, we call it when someone clicks our "Send Hello World" button:

```vue
<v-btn @click="send({payload: 'Hello World'})">Send Hello World</v-btn>
```

#### Sending on Change
Or another example, where the payload is automatically sent any time the `v-model` is changed:

![Example of UI Template using Vuetify's Rating Widget](/images/node-examples/ui-template-rating1.png "Example of UI Template using Vuetify's Rating Widget"){data-zoomable}

```vue
<v-rating hover :length="5" :size="32" v-model="value"
    active-color="primary" @update:modelValue="send({payload: value})"/>
```

`v-model` in Vue is a way of two-way binding a variable to a widget. Here, we bind the `value` variable to the `v-rating` widget. Then we watch for changes on that value with `@update:modelValue` and send the `value` variable to the Node-RED flow via `msg.payload`.

When changed, if wired to a "Debug" node, then we can see the resulting outcome is as follows:

![Example output from using Vuetify's Rating Widget](/images/node-examples/ui-template-rating2.png "Example output from using Vuetify's Rating Widget"){data-zoomable}

## Building Full Vue Components

You can also build full Vue components in the `ui-template` node. This allows you to build your own bespoke behaviour, and gives you more control over the UI.

To do this in `ui-template` you need to define a `<template>` and `<script>` section in your template.

For example, here we define a counter widget:

```vue
<template>
    <div>
        <h2>Counter</h2>
        <p>Current Count: {{ count }}</p>
        <p>Formatted Count: {{ formattedCount }}</p>
        <v-btn @click="increase()">Increment</v-btn>
    </div>
</template>

<script>
    export default {
        data() {
            // define variables available component-wide
            // (in <template> and component functions)
            return {
                count: 0
            }
        },
        watch: {
            // watch for any changes of "count"
            count() {
                if (this.count % 5 === 0) {
                    this.send({payload: 'Multiple of 5'})
                }
            }
        },
        computed: {
            // automatically compute this variable
            // whenever VueJS deems appropriate
            formattedCount() {
                return `${this.count} Apples`
            }
        },
        methods: {
            // expose a method to our <template> and Vue Application
            increase() {
                this.count++
            }
        }
    }
</script>
```

Anything returned from the `data` function is automatically made available to the `<template>`. This means that we can use the `count` variable in our template, and it will automatically update as the variable changes.

We can also `watch` any of these `data` variables, and react accordingly. For example, above, we send a message to Node-RED whenever the `count` variable reaches a multiple of 5.

We use a `computed` variable which will automatically update whenever the `count` variable changes. This allows us to format the `count` variable in a way that is more useful to us to display, without affecting the underlying `count` variable.

### Running code on load

In VueJS, you can run code when a component is loaded by using the `mounted()` function. This is called when the component is first loaded into the Dashboard:

```vue
<template>
    <div style="display: flex; gap: 8px;">
        <label>Has Loaded:</label>
        <code>{{ loaded }}</code>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                loaded: false
            }
        },
        mounted() {
            this.loaded = true
        }
    }
</script>
```

If you want to do the inverse, run code when your widget is removed from the screen, you can use the `unmounted()` function.

### VueJS Options API

We are utilising VueJS's [Options API](https://vuejs.org/api/#options-api) here as it's far easier to merge with the `ui-template` component. Unfortunately, at the moment, we do not support the [Composition API](https://vuejs.org/api/#composition-api).

A full list of the VueJS Options API properties that we currently support are:

- `name`
- `data`
- `watch`
- `computed`
- `methods`
- `mounted`
- `unmounted`

## Loading External Dependencies

It is possible to load external dependencies into your `ui-template` node. This is useful if you want to use a library that isn't included in the core Node-RED Dashboard 2.0 nodes.

To do this, you'll need to load the dependency in the `<script>` section of your template. For example, to load the [Babylon.js](https://www.babylonjs.com/) library, you would do the following:

```html
<script src="https://cdn.babylonjs.com/babylon.js"></script>
```

You can then have _another_ `<script />` tag in the same `ui-template` that utilises this library.

An important caveat here is that, whilst this does get injected into the `<head />` of the Dashboard, because our widgets are loaded after the initial page load, the library isn't always available straight away as your Vue component and HTML loads. 

If you need access to the library as soon as it's available, the trick to this is to run a `setInterval()` and watch the `window` object for the library to be loaded.

For example:

```vue
<template>
    <!-- Template Content Here -->
</template>
<script src="https://cdn.babylonjs.com/babylon.js"></script>
<script>
export default {
    name: "MyComponent",
    mounted () {
        // run this code when the widget is built
        let interval = setInterval(() => {
            if (window.BABYLON) {
                // Babylon.js is loaded, so we can now use it
                clearInterval(interval);
                // call an init() function defined in this component
                this.init();
            }
        }, 100);
    },
    methods: {
        init () {
            // do stuff with BABYLON here
        }
    }
}
</script>
```

## Writing Raw JavaScript

You are not limited to having to use a Vue components, as you can also write raw JavaScript in the `ui-template` node. This code will then run as the widget is loaded into Dashboard.


## Examples

![Examples of UI Template](/images/node-examples/ui-template.png "Examples of UI Template"){data-zoomable}
*Examples of variants of ui-template, one with a functional form, and another showing use of random Vuetify components.*

### Built In Functions 
The template also has access to two built-in functions:
s
_Note: Currently restricted to custom HTML only, but there are plans to add `<style>` and `<script>` editors in the future too (track [here](https://github.com/FlowFuse/node-red-dashboard/issues/115))._

