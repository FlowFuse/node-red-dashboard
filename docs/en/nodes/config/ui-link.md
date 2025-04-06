---
description: Manage your dashboard pages with ease in Node-RED Dashboard 2.0 for a streamlined user experience.
props:
    UI: The UI (<code>ui-base</code>) that this page will be added to. 
    Path: The URL to navigate to when a user selects this link
    Icon: Which <a href="https://pictogrammers.com/library/mdi/">Material Designs Icon</a> to use for the page. No need to include the <code>mdi-</code> prefix.
    Default State: <ul><li><b>Visibility</b> - Defines the default visibility of this page in the side navigation menu.</li><li><b>Interactivity</b> - Controls whether the item is disabled/enabled in the side navigation menu.</li></ul><p>Both of these can be overridden by the user at runtime using a <code>ui-control</code> node.</p>
---

<script setup>
</script>

# Config: UI Link `ui-link`

If you want to link to external resources from your Dashboard, you can do so with the `ui-link` config node. This will render a link in the side navigation menu, just like your Dashboard [Pages](./ui-page.md), but will navigate directly to the URL you specify, even if out of the scope of Dashboard 2.0.

## Properties

<PropsTable :hide-dynamic="true"/>

## Adding Links

To add a link to your Dashboard, you can use the Dashboard 2.0 side panel in the Node-RED editor. Click the `+ Link` button to add a new item to the list. You can then configure the link with the relevant properties.
