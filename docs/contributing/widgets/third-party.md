---
description: Expand Node-RED Dashboard 2.0 with third-party widgets. Learn how to build and integrate them.
---
<script setup>
    import AddedIn from '../../components/AddedIn.vue'
</script>

# Building Third Party Widgets <AddedIn version="0.8.0" />

A single widget consist of two key parts:

1. A Node-RED node that will appear in the palette of the Node-RED Editor
2. `.vue` and client-side code that renders the widget into a dashboard
 
You can explore our collection of core widgets [here](../../nodes/widgets.md). If you have an idea for a widget that you'd like to build in Dashboard 2.0 we are open to Pull Requests and you can read more in our [Adding Core Widgets](./core-widgets.md) guide.

We do also realise though that there are many occasions where a standalone repository/package works better as was very popular in Dashboard 1.0.

## Recommended Reading

On the left-side navigation you'll find a "Useful Guides" section, we recommend taking a look through these as they give a good overview of the structure of the Dashboard 2.0 codebase and some of the underlying architectural principles it is built upon.

In particular, the following are recommended:

- [Events Architecture](/contributing/guides/state-management.html)
- [State Management](/contributing/guides/state-management.html)

## How Widgets are Loaded

Dashboard 2.0 is built on top of [VueJS](https://vuejs.org/), and as such, all widgets needs to be mapped to a Vue component. The process works as follows:

1. Dashboard 2.0 client connects to Node-RED
2. Node-RED sends `ui-config` object contianing details of all pages, themes, groups & widgets
3. In the event handler, we loop over all widget's found in the `ui-config`:
    - If the widget `type` matches a core component, we map it to that component
    - If the widget is a third-party widget, we load the relevant `.umd.js` file, exposed by the widget's `/resources` folder.
3. Dashboard 2.0 loads the relevant Layout (e.g. Grid, Fixed or Notebook) depending on the active URL/page.
4. Within that layout manager, we loop over the widgets, and render their respective Vue components.
    - Every component is passed `id`, `props` and `state` of the widget.

## Getting Started

We have created an [Example Node repository](https://github.com/FlowFuse/node-red-dashboard-example-node) that will provide foundations for your widget. It includes plenty of examples for functionality you'll likely need.

It's base repository has the following file/folder structure:

As with any Node-RED nodes, you'll need to start with two files:

- `/nodes/ui-example.html` - defines the node’s properties, edit UI and help text.
- `/nodes/ui-example.js` - defines the node's server-side behaviours

Each Widget then needs to have client-side code defined that control _how_ the widget is rendered within a Dashboard. Any content within `/ui` will be packaged up into a `.umd.js` file that Dashboard loads at runtime.

- `/ui/components/` - folder containing `.vue` files for any Vue components you require
- `/ui/index.js` - Exports any Vue components that need to be imported into Dashbaord 2.0

Configuration of the node and widgets are controlled across two files:

- `vite.config.js` - contains the details of what to package up into the widget's built `.umd.js` file.
- `package.json` - must contain a `node-red-dashboard-2` section that defines the widgets that Dashboard can import.

### Developing Locally

To start working with your own third-party widget, locally on your machine:

#### Install Node-RED & Dashboard

1. Install Node-RED ([docs](https://nodered.org/docs/getting-started/local))
2. Install `@flowfuse/node-red-dashboard` into Node-RED via the "Manage Palette" option.

#### Install the UI Example Node

1. Fork our [Example Node repository](https://github.com/FlowFuse/node-red-dashboard-example-node) and clone it locally to your machine.
2. Inside the Example Node directory, install the required dependencies:
   ```bash
   npm install
   ```
3. Optionally generate a source map (to map the minified code to the original code), to simplify debugging of the frontend code in the browser.  On Linux this can be achieved by:
   ```bash
   export NODE_ENV=development
   ```
4. Inside the Example Node directory, build the Example Node's `.umd.js` file (what Node-RED uses to run your widget), this will generate it's `/resources` folder, loaded by Node-RED.
   ```bash
   npm run build
   ```

#### Install UI Example into Node-RED

1. Navigate to your local Node-RED directory:
    ```bash
    cd ~/.node-red
    ```
2. Install the local copy of the Example Node:
   ```bash
   npm install /path/to/your/local/node-red-dashboard-example-node-folder
   ```
3. Restart Node-RED

_Note: Any local changes you make inside the `/ui` folder of the third party widget, you'll need to re-run `npm run build` in order to update the `umd.js` file, which is what Dashboard loads to render the widget._

## Configuring your Widget

### Naming Your Widget

In order to import external widgets into the Dashboard core, Dashboard's `ui-base` config node reads Node-RED's `package.json` and checks for any packages that have been installed into Node-RED with `node-red-dashboard-2-` in the package name.

As such, when defining your own integration, please make sure it's named appropriately: 

```json 
"name": "node-red-dashboard-2-<your-widget-name>"
```

### Defining Your Widget

Within your own `package.json`, you'll need to define a `node-red-dashboard-2` section that then tells Dashboard _how_ to load your widget. An example from `ui-example` is as follows:

```json
"node-red-dashboard-2": {
    "version": "0.8.0",   // the minimum version of Dashboard 2.0 supported
    "widgets": {
        "ui-example": {   // this key must match the "type" of your widget, registered in Node-RED
            "output": "ui-example.umd.js", // the name of the built .js file that will be imported into Dashboard, configured in vite.config.js
            "component": "UIExample"       // the name of the primary Vue component that will be rendered as your widget in Dashboard
        }
    }
}
```

### Registering your Node & Widget

_More details: [Registration](../guides/registration.md)_

Traditionally with Node-RED, you have to register your node using `RED.nodes.registerType("ui-example", UIExampleNode)`, this is still the case with Dashboard, but you must _also_ register the widget with Dashboard too.

Dashboard registration is built upon a `.register()` function (see [docs](../guides/registration.md)). This function is available to any `ui-base`, `ui-page` or `ui-group`. For `ui-group` and `ui-page`, it brokers the function up to the `ui-base` where a store is maintained of all widgets in the Dashboard.

Your widget should define one of these as a property in your Node-RED node, most likely, it'll be `ui-group`, if you want your widget to render _inside_ a Group in the Dashboard.

In your `/nodes/ui-example.js` file:

```js
module.exports = function(RED) {
    function UIExampleNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

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

## Guides

The below are guides and examples on building third-party widgets. We also have the "Useful Guides" Section in the left navigation which provide more generalized development guides when contributing to Dashboard 2.0.

### The Basics of VueJS

Aware that a lot of developers that may want to contribute to Dashboard 2.0, may be new to VueJS, so we've detailed a few fundamentals here.

It is very common place since VueJS to see Vue applications using the "Composition API", whilst this is lighter weight way of building your applications, it isn't the most intuitive for those unfamiliar with VueJS, as such, we're mostly using the "Options API" structure across Dashboard 2.0 and in our examples for readability.

With the Options API, a Vue component has the following structure:

```vue
<template>
    <!-- HTML template for the component -->
    <!-- You can reference any variables defined on your components directly here, e.g. -->
    <div>{{ myVar }}</div>
</template>

<script>
export default {
    // any properties that are passed to the component
    // in Dashboard 2.0, these 3 are the ones provided:
    props: ['id', 'props', 'state'],
    // any data that you want to be reactive and available across your component
    // within the <script> reference these variables with this.<myVar>
    // within the HTML, you don't need the "this." prefix
    data () {
        return {
            myVar: 'Hello World'
        }
    },
    // Computed properties are variables that automatically update when their dependencies change
    computed: {
        myComputedProp () {
            return this.myVar + '!'
        }
    },
    // any methods that are used within the component
    methods: {
        myMethod () {
            alert(this.myVar)
        }
    },
    // Runs when the component is built and loaded into the DOM
    mounted () {
        alert('Component has mounted')
    },
    // Runs when the component is removed
    unmounted () {
        alert('Component has been removed')
    }
}
</script>

<style>
/* any CSS styling for the component */
</style>
```


### Using Vuetify Components

You're free to define complety custom HTML/CSS when defining your widgets, but we've also provided native support for all of [Vuetify's Component Library](https://vuetifyjs.com/en/components/all/) to get your started with a wide range of UI components that you may want to utilise.

### Accessing Properties

When widgets are rendered in a Dashboard layout, they are passed a small collection of properties that can be used to customise the widget's behaviour:

|property | description |
|--|--|
| `id` | The ID of the widget, assigned by Node-RED |
| `props` | The properties defined in Node-RED, e.g. `this.props.name` or `this.props.group` |
| `state` | The state of the widget, e.g. `this.state.enabled` or `this.state.visible` |

When rendering these in your own Vue component, you can access them as follows:

```vue
<template>
    <div>ID: {{ id }}</div>
    <div>Name: {{ props.name }}</div>
    <div>Group: {{ props.group }}</div>
</template>

<script>
export default {
    props: ['id', 'props', 'state'],
    mounted () {
        // runs on load of the widget
        alert(this.id)
    }
}
</script>
```

### Communicating with Node-RED

Events are sent back and forth between Node-RED and Dashboard 2.0 with SocketIO. You can see a full breakdown of these events in our [Events Architecture](../guides/events.md) guide.

#### Receiving Node-RED Messages

When your node receives a `msg` in Node-RED, the Dashboard 2.0 client will receive a `msg-input` event via SocketIO. You can subscribe to this event within your own widget's Vue component with:

```js
export default {
    props: ['id', 'props', 'state'],
    // rest of your vue component here
    mounted () {
        this.$socket.on('msg-input' + this.id, (msg) => {
            // do something with the msg
        })
    },
    unmounted () {
        // unsubscribe from the event when the widget is destroyed
        this.$socket.off('msg-input:' + this.id)
    
    }
}
```

It is recommended to use our in built [Data Tracker](../widgets/core-widgets.md#data-tracker) to setup the standard input/load events for your widget. This can be done by calling the following in your widget's `.vue` file:

```js
export default {
    inject: ['$dataTracker'],
    // rest of your vue component here
    created () {
        this.$dataTracker(this.id)
        // we can override the default events if we want to with
        // this.$dataTracker(this.id, myOnInputFunction, myOnLoadFunction, myOnDynamicPropertiesFunction)
    }
}
```

More details on customisation of the Data Tracker can be found [here](../widgets/core-widgets.md#custom-behaviours). 


#### Sending Node-RED Messages

You can send a `msg` on to any connected nodes in Node-RED by calling one of the following events via SocketIO:

- `this.$socket.emit('widget-action', this.id, msg)`: sends any `msg` onto any connected nodes in Node-RED.
- `this.$socket.emit('widget-change', this.id, msg)`: the same as `widget-action`, but _also_ stores that latest message in the Node-RED datastore for this widget so that state can be restored when the Dashboard is refreshed.

#### Custom SocketIO Events

If you would like to implement your own SocketIO events and handlers, you can do so in your `.vue` component with:

```js
this.$socket.emit('my-custom-event', this.id, msg)
```

Then, where you register your node with Dashboard on the server-side (inside your node's `.js` file), you can define the relevant event handler:

```js
evts = {
    onSocket: {
        // subscribe to custom events
        'my-custom-event': function (conn, id, msg) {
            // emit a msg in Node-RED from this node
            node.send(msg)
        }
    }
}
group.register(node, config, evts)
```

### Data Retention & Data Stores

We use the concept of data stores on both the client and server side of Dashboard 2.0. These are used to centralise storage of the latest state and data associated to a widget.

Data stores are a mapping of the widget/node's ID to the latest data received into that widget. This is most commonly used to restore state when the Dashboard is refreshed.


#### Node-RED Data Store

Node-RED's data store is made accessible for third-party widgets via the associated `ui-base`.

To access this in your widget's `.js` file, you can use:

```js
const group = RED.nodes.getNode(config.group)
const base = group.getBase()
```

Then, whenever you want to store data in the datastore, you can do so with:

```js
base.stores.data.save(base, node, msg)
```

You can read more about the Node-RED data store in our [State Management](../guides/state-management.md) guide.

#### Node-RED State Store

State refers to any properties of your widget that have changed in runtime, and would differ from that set in the Node-RED editor.

For example, the `ui-dropdown` can have it's `options` overriden with a `msg.options` message sent to the node. This updates `options` would be stored against the node in the state store.

#### Client-Side Data Store

In Dashboard 2.0's client-side, we use VueX to manage the centralised state of a UI.

With VueX you can call `mapState` which will automatically bind the store to your Vue component, e.g:

```vue
<template>
    <!-- Retrieve the latest data values from widget with <id> -->
    {{ messages[id] }}
</template>
<script>
// import mapState from VueX
import { mapState } from 'vuex'

export default {
    props: ['id', 'props', 'state'],
    // ... rest of your component here
    computed: {// map the store's messages to our own Vue component
        ...mapState('data', ['messages'])
    },
    mounted () {
        // alerts the most recent message on load of the widget
        alert(this.messages[this.id])
    }
}
</script>
```

Then, to add data to the store:

```js
this.$store.commit('data/bind', {
    widgetId: this.id,
    msg
})
```

#### Loading State

When Dashboard 2.0 loads, it will send a `widget-load` event to all widgets in the Dashboard. This will contain the latest value from the Node-RED datastore. You can subscribe to this event in your widget with:

```js
export default {
    props: ['id', 'props', 'state'],
    // rest of your component here
    mounted () {
        this.$socket.on('widget-load' + this.id, (msg) => {
            // do something with the msg
        })
    },
    unmounted () {
        // unsubscribe from the event when the widget is destroyed
        this.$socket.off('widget-load:' + this.id)
    
    }
}
```


### Styling with Vuetify & CSS

We can define our own CSS within the widget's repository, importing them into a `.vue` component as follows:

```vue
<style scoped>
.ui-example-wrapper {
    padding: 10px;
    margin: 10px;
    border: 1px solid black;
}
</style>
```

Vuetify also comes with a handful of utility classes to assist with styling, which can all be used out of the box:

- [Responsive Displays](https://vuetifyjs.com/en/styles/display/#display)
- [Flex](https://vuetifyjs.com/en/styles/flex/)
- [Spacing](https://vuetifyjs.com/en/styles/spacing/#how-it-works)
- [Text & Typography](https://vuetifyjs.com/en/styles/text-and-typography/#typography)



### External Dependencies

Your widget can have any number of `npm` dependencies. These will all be bundled into the `.umd.js` file that Dashboard loads at runtime.

In `ui-example` we have a dependency on `to-title-case`, which we import into, and use in, our Vue component as follows:

```js
import toTitleCase from 'to-title-case'

export default {
    // rest of component here
    computed: {
        titleCase () {
            return toTitleCase(this.input.title)
        }
    }
}
```

You can also load in other Vue components from within your own repository as with any VueJS component.
