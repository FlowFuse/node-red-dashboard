# Building Dashboard Plugins

Node-RED supports the development of custom plugins that add behaviour and functionality to the Node-RED runtime. A really common use case of plugins is [custom Node-RED Themes](https://nodered.org/docs/api/ui/themes/), which modify the overall CSS/appearance of the underlying Node-RED Editor.

Node-RED Dashboard 2.0 also supports plugins. This allows you to define custom behaviour for the Dashboard runtime. For now, we provide a collection of API hooks that allow the injection of code at various points in the Dashboard instantiation and runtime.

To integrate, make sure your plugins are registered with `"type": "node-red-dashboard-2"` in the `package.json` file. This will tell Node-RED that this is a Dashboard 2.0 plugin.

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


### index.js

```js
module.exports = function(RED) {
    RED.plugins.registerPlugin("node-red-dashboard-2-<plugin-name>", {

        // Tells Node-RED this is a Node-RED Dashboard 2.0 plugin
        type: "node-red-dashboard-2",

        // hooks - a collection of functions that will inject into Dashboard 2.0
        hooks: {
            /**
             * onSetup - called when the Dashboard 2.0 is instantiated
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
            }
        }
    })
 }
 ```

 If any of `onAction`, `onChange` or `onLoad` return `null`, then the `msg` will abruptly stop there, and not be sent on any further in the flow.