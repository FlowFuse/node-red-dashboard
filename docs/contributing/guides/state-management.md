# State Management

Dashboard 2.0 conducts state management through the use of a shared server-side data store. It provides four core functions for interaction with the store.

The store can be injected into a widget using:

```js
const datastore = require('<path>/<to>/store/index.js')
```


## `datastore.save`

When a widget receives a message, the default `node.on('input')` handler will store the received message, mapped to the widget's id into the datastore using:

```js
datastore.save(node.id, msg)
```

This will store the latest message received by the widget, which can be retrieved by that same widget on load using:

## `datastore.get`

When a widget is initialised, it will attempt to retrieve the latest message from the datastore using:

```js
datastore.get(node.id)
```

This ensures, on refresh of the client, or when new clients connect after data has been geenrated, that the state is presented consistently.

## `datastore.append`

With `.append`, we can store multiple messages against the same widget, representing a history of state, rather than a single point reference to the _last_ value only.

```js
datastore.append(node.id, msg)
```

This is used in `ui-chart` to store the history of data points, where each data point could have been an individual message received by the widget.

## `datastore.clear`

When a widget is removed from the Editor, we can clear the datastore of any messages stored against that widget using:

```js
datastore.clear(node.id)
```

This ensures that we don't have any stale data in the datastore, and that we don't have any data stored against widgets that no longer exist in the Editor.