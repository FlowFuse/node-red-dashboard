---
{
    "description": "Utilize ui-event in Node-RED Dashboard 2.0 to handle real-time events and user interactions effectively.",
    "events": [
        {
            "event": "$pageview",
            "payload": "{ page, query }",
            "description": "Sent whenever a user <i>views</i> a given page on the Dashboard. Details the Dashboard-defined Page and any query parameters found in the URL."
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

# Event `ui-event` <AddedIn version="0.9.0" />

This widget doesn't render any content into your Dashboard. Instead, it listens for user-driven behaviour and events in your Dashboard and emits accordingly into the Node-RED Editor when those events have taken place.

## Events List

Currently, we support the following events:

<EventsList />

### Example: Page View (`$pageview`)

Each time a user views a page, the `ui-event` node will emit:

```js
msg = {
    topic: '$pageview',
    payload: {
        page: {
            name: 'Page Name',
            path: '/page/path'
            id: '1234',
            theme: 'dark',
            layout: 'default',
            _groups: []
        },
        query: {
            key: 'value'
        }
    },
    _client: {
        socketId: '1234',
        socketIp: '127.0.0.1',
    }
}
```

## Custom Events

In your own `ui-template` nodes, you can emit custom events that will get captured by any `ui-event` node calling the embeded `$socket` operator directly. 

The `$socket.emit` function takes in 3 arguments:

- The event name, in this case, `ui-event`
- The `id` of the `ui-event` node you want to emit this to. You can also use `all` to emit to all `ui-event` nodes.
- The full `msg` you want to send.

So in the case where we want to send to a specific `ui-event` node:

```vue
<v-btn @click="$socket.emit('ui-event', 'ui-event-node-id', msg)">Send Custom Event</v-btn>
```

Or, in the case where we brodcast to _all_ `ui-event` nodes:

```vue
<v-btn @click="$socket.emit('ui-event', 'all', msg)">Send Custom Event</v-btn>
```