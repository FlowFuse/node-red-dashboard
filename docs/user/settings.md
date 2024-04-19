---
description: Customize your Node-RED Dashboard 2.0 experience with detailed settings for optimal dashboard performance and appearance.
---

# Settings

Whilst most dashboard configuration is done within the Node-RED editor, some settings
can be provided in the [Node-RED runtime settings file](https://nodered.org/docs/user-guide/runtime/settings-file).

The `settings.js` file is typically located in the `~/.node-red` directory. If you
are not sure where that is, you can also check the log output of Node-RED when it starts.
For example:

```
12 Sep 13:31:37 - [info] Settings file  : /Users/nol/.node-red/settings.js
```

The file is structured as a JavaScript module:

```js
module.exports = {
    // Lots of settings...
}
```

Node-RED Dashboard 2.0 looks for a property called `dashboard` within the settings object.
If it doesn't find one, it looks for a property called `ui` - this is the settings object
used by the original Node-RED Dashboard. This eases the migration between the two dashboard
versions.

Edit the `settings.js` file and add a `dashboard` property inside the `module.exports` object.
This needs to be separated from any other setting with a comma:

```js
dashboard: {

}
```

You can then add Dashboard specific settings inside that property. The available
settings are described below.

Whenever you make any changes to the `settings.js` file, you will need to restart
Node-RED to load those changes.

### Dashboard Settings

The following settings are available.

#### `middleware`

This adds a custom [Express](https://expressjs.com/) middleware in front of the dashboard.
This can be used to apply custom authentication, logging or any other type of processing
ahead of any request to the dashboard.


```js
dashboard: {
    middleware: (request, response, next) => {
        console.log(`New dashboard request from ${request.ip} to ${request.path}`)
        next()
    }
}
```

#### `ioMiddleware`

This adds a custom [Socket.IO middleware](https://socket.io/docs/v4/middlewares/) in front
of the websocket connection between the Dashboard page and Node-RED.

```js
dashboard: {
    ioMiddleware: (socket, next) => {
        if (isValid(socket.request)) {
            next();
        } else {
            next(new Error("invalid"));
        }
    }
}
```

#### `maxHttpBufferSize`

This set the maximum message size (in bytes) the socket can send.
Default value is 1MiB (1E6 bytes).

Change this value to allow larger files to be uploaded.

```js
dashboard: {
    maxHttpBufferSize: 1e8 // size in bytes, example: 100 MB
}
```

