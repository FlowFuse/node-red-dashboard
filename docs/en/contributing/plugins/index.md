---
description: Guide to building custom plugins for FlowFuse Dashboard, enhancing its capabilities with your functionality.
---

<script setup>
    import AddedIn from '../../../components/AddedIn.vue';
</script>

# Building Dashboard Plugins <AddedIn version="0.11.0"/>

Node-RED supports the development of custom plugins that add behaviour and functionality to the Node-RED runtime. A really common use case of plugins is [custom Node-RED Themes](https://nodered.org/docs/api/ui/themes/), which modify the overall CSS/appearance of the underlying Node-RED Editor.

FlowFuse Dashboard also supports plugins. This allows you to define custom behaviour for the Dashboard runtime, independent of particular nodes and widgets. Currently, we provide a collection of [API hooks](#index-js) that allow the injection of code at various points in the Dashboard instantiation and runtime.

To integrate, make sure your Node-RED plugin is registered with `"type": "node-red-dashboard-2"` in the `package.json` file. This will tell Node-RED that this is a FlowFuse Dashboard plugin.

_Note: Plugins differ from [Third Party Widgets](../widgets/third-party.md). Third Party Widgets are built as nodes that become available in the Node-RED Editor, and can be dragged onto the Dashboard. Plugins are built to modify the behaviour of the Dashboard runtime itself._

## Authentication Plugins <AddedIn version="1.10.0"/>

One of the most common use cases for Dashboard plugins is to add user data to messages emitted by Dashboard. They utilise an existing authentication framework established on the Node-RED server, and inject user data into the `msg._client` object that is sent to the Node-RED flow.

### Configuration

The Dashboard 2.0 sidebar will list any plugins in the "Client Data" tab that have declared `auth: true` in their `index.html` file. This is required if a plugin is appending/modifying data in the `msg._client` object.

![Screenshot of an example "Client Data" tab](/images/dashboard-sidebar-clientdata.png)
_Screenshot of an example "Client Data" tab_

In the above screenshot we can see that the core Dashboard code appends the "Socket ID" data, and we are also running with the FlowFuse Authentication plugin which appends any information about a logged in FlowFuse user when using the dashboard.

## Plugin Structure

Let's take a quick example to give an overview of the structure of a Dashboard plugin:

### package.json

```json
{
    "name": "node-red-dashboard-2-<plugin-name>",
    "version": "<x.y.z>",
    "description": "<describe your plugin>",
    "main": "index.js",
    "scripts": {
        "test": "<run your tests here>"
    },
    "author": {
        "name": "<your name>",
        "url": "<your website/gh profile>"
    },
    "node-red": {
        "plugins": {
            "node-red-dashboard-2-<plugin-name>": "index.js"
        }
    },
    "license": "Apache-2.0"
}
```

### index.html

This defines any client/editor plugins. This allows for definition of Node-RED Editor features such as injecting content into the Dashboard 2.0 sidebar, or whether any runtime plugins are appending authentication/client data to messages.

 ```html
 <script type="text/javascript">
    RED.plugins.registerPlugin('node-red-dashboard-2-<plugin-name>', {
        type: 'node-red-dashboard-2',
        tabs: [
            {
                id: 'my-tab-id',
                label: 'My Tab',
                /**
                 * Runs when tabs are first created
                 * @param {object} base - ui-base node for which this sidebar represents
                 * @param {object} parent - DOM element to append content to
                 */
                init (base, parent) {
                    // add some content to the tab
                }
            }
        ],
        auth: true/false, // Declares to Dashboard 2.0 whether this should list in the "Client Data" tab
        description: '', // If "auth: true", this is used in the "Client Data" tab of the Dashboard Sidebar
    })
</script>
 ```

### index.js

A plugin's `js` file will define runtime behaviours for the FlowFuse Dashboard. This is where you will define your hooks, and any other code that you want to run when the FlowFuse Dashboard is instantiated, or messages are sent back and forth between the Dashboard and Node-RED.

```js
module.exports = function(RED) {
    RED.plugins.registerPlugin("node-red-dashboard-2-<plugin-name>", {

        // Tells Node-RED this is a FlowFuse Dashboard plugin
        type: "node-red-dashboard-2",

        // hooks - a collection of functions that will inject into FlowFuse Dashboard
        hooks: {
            /**
             * onSetup - called when the FlowFuse Dashboard is instantiated
             * @param {object} RED - Node-RED runtime
             * @param {object} config - UI Base Node Configuration
             * @param {object} req - ExpressJS request object
             * @param {object} res - ExpressJS response object
             * @returns {object} - Setup object passed to the Client
             */ 
            onSetup: (RED, config, req, res) => {
                return {
                    // must ALWAYS return socketio.path if using this hook
                    socketio: {
                        path: `${config.path}/socketio`, 
                    }
                }
            },
            /**
             * onEmitConfig - called when the UI configuration is about to be sent to a client
             * @param {object} socket - SocketIO connection object to the client
             * @param {object} config - The UI configuration object that will be sent
             * @param {object} msg - A msg object, populated with connection credentials by `addConnectionCredentials`
             * @returns {object} - The (potentially modified) UI configuration object
             */
            onEmitConfig: (socket, config, msg) => {
                // modify config in any way you like
                // e.g. config.myCustomProperty = "Hello World"
                // You can also use data from msg, e.g. msg._client.socketIp
                return config
            },
            /**
             * onInput - called when a node receives a message
             * @param {object} msg - Node-RED msg object
             * @returns {object} - Returns Node-RED msg object
             */ 
            onInput: (msg) => {
                // modify msg in anyway you like
                return msg
            },
            /**
             * onAction - called when a D2.0 widget emits the `widget-action` event via SocketIO
             * @param {object} conn - SocketIO connection object
             * @param {object} id - Unique Node/Widget ID
             * @param {object} msg - Node-RED msg object
             * @returns {object} - Returns Node-RED msg object
             */ 
            onAction: (conn, id, msg) => {
                // modify msg in anyway you like
                msg.myField = "Hello World"
                return msg
            },
            /**
             * onChange - called when a D2.0 widget emits the `widget-change` event via SocketIO
             * @param {object} conn - SocketIO connection object
             * @param {object} id - Unique Node/Widget ID
             * @param {object} msg - Node-RED msg object
             * @returns {object} - Returns Node-RED msg object
             */ 
            onChange: (conn, id, msg) => {
                // modify msg in anyway you like
                msg.myField = "Hello World"
                return msg
            },
            /**
             * onLoad - called when a D2.0 widget emits the `widget-load` event via SocketIO
             * @param {object} conn - SocketIO connection object
             * @param {object} id - Unique Node/Widget ID
             * @param {object} msg - Node-RED msg object
             * @returns {object} - Returns Node-RED msg object
             */ 
            onLoad: (conn, id, msg) => {
                // modify msg in anyway you like
                msg.myField = "Hello World"
                return msg
            },
            /**
             * onAddConnectionCredentials - called when a D2.0 is about to send a message in Node-RED
             * @param {object} conn - SocketIO connection object
             * @param {object} msg - Node-RED msg object
             * @returns {object} - Returns Node-RED msg object
             */ 
            onAddConnectionCredentials: (conn, msg) => {
                // modify msg in anyway you like
                msg._client.socketIp = conn.request.socket.remoteAddress
                return msg
            },
            /**
             * onIsValidConnection - Checks whether, given a msg structure and Socket connection,
             * any _client data specified allows for this message to be sent, e.g.
             * if the msg._client.socketid is the same as the connection's ID
             * @param {object} conn - SocketIO connection object
             * @param {object} msg - Node-RED msg object
             * @returns {boolean} - Is a valid connection or not
             */ 
            onIsValidConnection: (conn, msg) => {
                if (msg._client?.socketId) {
                    // if socketId is specified, check that it matches the connection's ID
                    return msg._client.socketId === conn.id
                }
                // if no specifics provided, then allow the message to be sent
                return true
            },
            /**
             * onCanSaveInStore - Checks whether, given a msg structure, the msg can be saved in the store
             * Saving into a store is generally a bad idea if we're dealing with messages only intended for
             * particular clients (e.g. a msg._client.socketId is specified)
             * @param {object} msg - Node-RED msg object
             * @returns {boolean} - Is okay to store this, or not
             */
            onCanSaveInStore: (msg) => {
                if (msg._client?.socketId) {
                    // if socketId is specified, then don't save in store
                    return false
                }
                return true
            },

        }
    })
 }
 ```

 If any of `onInput`, `onAction`, `onChange` or `onLoad` return `null`, then the `msg` will abruptly stop there, and not be sent on any further in the flow.