---
description: Step-by-step guide on adding new core widgets to FlowFuse Dashboard to expand its interactive features.
---

# Adding New Core Widgets

A single widget consist of two key parts:

1. A Node-RED node that will appear in the palette of the Node-RED Editor
2. `.vue` and client-side code that renders the widget into a dashboard
 
You can explore our collection of core widgets [here](../../nodes/widgets.md).

We are always open to Pull Requests and new ideas on widgets that can be added to the core Dashboard repository.

When adding a new widget to the core collection, you will need to follow the steps below to ensure that the widget is available in the Node-RED editor and renders correctly in the UI.

## Recommended Reading

On the left-side navigation you'll find a "Useful Guides" section, we recommend taking a look through these as they give a good overview of the structure of the FlowFuse Dashboard codebase and some of the underlying architectural principles it is built upon.

In particular, the following are recommended:

- [Events Architecture](/contributing/guides/state-management.html)
- [State Management](/contributing/guides/state-management.html)

## Checklist

When adding a new widget to FlowFuse Dashboard, you'll need to ensure that the following steps have been followed for that new widget to be recognised and included in a FlowFuse Dashboard build:

1. In `/nodes/`:
    - Add `<widget>.html`
    - Add `<widget>.js`
    - Add the reference to the `node-red/nodes` section in `package.json`
2. In `/ui/`:
    - Add `widgets/<widget>/<widget>.vue`
    - Add widget to the `index.js` file in `/ui/widgets`

## Example <widget.vue>

```vue
<template>
    <div @click="onAction">
        {{ id }}
    </div>
</template>

<script>
    import { useDataTracker } from '../data-tracker.js'
    import { mapState } from 'vuex'

    export default {
        name: 'DBUIWidget',
        // we need to inject $socket so that we can send events to Node-RED
        inject: ['$socket', '$dataTracker'],
        props: {
            id: String,    // the id of the widget, as defined by Node-RED
            props: Object, // the properties for this widget defined in the Node-RED editor
            state: Object  // the state of this widget, e.g. enabled, visible
        },
        computed: {
            // map our data store such that we can get any data bound to this widget
            // received on input from Node-RED
            ...mapState('data', ['messages']), // provides access to `this.messages` where `this.messages[this.id]` is the stored msg for this widget
        },
        created () {
            // setup the widget with default onInput, onLoad and onDynamicProperties handlers
            this.$dataTracker(this.id)
        },
        methods: {
            onAction () {
                // we can send any data we need Node-RED through this (optional) message parameter
                const msg = {
                    payload: 'hello world'
                }
                // send an event to Node-RED to inform it that we've clicked this widget
                this.$socket.emit('widget-action', this.id, msg)
            }
        }
    }
</script>
  
<style scoped>
</style>
```

## Data Tracker

The data tracker is a globally available utility service that helps setup the standard event handlers for widgets.

### Usage

The data tracker is globally available across existing widgets and can be accessed using `this.$dataTracker(...)`.

The most simple usage of the tracker would be:

```js
...
created () {
    this.$dataTracker(this.id)
},
...
```

This will setup the following events:

- `on('widget-load')` - Ensures we save any received `msg` objects when a widget is first loaded into the Dashboard.
- `on('msg-input')` - Default behavior checks for any dynamic properties (e.g. visibility, disabled state) and also stores the incoming `msg` in the Vuex store

### Custom Behaviours

It also provides flexibility to define custom event handlers for a given widget, for example in a `ui-chart` node, we have a logic that handles the merging of data points and the rendering of the chart when a message is received.

The inputs for the `this.$dataTracker(widgetId, onInput, onLoad, onDynamicProperties)` function are used as follows:

- `widgetId` - the unique ID of the widget
- `onInput` - a function that will be called when a message is received from Node-RED through the `on(msg-input)` socket handler
- `onLoad` - a function that will be called when the widget is loaded, and triggered by the `widget-load` event
- `onDynamicProperties` - a function called as part of the `on(msg-input)` event, and is triggered _before_ the default `onInput` function. This is a good entry point to check against any properties that have been included in the `msg` in order to set a dynamic property (i.e. content sent into `msg.ui_update...`).


## Dynamic Properties

Node-RED allows for definition of the underlying configuration for a node. For example, a `ui-button` would have properties such as `label`, `color`, `icon`, etc. It is often desired to have these properties be dynamic, meaning that they can be changed at runtime. 

It is a standard practice within FlowFuse Dashboard to support these property updates via a nested `msg.ui_update` object. As such, users can expect to be able to control these generally by passing in `msg.ui_update.<property-name>` to the node, which in turn, should update the appropriate property.

### Design Pattern

This section will outline the architectural design pattern for developing dynamic properties into a widget.

Server-side, dynamic properties are stored in our `state` store, which is a mapping of the widget ID to the dynamic properties assigned to that widget. This is done so that we can ensure separation of the dynamic properties for a widget from the initial configuration defined, and stored, in Node-RED.

