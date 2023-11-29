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

### Navigation

You can programmaticaly force navigation with the following payload into `ui-control`:

```js
msg.payload = {
    page: '<Page Name>',
}
```

_Note:_ `page` can also be subbed with `tab` as per Dashboard 1.0

### Show/Hide

You can programmaticaly show/hide groups and pages with the following payload into `ui-control`:

```js
msg.payload = {
    pages: {
        show: ['<Page Name>', '<Page Name>'],
        hide: ['<Page Name>']
    }
    groups: {
        show: ['<Group Name>', '<Group Name>'],
        hide: ['<Group Name>']
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
        enable: ['<Group Name>', '<Group Name>'],
        disable: ['<Group Name>']
    }
}
```

_Note:_ `pages` can be subbed with `tabs` as per Dashboard 1.0 and `groups` can also be subbed with `group` as per Dashboard 1.0.