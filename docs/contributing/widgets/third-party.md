# Building Third Party Widgets

If you have an idea for a widget that you'd like to build in Dashboard 2.0 we are open to Pull Requests and ideas for additions to the [core collection](../../nodes/widgets.md) of Widgets.

We do also realise though that there are many occasions where a standalone repository/package works better as was very popular in Dashboard 1.0.

## Quick Links

Here is a quick summary of the features and functionality available to third-party widgets.

- **Custom Dependencies** - ([link](#injecting-head-tags-dependencies)) Injection of external widget dependencies (e.g. other JavaScript libraries) via `<head>`.
- **Defining Content to Render** - ([link](#defining-html-to-render)) `format` defines the HTML to render in the Dashboard.
- **On Input** - ([link](#defining-oninput-functionality)) `onInput` defines behaviour of the widget in Dashboard when it receives a message in Node-RED.
- **On Load** - ([link](#optional-config-options)) `onMounted` defines functionality when a widget first loads in Dashboard.
- **Custom Functions** - ([link](#custom-functionality)) Define general functions that can be called from within your widget at any point of your choosing
- **Extend Built-In Events** - ([link](#ui-template-functionality)) Our built in `send` function can be called within your widget's template, and will send a message back to Node-RED, with any content of your choosing.
- **Custom SocketIO Event Handlers** - ([link](#custom-socketio-events)) If you want to extend the communication between Dashboard and Node-RED, you can emit your own SocketIO events from Dashboard, and have respective handlers for those events in Node-RED.

## Basic Folder Structure

The following explanation of how to build your own third party widgets will reference the [Example Node](https://github.com/FlowFuse/node-red-dashboard-example-node) that we've open sourced, showing various integration examples of features available.

As with any Node-RED nodes, you'll need to start with two files:

- `/nodes/ui-example.html` - defines the node’s properties, edit dialog and help text.
- `/nodes/ui-example.js` - defines the node's server-side behaviours

Each Widget in Dashboard also consists of a `.vue` file to define how a widget is rendered in the Dashboard front-end.

- `/ui/UIExample.vue` - Defines the contents the `<template>` of a Vue component

Finally, any functions that you want to define, that will run as part of your client-side Vue component, can be defined in a standalone module.

- `/ui/methods.js` - Defines a collection of client-side Vue/JS functions.

## Registering your Node & Widget

_More details: [Registration](../guides/registration.md)_

Traditionally with Node-RED, you have to register your node using `RED.nodes.registerType("ui-example", UIExampleNode)`, this is still the case with Dashboard, but you must _also_ register the widget with Dashboard too.

Dashboard registration is built upon is a `.register()` function (see [docs](../guides/registration.md)). This function is available to any `ui-base`, `ui-page` or `ui-group`. For `ui-group` and `ui-page`, it brokers the function up to the `ui-base` where a store is maintained of all widgets in the Dashboard.

Your widget should define one of these as a property in your Node-RED node, most likely, it'll be `ui-group`, if you want your widget to render _inside_ a Group in the Dashboard.

In your `/nodes/ui-example.js` file:

```js
module.exports = function(RED) {
    function UIExampleNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        config.type = 'ui-example'     // provide a relevant widget type 
        config.templateScope = 'local' // required by ui-template

        /**
         * Further config & setup to go here
         */

        // register the widget with Dashboard
        group.register(node, config, evts)
    }
    // Register the node with Node-RED
    RED.nodes.registerType("ui-example", UIExampleNode);
}
```

## Configuring your Node

The following is a summary of the the Node-RED node configuration parameters (`config`) available, when registering your widget with Dashboard's `.register` function:

```js
group.register(node, config, evts)
```

You can extend this as much as you need to in order to add further customisation to your widget. All of these options are then made available in your widget's `.vue` file via the `this.props` object.

### Essential Config Options:

You must choose _one_ of these properties to include such that your Widget has a direct owner. Whichever you choose, you'll then use that owner's `.register()` function to register your widget.

You must expose this option in your node's `.html` file too so that users can define which instance (of `ui-group`, `ui-page`, `ui-base`) your widget will be bound to.

|property |  description |
|--|--|
| `group`  | The most common use case, where your widget will render as part of a Group in the Dashboard. |
| `page`   | If your widget should be constrained to a full/single page, then this is appropriate. |
| `base`   | If your widget performs independant of any page/group, then bind it to the `ui-base`. |

The following properties should then _all_ be defined, and can be done so in your node's `.js` file constructor.

|property | example | description |
|--|--|--|
| `type`           | `ui-example`   | A suitable, lowercase, kebab-case type for your widget |
| `templateScope`  | `local`        | Required by `ui-template` that all third=party widgets extend |
| `format`         | `<p>Hello</p>` | A string of HTML to render for your widget |
| `head`           | see [example](#injecting-head-tags-dependencies)    | An object detailing the relevant `script`, `meta`, `style` or `link` tags to add. |

### Optional Config Options:

These options, whilst defined server-side, are passed to the client-side Vue component, and are used to customise the client-side behaviour of your widget.

|property | example | description |
|--|--|--|
| `onMounted`  |     | Stringified function to run when your widget loads in Dashboard. |
| `onInput`    | see [example](#defining-oninput-functionality) | Stringified function that will run client-side, whenever your node receives an input in Node-RED. |
| `methods`    | see [example](#custom-functionality) | An object, where each key is the method name, and the value is a stringified function. These methods will then be exposed to your widget via the widgets's Vue component. |


## Example Configurations

Here, we go into detail about how to define the various config options available to you.

### Injecting `<head>` Tags & Dependencies

A likely scenario is that you'll want to inject some `<script>` tags into the `<head>` of your Dashboard's UI, in order to load dependencies for your custom widget. To do this, you can set `config.head`, for example:

```js
config.head = {
    script: [
        { type: 'text/javascript', defer: 'defer', src: 'https://code.jquery.com/jquery-3.7.1.min.js' },
        { type: 'text/javascript', defer: 'defer', src: 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js' }
    ]
}
```

This will then be rendered into the head as follows:

```html
<script
    defer="defer" src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"
    data-template-name="My Widget"  data-template-id="e1sa12jwc"
    data-template-scope="local">
</script>
```

Note that Dashboard will also inject `data-` attributes to detail the source of any tag added dynamically so that you have full visibility on _where_ the tag came from when needing to debug, etc.

With this same mechanism, you can also define `<meta>` (for site description and meta data) or `<link>` tags (for custom CSS and fonts), e.g:

```js
config.head = {
    meta: [
        { name: 'description', content: 'A custom description of the page' }
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
    ],
    link: [
        { rel: 'stylesheet', type: 'text/css', href: 'https://fonts.googleapis.com/css?family=Roboto' }
    ]
}
```

### Defining HTML to Render

The `ui-template` (which your third-party widget will extend) relies on a `format` property to define the relevant HTML to render, as a result, we can inject our own content with something like:


```js
fs.readFile(path.join(__dirname, '../ui', 'my-html.html'), 'utf8', (err, html) => {
    config.format = html
})
```

This will read our `my-html.html` as a string, and then bind it to the node.

### Defining `onInput` Functionality

Here we can define functionality that runs client-side (in the Dashboard) whenever the node receives a `msg` in Node-RED.

The contents of `onInput` are written as if contained within a `.vue` file, this means that you can use `this` freely and access any relevant `data`, `props` or `methods` as you wish, and even manipulate the widget's HTML e.g:

```js
function onInput (msg) {
    // because this will get evaluated client-side, we have access to vue/this
    const vue = this
    // get an elemnt of the DOM inside this widget with a ref="my-widget", and update it's innerHTML
    vue.$refs['my-widget'].innerHTML = msg.payload
    // call Dashboard's built-in .send() function
    vue.send({
        payload: 'Created onInput'
    })
}
```

Note the use of VueJS's `$refs` for DOM selection - you can read more about this [here](https://vuejs.org/guide/essentials/template-refs.html).

In our `ui-example.js` file, we can append this to our `config` with:

```js
// import our client-side functions
const methods = require('../ui/methods')

// methods that will be available to the widget in the Dashboard
config.onInput = methods.onInput
```

### Custom Functionality

We can extend VueJS's [methods](https://vuejs.org/api/options-state.html#methods) by using `config.methods`:

```js
// methods that will be available to the widget in the Dashboard
config.methods = {
    test: methods.test
}
```

These functions can be called directly from your `.vue` file too, e.g:

```vue
<p @click="test()">
    This is a 3rd Party Widget
</p>
```

As with the [Defining onInput Functionality](#defining-oninput-functionality) you also have access to the full `vue` object, e.g:

```js
function test () {
    // because this will get evaluated client-side, we have access to vue/this
    const vue = this
    
    // log the Widget's ID & name
    console.log(this.id, this.props.name)
}
```

## Custom SocketIO Events

It is also possible to extend our own [Events Framework](../guides/events.md) with your own events traffic, sending events from the Dashboard UI back into your node.

Definition needs to happen in two places:

- Client - where you need to `emit` the event
- Node-RED - where you need to listen to those events, and define appropriate handlers

### Emit from Dashboard

You can `emit` an event from within any of your [Custom Functionality](#custom-functionality) using the in-built `vue.$socket.emit()` function, e.g:

```js
// emit 'my-custom-event' with a topic of the widget's id, and msg of { payload: "Test" } 
vue.$socket.emit('my-custom-event', this.id, {
    payload: "Test"
})
```

### Handle Event in Node-RED

The event handlers can be added to our `evts` object passed into the `.register` function, like so:


```js
const evts = {
    onSocket: {
        'my-custom-event': function (id, msg) {
            console.log('my-custom-event', id, msg)
        }
    }
}
group.register(node, config, evts)
```

## UI Template Functionality

Because we wrap third party widgets in a `ui-template` node, you have access to the same properties & functions.

### Properties

- `id` - The Widget's ID, assigned by Node-RED
- `props` - Properties defined in Node-RED, e.g. `this.props.name` or `this.props.group`

For example, we could loop over all properties and render their respective property key:

```vue
<h1>Widget ID: {{ id }}</h1>
<ul>
    <li v-for="(value, key, index) in props">
        <label>{{ key }}</label>
    </li>
</ul>
```

### Functions

- `send` - Send a `msg` (defined by the input to this function call) from this node in the Node-RED flow.

Let's consider:

```vue
<p @click="send({'payload': 'Hello World'})">
    This is a 3rd Party Widget
</p>
```

This, when clicked, will send a `msg` in Node-RED to any nodes connected to the output of this node.