Before the `ui-base` node emits the `ui-config` event and payload, we merge the dynamic properties with the initial configuration, with the dynamic properties permitted to override the underlying configuration. As such, when the client receives a `ui-config` message, it will have the most up-to-date configuration for the widget, wth the merging of both static and dynamic properties.

### Setting Dynamic Properties

#### Server-Side

In order to set a dynamic property in the server-side `state` store we can utilise the `beforeSend` event on the node. This event is triggered on any occasion that the server-side node is about to send a message to the client, including when a new input is received into a given node.

For this, we make the most of the state store's `set` function:

```js
/**
    *
    * @param {*} base  - associated ui-base node
    * @param {*} node  - the Node-RED node object we're storing state for
    * @param {*} msg   - the full received msg (allows us to check for credentials/socketid constraints)
    * @param {*} prop  - the property we are setting on the node
    * @param {*} value - the value we are setting
*/
set (base, node, msg, prop, value) {
    if (canSaveInStore(base, node, msg)) {
        if (!state[node.id]) {
            state[node.id] = {}
        }
        state[node.id][prop] = value
    }
},
```

For example, in `ui-dropdown`:

```javascript
const evts = {
    onChange: true,
    beforeSend: function (msg) {
        if (msg.ui_update) {
            const update = msg.ui_update
            if (typeof update.options !== 'undefined') {
                // dynamically set "options" property
                statestore.set(group.getBase(), node, msg, 'options', update.options)
            }
        }
        return msg
    }
}

// inform the dashboard  UI that we are adding this node
group.register(node, config, evts)
```

#### Client Side

Now that we have the server-side state updating, anytime we refresh, the full `ui-config` will already contain the dynamic properties. 

We then need to ensure that the client is aware of these dynamic properties _as they change_. To do this, we can use the `onDynamicProperties` event available in the [data tracker](#data-tracker).

A good pattern to follow is provide a `computed` variable on the component in question. We then provide three helpful, global, functions:

- `setDynamicProperties(config)`: Will assign the provided properties (in `config`) to the widget, in the client-side store. This will automatically update the widget's state, and any references using this property.
- `updateDynamicProperty(property, value)`: Will update the relevant `property` with the provided `value` in the client-side store. Will also ensure the property is not of type `undefined`. This will automatically update the widget's state, and any references using this property.
- `getProperty(property)`: Automatically gets the correct value for the requested property. Will first look in the dynamic properties, and if not found, will default to the static configuration defined in the [`ui-config` event](../guides/events.md#ui-config).

The computed variables can wrap the `this.getProperty` function, which will always be up-to-date with the centralized vuex store.

```js
{
    // ...
    computed: {
        label () {
            return this.getProperty('label')
        }
    },
    created () {
        // we can define a custom onDynamicProperty handler for this widget
        useDataTracker(this.id, null, null, this.onDynamicProperty)
    // ...,
    methods () {
        // ...,
        onDynamicProperty (msg) {
            // standard practice to accept updates via msg.ui_update
            const updates = msg.ui_update
            // use globally available API to update the dynamic property
            this.updateDynamicProperty('label', updates.label)
        }
    }
}

```

### Updating Documentation

There are two important places to ensure documentation is updated when adding dynamic properties:

#### Online Documentation:

Each node will have a corresponding `/docs/nodes/widgets/<node>.md` file which allows for the definition of ` `dynamic` table in the frontmatter, e.g:

```yaml
dynamic:
    Options:
        payload: msg.options
        structure: ["Array<String>", "Array<{value: String}>", "Array<{value: String, label: String}>"]
    Class:
        payload: msg.class
        structure: ["String"]
```

You can then render this table into the documentation with:

```md
## Dynamic Properties

<DynamicPropsTable/>
```

#### Editor Documentation:

Each node will have a corresponding `/locales/<locale>/<node>.html` file which should include a table of dynamic properties, e.g:

```html
<h3>Dynamic Properties (Inputs)</h3>
<p>Any of the following can be appended to a <code>msg.</code> in order to override or set properties on this node at runtime.</p>
<dl class="message-properties">
    <dt class="optional">options <span class="property-type">array</span></dt>
    <dd>
        Change the options available in the dropdown at runtime
        <ul>
            <li><code>Array&lt;string&gt;</code></li>
            <li><code>Array&lt;{value: String}&gt;</code></li>
            <li><code>Array&lt;{value: String, label: String}&gt;</code></li>
        </ul>
    </dd>
    <dt class="optional">class <span class="property-type">string</span></dt>
    <dd>Add a CSS class, or more, to the Button at runtime.</dd>
</dl>
```

### Debugging Dynamic Properties

FlowFuse Dashboard comes with as [Debug View](/contributing/widgets/debugging.html) that includes a [specialist panel](/contributing/widgets/debugging.html#dynamic-properties) to monitor any dynamic properties assigned to a widget. This can be a very useful tool when checking whether the client is aware of any dynamic properties that have been sent.