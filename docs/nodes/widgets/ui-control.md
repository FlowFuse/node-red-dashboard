---
{
    "description": "Dynamically control elements on your dashboard through ui-control for Node-RED Dashboard 2.0.",
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
    import EventsList from '../../components/EventsList.vue'
    import AddedIn from '../../components/AddedIn.vue'
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

You can programmaticaly force navigation with the following payloads with `ui-control`:

#### Change Page

Explicitely choose the page you want to navigate to:

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

### Show/Hide

You can programmaticaly show/hide groups and pages with the following payload into `ui-control`:

```js
msg.payload = {
    pages: {
        show: ['<Page Name>', '<Page Name>'],
        hide: ['<Page Name>']
    }
    groups: {
        show: ['<Page Name>:<Group Name>', '<Page Name>:<Group Name>'],
        hide: ['<Page Name>:<Group Name>']
    }
}
```

_Note:_ `pages` can be subbed with `tabs` as per Dashboard 1.0 and `groups` can also be subbed with `group` as per Dashboard 1.0.

### Enable/Disable

You can programmaticaly disable/enable groups and pages with the following payload into `ui-control`:

```js
msg.payload = {
    pages: {
        enable: ['<Page Name>', '<Page Name>'],
        disable: ['<Page Name>']
    }
    groups: {
        enable: ['<Page Name>:<Group Name>', '<Page Name>:<Group Name>'],
        disable: ['<Page Name>:<Group Name>']
    }
}
```

_Note:_ `pages` can be subbed with `tabs` as per Dashboard 1.0 and `groups` can also be subbed with `group` as per Dashboard 1.0.

### Show/Hide Dialog

You can programmaticaly show/hide dialog groups and pages with the following payload into `ui-control`:

```js
msg.payload = {
    groups: {
        'show-dialog': ['<Page Name>:<Group Name>', '<Page Name>:<Group Name>'],
        'hide-dialog': ['<Page Name>:<Group Name>']
    }
}
```

To use this you need to change the group type as [follows](/nodes/config/ui-group.html#properties)

_Note:_ `pages` can be subbed with `tabs` as per Dashboard 1.0 and `groups` can also be subbed with `group` as per Dashboard 1.0.

## Events List

In addition to `ui-control` taking input to _control_ the UI, we have also maintained support for all events emitted by `ui-control` from Dashboard 1.0 here too.

### Connection Status

We follow the Dashboard 1.0 convention for emitting socket-based events from the `ui-control` node.

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