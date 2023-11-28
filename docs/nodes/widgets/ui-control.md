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

# Control `ui-control`

This widget doesn't render any content into your Dashboard. Instead, it provides an interface for you to control the behaviour of your Dashboard from within the Node-RED Editor.

Functionality is generally divided into two main features:

- **Navigation**: Force the user to move to a new page
- **Display**: Show/Hide groups and pages
- **Disability**: Enable/Disable groups and pages, this still shows them, but prevents interaction

## Controls List

Currently, we support the following controls: