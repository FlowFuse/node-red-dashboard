# Event Architecture

An important part of the Dashboard is how Node-RED and the Dashboard communicate. This is achieved using [socket.io](https://socket.io/).

![A flow diagram depicting how events flow between Node-RED and the Dashboard](../../assets/images/events-architecture.png){data-zoomable}
*A flow diagram depicting how events flow between Node-RED (red) and the Dashboard (blue)*

## Events List

This is a comprehensive list of all events that are sent between Node-RED and the Dashboard via socket.io.

### `ui-config`
- Payload: `object{ dashboards, theme, pages, groups, widgets }`

Used to transport dashboard/theme/page/groups/[widget](#widget) layout data, each mapped by their respective id's.

### `msg-input:<node-id>`
- Payload: `<msg>`

Sent from NR to UI when a msg input is received into a Dashboard node.

### `widget-load`
- ID: `<node-id>`
- Payload: `none`

Sent from UI to NR when the UI/widget is first loaded. Gives a chance for NR to provide the widget with any known existing values.

### `widget-change`
- ID: `<node-id>`
- Payload: `<value>` - typically the payload data to be sent in the msg

Sent from UI to NR when the value of a widget is changed from the UI, e.g. text input, slider. Assumes the value emitted is the `msg.payload`.

This takes hte previously received msg, and merges it with the newly received value, for example if the msg was:

```json
{
    "payload": 30,
    "topic": "on-change"
}
```

and the `widget-change` received a new value of `40`, then the newly emitted message would be:

```json
{
    "payload": 40,
    "topic": "on-change"
}
```

Any value received here will also be stored against the widget in the datastore.

### `widget-action`
- ID: `<node-id>`
- Payload: `<msg>`

Sent from UI to NR when a widget is actioned, e.g. click of a button or upload of a file.

### `widget-send`
- ID: `<node-id>`
- Payload: `<msg>`

Generally used by `ui-template`. This event is wrapped by the Template's `send(msg)` function which allows users to define their own full `msg` objects to be emitted by a `ui-template` node. If a non-Object value is sent, then Dashboard will automatically wrap that into a `msg.payload` object, e.g:

```js
send(10)
```

will result in a `msg` object of:

```json
{
    "payload": 10 
}
```

Similiarly, is instead an object is specified:

```js
send({ myVar: 10, topic: "my-topic" })
```

then the `msg` object will be:

```json
{
    "myVar": 10,
    "topic": "my-topic"
}
```

Any `msg` emitted using this fucntion is also stored in the datastore associated with the widget.

## Event Payloads

This details some of the object structures used to send data cross the socket io connections between Node-RED and Dashboard.

### `Widget`

Within the `ui-config`, the `widgets` property is an array of `Widget` objects. Each `Widget` object has the following properties:

- **id**: The id assigned by Node-RED to uniquely identify that node in the editor
- **props**: The collection of properties that the user can define within the Editor for that node
- **component** - The respective Vue component required for rendering, added front-end (in App.vue)
- **state** - Contains value defining the visual and interactive "state" of a widget, e.g. `enabled: true` or `visible: false` (`visible: ` not yet supported)
