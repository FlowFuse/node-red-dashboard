# Widget Registration

Every `ui-base`, `ui-page` and `ui-group` has a `.register` function. The core registration function can be found in `ui-base`.

This function is used by all of the widgets to inform Dashboard of their existence, and allows the widget to define which group/page/ui it belongs too, along with the relevant properties that widget has and any event handlers (e.g. `onInput` or `onAction`).

The function is called within the node's Node-RED `.js` file, and in th case of a widget registering as part of a group (the most common use case), wuld look something like this:

```js
module.exports = function (RED) {
    function MyNode (config) {
        // create node in Node-RED
        RED.nodes.createNode(this, config)
        // store reference to our Node-RED node
        const node = this

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        // an object detailing the events to subscribe to
        const evts = {}

        // inform the dashboard UI that we are adding this node
        group.register(node, config, evts)
    }

    RED.nodes.registerType('ui-mywidget', MyNode)
}
```

## Arguments

The regostration function inputs differ slightly depending on whether being called on the `ui-group`, `ui-page` or `ui-base`, but they all have 3 inputs in common:

### `node`

This is the `this` of your node's constructor, and can be used directly from the value provided from Node-RED.

### `config`

This is made available by Node-RED as the input to the constructor, and can generally passed straight into the `.register` function without modification, it will be an object that maps all of the properties and values that have been described in the node's `.html` definition.

### `evts`

We expose a range of different event handlers as part of the `register` function. All of these handlers run server (Node-RED) side. In some cases, it is possible to define full functions (that will run at the appropriate point in the event lifecycle), in other occassions, it's only possible to define a `true`/`false` value that informs Dashboard that you wish for the widget to send or subscribe to that event.

A full breakdown of the event lifecycle can be found [here](../../contributing/guides/events.md).

```js
const evts = {
    onAction:   // boolean
    onChange:   // boolean || function
    beforeSend: // function
    onInput:    // function
    onError:    // function
    onSocket    // object
}
```

## Events

### `.onAction` (`boolean`)

When set as `true`, this flag will trigger the default handler when the Dashboard widgets sends an `widget-action` event.

1. Assigns the provided value to `msg.payload`
2. Appends any `msg.topic` defined on the node config
3. Runs `evts.beforeSend()` _(if provided)_
4. Sends the `msg` onwards to any connected nodes using `node.send(msg)`

An example of this is with `ui-button`, where the widget's `UIButton` contains an `@click` function, containing:

```js
this.$socket.emit('widget-action', this.id, msg)
```

This sends a message via SocketIO to Node-RED, with the topic of the widget's ID. Because the `ui-button` has `onAction: true` in it's registration, it will consequently run the default handler detailed above.

### `.onChange` (`boolean` || `function`)

Similar to `onAction`, when used as a boolean, this flag will trigger the default handler for an `onChange` event. 

#### Default `onChange` Handler

1. Assigns the provided value to `msg.payload`
2. Appends any `msg.topic` defined on the node config
3. Runs `evts.beforeSend()` _(if provided)_
4. Store the most recent message on the widget under the `._msg` property which will contain the latest state/value of the widget
5. Sends the `msg` onwards to any connected nodes

#### Custom `onChange` Handler

Alternatively, you can override this default behaviour by providing a custom `onChange` function. An example of this is in the `ui-switch` node which needs to do `node.status` updates to in order for the Node-RED Editor to reflect it's latest status:

```js
onChange: async function (value) {
    // ensure we have latest instance of the widget's node
    const wNode = RED.nodes.getNode(node.id)
    const msg = wNode._msg || {}

    node.status({
        fill: value ? 'green' : 'red',
        shape: 'ring',
        text: value ? states[1] : states[0]
    })

    // retrieve the assigned on/off value
    const on = RED.util.evaluateNodeProperty(config.onvalue, config.onvalueType, wNode)
    const off = RED.util.evaluateNodeProperty(config.offvalue, config.offvalueType, wNode)
    msg.payload = value ? on : off

    wNode._msg = msg

    // simulate Node-RED node receiving an input
    wNode.send(msg)
}
```

### `.beforeSend(msg)` (`function`)

This middleware function will run before the node sends any `msg` to consequent nodes connected in the Editor (e.g. in `onInput`, `onAction` and `onChange` default handlers). 

The function must take `msg` as an input, and also return `msg` as an output.

In `ui-button`, we use `beforeSend` evaluate the `msg.payload` as we have a `TypedInput` ([docs](https://nodered.org/docs/api/ui/typedInput/). The `TypedInput` needs evaluating within Node-RED, as it can reference variables outside of the domain of the button's node (e.g. `global` or `flow`). The default `onInput` handler then takes the output from our `beforeSend` and processes it accordingly.

### `.onInput(msg, send)` (`function`)

Defining this function will override the default `onInput` handler. 

#### Default `onInput` Handler

1. Store the most recent message on the widget under the `node._msg`
2. Appends any `msg.topic` defined on the node config
3. Checks if the widget has a `passthru` property:
    - If no `passthru` proeprty is found, runs `send(msg)`
    - If the property is present, `send(msg)` is only run if `passthru` is set to `true`

#### Custom `onInput` Handler

When provided, this will override the default handler. We use this in the core widgets in Dashboard with `ui-chart`, where we want to be storing the history of recent `msg` value, rather than _just_ the most recent value as done in the default handler. We also use it here to ensure we don't have too many data points (as defined in the `ui-chart` config).

### `.onError(err)` (`function`)

This function is called within the handlers for `onAction`, `onChange` and `onInput`. If there is ever an issue with these handlers (including those custom handlers provided), then the `onError` function will be called.

### `.onSocket` (`object`)

This is a somewhat unique event handler, that is only used by externally developed widgets (i.e. not part of core Dashboard widgets detailed in this documentation). It is provided so that developers can `emit`, and consequently subscribe to, custom SocketIO events that are transmitted by their custom widgets.

You can see a more detailed example in our documentation [here](../widgets/third-party.md#custom-socketio-events).

The general structure of `onSocket` is as follows:

```js
const evts = {
    onSocket: {
        'my-custom-event': function (id, msg) {
            console.log('my-custom-event', id, msg)
        }
    }
}
```

Note that these events are emitted from the Dashboard, and so, these handlers are run within Node-RED.