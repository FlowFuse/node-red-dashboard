---
{
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
</script>

# Event `ui-event`

This widget doesn't render any content into your Dashboard. Instead, it listens for user-driven behaviour and events in your Dashboard and emits accordingly into the Node-RED Editor when those events have taken place.

## Events List

Currently, we support the following events:

<EventsList />

