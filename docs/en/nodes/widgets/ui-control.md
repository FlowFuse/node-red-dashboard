---
{
    "description": "Dynamically control elements on your dashboard through ui-control for FlowFuse Dashboard.",
    "props": {
        "Output": "Which events the node sends from its output. <b>None</b>, the default for new nodes, removes the output. See the <a href=\"#events-list\">Events List</a>.",
        "On input": "<b>Use msg.payload</b> controls the Dashboard with the payloads described below. <b>Run the actions below</b> ignores <code>msg.payload</code>, and any incoming msg runs the actions set up in the node."
    },
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
- **Display**: Show/Hide pages, groups and widgets
- **Disability**: Enable/Disable pages, groups and widgets, this still shows them, but prevents interaction

Controls can be sent in `msg.payload`, or set up in the node as [actions](#actions).

## Properties

<PropsTable/>

## Actions <AddedIn version="1.35.0" />

With **On input** set to **Run the actions below**, each incoming msg runs the list of actions set up in the node. Each action has a target:

| Action | Targets |
| --- | --- |
| Navigate | A page, next page, previous page, refresh, or a `msg` property |
| Show, Hide | A page, group or widget, or a `msg` property. Opens or closes a dialog group. |
| Enable, Disable | A page, group or widget, or a `msg` property |

Pages, groups and widgets picked from the list are stored by id, so renaming them doesn't break the node. If one is deleted, the node is marked as invalid in the editor.

A `msg` property target is read from the incoming msg:

- **Navigate** takes the same values as `msg.payload` in [Change Page](#change-page): a page name or id, `"+1"`, `"-1"`, `""` or an index. A missing property is reported as an error.
- **Show, Hide, Enable and Disable** take an id or name, or an array of them. `"<Page>:<Group>"`, `"<Group>:<Widget>"` and `"<Page>:<Group>:<Widget>"` are also accepted. A name used by more than one page, group or widget is reported as an error, so use an id instead.

Actions run together as one change, grouped by type, rather than one at a time in the listed order. So "Hide X" then "Show X" leaves X hidden, and only the last Navigate action is used.

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

// Index of the page, starting from 0
msg.payload = 2
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

You can programmatically show/hide pages, groups and widgets with the following payload into `ui-control`. Showing or hiding a dialog group opens or closes the dialog.

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
    },
    widgets: {
        show: ['<Widget Name>',
               '<Widget Id>',
               '<Group Name>:<Widget Name>',
               '<Page Name>:<Group Name>:<Widget Name>'],
        hide: ['<Widget Id>']
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

The **Output** property chooses which of these events are sent. Set it to **None** when the node is only used to send commands. The node then has no output and doesn't listen for events from each connected client. <AddedIn version="1.35.0" />

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

#### client-connected

A client opens its first connection, a genuinely new client:

```js
msg = {
    payload: 'client-connected',
    _client: {
        clientId: '<clientId>',
        socketId: '<socketId>'
    }
}
```

#### client-reconnected

A client that had dropped returns within a short grace window (same `clientId`, new socket):

```js
msg = {
    payload: 'client-reconnected',
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

Use these to maintain per-client state that survives reconnects: add on `client-connected`, keep on `client-reconnected`, and remove on `client-gone`, all keyed on `clientId`.

> **Note:** the `client-*` events also fire under **All Events**. Their `client-`-prefixed payloads are distinct from the socket-level `connect`/`lost`, so a flow switching on `msg.payload` won't confuse the two.
