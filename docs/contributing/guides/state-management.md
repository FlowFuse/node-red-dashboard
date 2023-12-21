# State Management

Dashboard 2.0 conducts state management through the use of a shared server-side data store. 

Stores are imported into a node's `.js` file with:

```js
const store = require('<path>/<to>/store.js')
```

In our architecture, we use two standalone stores:

- `datastore`: A store for the latest `msg` received by a widget in the Editor.
- `statestore`: A store for all dynamic properties set against widgets in the Editor.

Each store will run checks to ensure that any provided messages are permitted to be stored. An example of where this would get blocked is if `msg._client.socketid` is specified and the relevant node type is setup to listen to socket constraints (by default, this is `ui-control` and `ui-notification`).

## Data Store

The server-side `datastore` is a centralised store for all messages received by widgets in the Editor. It is a simple key-value store, where the key is the widget's id, and the value is the message received by the widget. In some cases, e.g. `ui-chart` instead of recording _just_ the latest `msg` received, we actually store a history.

### `datastore.save`

When a widget receives a message, the default `node.on('input')` handler will store the received message, mapped to the widget's id into the datastore using:

```js
datastore.save(base, node, msg)
```

- `base`: The `ui_base` node that the store is attached to
- `node`: The Node-RED node object we're storing state for
- `msg`: The message that was received by the node

This will store the latest message received by the widget, which can be retrieved by that same widget on load using:

### `datastore.get`

When a widget is initialised, it will attempt to retrieve the latest message from the datastore using:

```js
datastore.get(node.id)
```

This ensures, on refresh of the client, or when new clients connect after data has been geenrated, that the state is presented consistently.

### `datastore.append`

With `.append`, we can store multiple messages against the same widget, representing a history of state, rather than a single point reference to the _last_ value only.

```js
datastore.append(base, node, msg)
```

- `base`: The `ui_base` node that the store is attached to
- `node`: The Node-RED node object we're storing state for
- `msg`: The message that was received by the node

This is used in `ui-chart` to store the history of data points, where each data point could have been an individual message received by the widget.

### `datastore.clear`

When a widget is removed from the Editor, we can clear the datastore of any messages stored against that widget using:

```js
datastore.clear(node.id)
```

This ensures that we don't have any stale data in the datastore, and that we don't have any data stored against widgets that no longer exist in the Editor.

## State Store

The `statestore` is a centralised store for all dynamic properties set against widgets in the Editor. Dynamic Properties can be set through sending `msg.<proprrty>` payloads to a given node, e.g. for ` ui-dropdown`, we can send `msg.options` to override the "Options" property at runtime.

 At the top-level it is key-mapped to the Widget ID's, then each widget has a map, where each key is the property name, mapping to the value.

### `statestore.getAll`

For a given widget ID, return all dynamic properties that have been set.

```js
statestore.getAll(node.id)
```

### `statestore.getProperty`

For a given widget ID, return the value of a particular property.

```js
statestore.getProperty(node.id, property)
```

### `statestore.set`

Given a widget ID and property, store the associated value in the appropriate mapping

```js
statestore.set(base, node, msg, property, value)
```

- `base`: The `ui_base` node that the store is attached to
- `node`: The Node-RED node object we're storing state for
- `msg`: The message that was received by the node
- `property`: The property name to store
- `value`: The value to store against the property

### `statestore.reset`

Remove all dynamic properties for a given Widget/Node.

```js
statestore.reset(node.id)
```

