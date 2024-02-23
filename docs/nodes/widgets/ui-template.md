---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Scope: "Template nodes can be used  for 3 purposes/scopes: <ul><li><b>Widget (Group-Scoped):</b>A standard HTML/Vue widget rendered in a group in the Dashboard.</li><li><b>Widget (Page-Scoped):</b>A HTML/Vue widget that will render on a page, outside of any existing groups. Note that these widgets will render after any Groups. An example use case for this would be if you wanted to have a fixed footer on a given page.</li><li><b>Widget (UI-Scoped):</b>A HTML/Vue widget rendered on every page of the Dashboard. Most commonly used in conjuction with <a href=\"#teleports\">Teleports</a></li><li><b>CSS (All Pages):</b>Define custom CSS classes/styling that applies to the entire Dashboard.</li><li><b>CSS (Single Page):</b>Define custom CSS classes/styling that applies just a single page of your Dashboard.</li></ul>"
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

## Writing Custom Widgets

UI Template will parse different tags and render them into Dashboard. The available tags are:

- `<template>` - Any HTML code in here will be rendered into the Dashboard.
- `<script>` - Any JavaScript code in here will be executed when the widget is loaded. You can also [define a full VueJS component](#building-full-vue-components) here.
- `<style>` - Any CSS code in here will be injected into the Dashboard.

### Built-in Variables

You have access to a number of built-in variables in your `ui-template` node:

- `this.id` - The ID of the `ui-template` node, assigned by Node-RED.
- `this.$socket` - The socket.io connection that is used to communicate with the Node-RED backend.
- `this.msg` - The last message received by the `ui-template` node.

***Important Note:*** It is a good practice to utilise JavaScript's conditional operator (`?`) when accessing nested values inside say `msg.payload`.

On first first, `msg.payload` may be `null` or `undefined`, and trying to access a nested value will throw an error. Using the operator, `msg.payload?.nested?.value` will not throw an error if `msg.payload` is `null` or `undefined`, whereas `msg.payload.nested.value` will.

### Built-in Functions

We also offer some helper functions for the Node-RED integration too:

- `this.send` - Send a message to the Node-RED flow. If a non-Object value is sent, then Dashboard will automatically wrap that into a `msg.payload` object.
- `this.$socket.on('msg-input' + this.id, (msg) = { ... })` - will listen to any messages received by your `ui-template `node and react accordingly.

### Example (Raw JavaScript)

Putting this together, here is a simple starter widget that will alert the user when they click the button, and send a message into Node-RED.

```vue
<template>
    <!-- Any HTML can go here -->
    <button class="my-class" onclick="onClick()">My Button</button>
</template>

<script>
    /* Write any JavaScript here */
    // add our onClick function to the window object to make it accessible by the HTML <button>
    window.onClick = function () {
        alert('Button has been clicked')
    }

    // Use send() function to pass on data back into Node-RED:
    this.send('Component has loaded')

    // Subscribe to the incoming msg's
    this.$socket.on('msg-input:' + this.id, function(msg) {
        // do stuff with the message
        alert('message received: ' + msg.payload)
    })
</script>

<style>
    /* define any styles here - supports raw CSS */
    .my-class {
        color: red;
    }
</style>
```

### Loading External Dependencies

It is possible to load external dependencies into your `ui-template` node. This is useful if you want to use a library that isn't included in the core Node-RED Dashboard 2.0 nodes.

To do this, you'll need to load the dependency in the `<script>` section of your template. For example, to load the [Babylon.js](https://www.babylonjs.com/) library, you would do the following:

```html
<script src="https://cdn.babylonjs.com/babylon.js"></script>
```

You can then have _another_ `<script />` tag in the same `ui-template` that utilises this library.

An important caveat here is that, whilst this does get injected into the `<head />` of the Dashboard, because our widgets are loaded after the initial page load, the library isn't always available straight away as your Widget and HTML loads. 

If you need access to the library as soon as it's available, the trick to this is to run a `setInterval()` and watch the `window` object for the library to be loaded.

For example:

```vue
<template>
    <!-- Template Content Here -->
</template>

<script src="https://cdn.babylonjs.com/babylon.js"></script>

<script>
function init () {
    alert('Babylon.js is loaded')
}

// run this code when the widget is built
let interval = setInterval(() => {
    if (window.BABYLON) {
        // call an init() to use BABYLON
        init();
        // Babylon.js is loaded, so we can now use it
        clearInterval(interval);
    }
}, 100);
</script>
```

## Building Full Vue Components

You can build full Vue components in the `ui-template` node, using VueJS's [Options API](https://vuejs.org/api/#options-api). This allows you to build your own bespoke behaviour, and gives you more control over the UI.

A full list of the VueJS Options API properties that we currently support are:

- `name` - The name of your component
- `data` - A function that returns data you want available across your component (in both `<template>` and `<script>` sections)
- `watch` - Run a function anytime a particular component variable changes
- `computed` - Calculate a variable based on other variables in your component
- `methods` - Define functions that can be called from your `<template>` or `<script>` sections
- `mounted` - Run code when the component is first loaded
- `unmounted` - Run code when the component is removed from the Dashboard

### Example (Full Vue Component)

Here we define a counter widget, and utilise Vue's `data`, `watch`, `computed` and `methods` properties. This widget will automatically update the `formattedCount` variable whenever the `count` variable changes and will send a message to Node-RED whenever the `count` variable reaches a multiple of 5.

```vue
<template>
    <div>
        <h2>Counter - loaded: {{ loaded }}</h2>
        <p>Current Count: {{ count }}</p>
        <p class="my-class">Formatted Count: {{ formattedCount }}</p>
        <v-btn @click="increase()">Increment</v-btn>
    </div>
</template>

<script>
    export default {
        data() {
            // define variables available component-wide
            // (in <template> and component functions)
            return {
                loaded: false,
                count: 0
            }
        },
        watch: {
            // watch for any changes of "count"
            count: function () {
                if (this.count % 5 === 0) {
                    this.send({payload: 'Multiple of 5'})
                }
            }
        },
        computed: {
            // automatically compute this variable
            // whenever VueJS deems appropriate
            formattedCount: function () {
                return `${this.count} Apples`
            }
        },
        methods: {
            // expose a method to our <template> and Vue Application
            increase: function () {
                this.count++
            }
        },
        mounted() {
            // code here when the component is first loaded
            this.loaded = true
        },
        unmounted() {
            // code here when the component is removed from the Dashboard
            // i.e. when the user navigates away from the page
        }
    }
</script>
<style>
    /* define any styles here - supports raw CSS */
    .my-class {
        color: red;
    }
</style>
```

Anything returned from the `data` function is automatically made available to the `<template>`. This means that we can use the `count` variable in our template, and it will automatically update as the variable changes.

We can also `watch` any of these `data` variables, and react accordingly. For example, above, we send a message to Node-RED whenever the `count` variable reaches a multiple of 5.

We use a `computed` variable which will automatically update whenever the `count` variable changes. This allows us to format the `count` variable in a way that is more useful to us to display, without affecting the underlying `count` variable.

### Teleports

You can use [Vue's Teleport](https://v3.vuejs.org/guide/teleport.html) feature to render content to a specific location in the DOM. We provide some pre-defined locations that you can use:

- `#app-bar-actions` - Renders content to the right-hand side of the Dashboard's App Bar.

To use a teleport, you can use the following syntax:

```vue
<template>
    <Teleport v-if="mounted" to="#app-bar-actions">
        <v-btn>My Action</v-btn>
    </Teleport>
</template>
<script>
    export default {
        data() {
            return {
                mounted: false
            }
        },
        mounted() {
            this.mounted = true
        }
    }
</script>
```

This would result in:

![Example of Teleporting content to the App Bar](/assets/images/appbar-teleport.png "Example of Teleporting content to the App Bar"){data-zoomable}

Note the use of `v-if="mounted"` in the `<Teleport />` tag. For some reason, Vue complains when trying to render a Teleport inside our `ui-template`, before the component has fully mounted, Including this `v-if` statement prevents this error.

## Additional Examples

Any Vue Components that you define in `ui-template` extend the underlying `ui-template` Vue component. This includes a collection of builtin methods, data and supported Widgets. You can also render dynamic content using any VueJS data-binding expressions, (e.g. `v-if`, `v-for`).

### Reading Node-RED Input

Whenever a `ui-template` receives a `msg` in Node-RED, that is automatically assigned to the `msg` variable in the template. Such an example would be:

```html
<template>
    <div>
        <h2>Latest <code>msg</code> received:</h2>
        <pre>{{ msg }}</pre>
    </div>
</template>
```

![Example of UI Template displaying the last received message](/images/node-examples/ui-template-lastmsg.png "Example of UI Template displaying the last received message"){data-zoomable}

### Sending Messages to Node-RED

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

### Vuetify Widgets

The `ui-template` node also has access to the [Vuetify component library](https://vuetifyjs.com/en/components/all/) by default. The library provides a large number of pre-built widgets that you can use in your Dashboard.

These are particularly useful as they provide easy access to a large number of pre-built widgets that aren't necessarily included in the core nodes of Node-RED Dashboard 2.0.

Some example widgets that you may find useful are:

- [File Input](https://vuetifyjs.com/en/components/file-inputs/) - Allows for the selection of a file from the user's local filesystem.
- [Star Rating Widget](https://vuetifyjs.com/en/components/ratings/) - A star rating widget, where users can select a rating from 1-n stars.
- [Progress Linear](https://vuetifyjs.com/en/components/progress-linear/) - A horizontal bar to show progress of a task or single bar-graph type visualisations. 

### Articles & Tutorials

- [Building a Custom Video Player with UI Template](https://flowfuse.com/blog/2023/12/dashboard-0-10-0/)
