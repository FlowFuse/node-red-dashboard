---
{
    "description": "Dynamically control elements on your dashboard through ui-control for FlowFuse Dashboard.",
    "events": [
        {
            "event": "$pageview",
            "payload": "{ page }",
            "description": "Sent whenever a user <i>views</i> a given page on the Dashboard"
        },
        {
            "event": "$pageleave",
            "payload": "{ page }",
            "description": "Sent whenever a user <i>leaves</i> a given page on the Dashboard"
        }
    ]
}
---

<script setup>
    import EventsList from '../../../components/EventsList.vue'
    import AddedIn from '../../../components/AddedIn.vue'
</script>

# Control `ui-control` <AddedIn version="0.9.0" />

This widget doesn't render any content into your Dashboard. Instead, it provides an interface for you to control the behaviour of your Dashboard from within the Node-RED Editor.

Functionality is generally divided into two main features:

- **Navigation**: Force the user to move to a new page
- **Display**: Show/Hide groups and pages
- **Disability**: Enable/Disable groups and pages, this still shows them, but prevents interaction

## Controls List

Currently, we support the following controls:

### Navigation

You can programmatically force navigation with the following payloads with `ui-control`:

#### Change Page

Explicitly choose the page you want to navigate to:

```js
// String
msg.payload = '<Page Name>'

// Object
msg.payload = {
    page: '<Page Name>',
}
```

With the object format, you can also specify query parameters with which to load the page:

```js
msg.payload = {
    page: '<Page Name>',
    query: {
        hello: 'world'
    }
}
```

Which would navigate to a page with `?hello=world` appended to the URL.

#### Next/Previous

Navigate to the next or previous page in the list:

```js
// Next Page
msg.payload = "+1"

// Previous Page
msg.payload = "-1"
```

#### Refresh

You can force a refresh of the current view by sending a blank string payload:

```js
msg.payload = ""
```

#### External URL

If you want to trigger navigation to an external resource or website, you can do so by passing a `url` property into the `msg.payload`, e.g:

```js
msg.payload = {
    url: 'https://nodered.org'
}
```

 You can also specify a `target` property to open the website in a new browser window or tab.
 
```js
msg.payload = {
    url: 'https://nodered.org',
    target: '_blank'
}
```

### Show/Hide

You can programmatically show/hide groups and pages with the following payload into `ui-control`:

```js
msg.payload = {
    pages: {
        show: ['<Page Name>',
               '<Page Id>'
               {page: '<Page Name>'},
               {page: '<Page Id>'}],
        hide: ['<Page Id>']
    },
    groups: {
        show: ['<Group Name>',
               '<Group Id>'
               '<Page Name>:<Group Name>',
               '<Page Id>:<Group Name>',
               {group: '<Group Name>'},
               {group: '<Group Id>'},
               {page: '<Page Name>', group: '<Group Name>'},
               {page: '<Page Id>', group: '<Group Name>'}],
        hide: ['<Group Id>']
    }
}
```
_Note:_ `pages` can be subbed with `tabs` as per Node-RED Dashboard and `groups` can also be subbed with `group` as per Node-RED Dashboard.

### Enable/Disable

You can programmatically disable/enable groups and pages with the following payload into `ui-control`:

```js
msg.payload = {
    pages: {
        enable: ['<Page Id>''],
        disable: ['<Page Id>']
    },
    groups: {
        enable: ['<Group Id>'],
        disable: ['<Group Id>']
    },
    widgets: {
        enable: ['<Widget Id>'],
        disable: ['<Widget Id>']
    }
}
```

_Note:_ `pages` can be subbed with `tabs` as per Node-RED Dashboard and `groups` can also be subbed with `group` as per Node-RED Dashboard.

## Events List

In addition to `ui-control` taking input to _control_ the UI, we have also maintained support for all events emitted by `ui-control` from Node-RED Dashboard here too.

### Connection Status

We follow the Node-RED Dashboard convention for emitting socket-based events from the `ui-control` node.

#### .on('connection')

When a new Dashboard client connects to Node-RED, the `ui-control` node will emit:

```js
msg = {
    payload: 'connect',
    socketid: '<socketid>',
    socketip: '<socketip>'
}
```

#### .on('disconnect')

When a Dashboard client disconnects from Node-RED, the `ui-control` node will emit:

```js
msg = {
    payload: 'lost',
    socketid: '<socketid>',
    socketip: '<socketip>'
}
```

### Change Tab/Page

When a user changes the active tab or page, the `ui-control` node will emit:

```js
msg = {
    payload: 'change',
    socketid: '<socketid>',
    socketip: '<socketip>',
    tab: '<Page Index>',
    name: '<Page Name>'
}
```

### Client Presence <AddedIn version="1.32.0" />

The `connect`/`lost` events above are per _socket_, and a socket's id changes every time the connection is re-established (a device sleep, a network blip, a page reload). That makes `socketId` unreliable as a key for tracking a client over time.

For higher-level, per-_client_ events keyed on the stable [`clientId`](../../user/multi-tenancy.md#core-client-data), set the node's **Output** to **Client Presence Events Only** (or **All Events**). It then emits:

#### client-connect

A client opens its first connection, a genuinely new client:

```js
msg = {
    payload: 'client-connect',
    _client: {
        clientId: '<clientId>',
        socketId: '<socketId>'
    }
}
```

#### client-reconnect

A client that had dropped returns within a short grace window (same `clientId`, new socket):

```js
msg = {
    payload: 'client-reconnect',
    _client: {
        clientId: '<clientId>',
        socketId: '<socketId>'
    }
}
```

#### client-gone

A client's last connection drops and it does not return within the grace window:

```js
msg = {
    payload: 'client-gone',
    _client: {
        clientId: '<clientId>'
    }
}
```

The grace window means a brief blip or a page refresh does **not** fire `client-gone`; only a genuine departure does. Opening a second tab of a client that is already connected emits nothing (it is already present).

Use these to maintain per-client state that survives reconnects: add on `client-connect`, keep on `client-reconnect`, and remove on `client-gone`, all keyed on `clientId`.

> **Note:** the `client-*` events also fire under **All Events**. Their `client-`-prefixed payloads are distinct from the socket-level `connect`/`lost`, so a flow switching on `msg.payload` won't confuse the two.
