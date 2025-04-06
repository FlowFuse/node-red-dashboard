---
description: Master state management in Node-RED Dashboard 2.0 for maintaining a responsive and dynamic user interface.
---

# State Management

Dashboard 2.0 provides a data store within Node-RED such that it's possible to refresh your Dashboard clients and data is retained. This is particularly useful for widgets like `ui-chart` where you may want to retain a history of data points, or for widgets like `ui-text` where you want to retain the last value displayed.

This page details the different "stores" we have in place and what they're used for.

You can also check out the [Events Architecture](./events.md) for a more detailed look at when these stores are used and how they interact with the rest of the Dashboard.

## Client-Side (Dashboard)

![An image depicting the three client-side vuex stores we have in Dashboard 2.0](../../assets/images/stores-client-side.jpg){data-zoomable}
*An image depicting the three client-side vuex stores we have in Dashboard 2.0*

Our client-side stores are built using [VueX](https://vuex.vuejs.org/). These stores lose their data on a client refresh (but are re-populated by the server-side stores), and are just used to maintain a centralised, consistent view of the data across the entire Vue application as the user navigates around the Dashboard.

### `setup` store

This just stores the response from our initial `/_setup` request. This object, in core, contains the SocketIO configuration to help the client connect to the server. 

It is also possible for plugins to append to this object (see [Adding Plugins](../plugins/#index-js)) additional data that can be useful across the application.

### `ui` store

This store is where we store the full [ui-config](./events#ui-config) that details all of the pages, themes, groups and widgets to render on a Dashboard.

### `data` store

The client-side datastore is a map of widget id's to either:

- The last `msg` received by the widget
- An array of `msg` objects, representing all known `msg` objects received by the widget

In most cases, a widget only needs reference to the _last_ message. In some cases, e.g. `ui-chart`, the full history is required in order to render a history of data.

When a widget is first loaded, we emit a `widget-load` event, which in the default `onLoad` handler, will attempt to retrieve the last message received by the widget from the server-side datastore, and store it in the client-side `data` store. You can read more about this in [Events Architecture](./events.md).

It is possible for a widget to access the mapped `msg` object using:

```vue
<template>
    <pre>this.messages[this.id]</pre>
</template>
<script>
export default {
    computed: {
        ...mapState('data', ['messages'])
    }
}
</script>
```
_An example Widget.vue file that uses the `data` store to access the last message received by the widget_

This value is also updated automatically when a new message is received, as long as that widget is using the default handlers, again detailed in [Events Architecture](./events.md).


## Server-Side (Node-RED)

![An image depicting the two server-side vuex stores we have in Dashboard 2.0](../../assets/images/stores-server-side.jpg){data-zoomable}
*An image depicting the two server-side stores we have in Dashboard 2.0*

Our server-side stores maintain the "single source of truth". When any Dashboard client connects, the centralised data is sent to each client, and the client-side stores are populated with the relevant parts of this centralised store.

In our server-side architecture, we use two standalone stores:

- `datastore`: A map of each widget to the latest `msg` received by a respective node in the Editor.
- `statestore`: A store for all dynamic properties set on widgets (e.g. visibility or setting a property at runtime). Often, these values are overrides of the base configuration found in the `datastore`.

Each time a function server-side wants to write into these stores, a check is done to ensure that any provided messages are permitted to be stored. An example of where this would get blocked is if `msg._client.socketid` is specified and the relevant node type is setup to listen to socket constraints (by default, this is `ui-control` and `ui-notification`). In this case, we do not want to store that data in our centralised store since it's not relevant to _all_ users of the Dashboard.


### Importing Stores

Stores are imported into a node's `.js` file with:

```js
const store = require('<path>/<to>/store.js')
```

### Data Store

The server-side `datastore` is a centralised store for all messages received by widgets in the Editor. It is a simple key-value store, where the key is the widget's id, and the value is the message received by the widget. In some cases, e.g. `ui-chart` instead of recording _just_ the latest `msg` received, we actually store a history.

#### `datastore.save`

When a widget receives a message, the default `node.on('input')` handler will store the received message, mapped to the widget's id into the datastore using:

```js
datastore.save(base, node, msg)
```

- `base`: The `ui_base` node that the store is attached to
- `node`: The Node-RED node object we're storing state for
- `msg`: The message that was received by the node

This will store the latest message received by the widget, which can be retrieved by that same widget on load using:

#### `datastore.get`

When a widget is initialised, it will attempt to retrieve the latest message from the datastore using:

```js
datastore.get(node.id)
```

This ensures, on refresh of the client, or when new clients connect after data has been generated, that the state is presented consistently.

#### `datastore.append`

With `.append`, we can store multiple messages against the same widget, representing a history of state, rather than a single point reference to the _last_ value only.

```js
datastore.append(base, node, msg)
```

- `base`: The `ui_base` node that the store is attached to
- `node`: The Node-RED node object we're storing state for
- `msg`: The message that was received by the node

This is used in `ui-chart` to store the history of data points, where each data point could have been an individual message received by the widget.

#### `datastore.clear`

When a widget is removed from the Editor, we can clear the datastore of any messages stored against that widget using:

```js
datastore.clear(node.id)
```

This ensures that we don't have any stale data in the datastore, and that we don't have any data stored against widgets that no longer exist in the Editor.

### State Store

The `statestore` is a centralised store for all dynamic properties set against widgets in the Editor. Dynamic Properties can be set through sending `msg.<property>` payloads to a given node, e.g. for ` ui-dropdown`, we can send `msg.options` to override the "Options" property at runtime.

 At the top-level it is key-mapped to the Widget ID's, then each widget has a map, where each key is the property name, mapping to the value.

#### `statestore.getAll`

For a given widget ID, return all dynamic properties that have been set.

```js
statestore.getAll(node.id)
```

#### `statestore.getProperty`

For a given widget ID, return the value of a particular property.

```js
statestore.getProperty(node.id, property)
```

#### `statestore.set`

Given a widget ID and property, store the associated value in the appropriate mapping

```js
statestore.set(base, node, msg, property, value)
```

- `base`: The `ui_base` node that the store is attached to
- `node`: The Node-RED node object we're storing state for
- `msg`: The message that was received by the node
- `property`: The property name to store
- `value`: The value to store against the property

#### `statestore.reset`

Remove all dynamic properties for a given Widget/Node.

```js
statestore.reset(node.id)
```

