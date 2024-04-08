---
description: Manage your dashboard pages with ease in Node-RED Dashboard 2.0 for a streamlined user experience.
props:
    UI: The UI (<code>ui-base</code>) that this page will be added to. 
    Path: Extending the parent UI path, defines where this page renders
    Icon: Which <a href="https://pictogrammers.com/library/mdi/">Material Designs Icon</a> to use for the page. No need to include the <code>mdi-</code> prefix.
    Theme: Which Dashboard 2.0 theme to use for this page. You can customise your own too.
    Layout: Which Layout Manager to render the widgets with
    Default State: <ul><li><b>Visibility</b> - Defines the default visibility of this page in hte side navigation menu.</li><li><b>Interactivity</b> - Controls whether the item is disabled/enabled in the side navigation menu.</li></ul><p>Both of these can be overridden by the user at runtime using a <code>ui-control</code> node.</p>
---

<script setup>
</script>

# Config: UI Page `ui-page`

Each page will be rendered in a navigation drawer within the UI, and can be accessed via the navigation bar at the top of the page. See [Layouts](../../contributing/guides/layouts) for more information on how layouts work.

## Properties

<PropsTable :hide-dynamic="true"/>