---
props:
    Path: The endpoint proceeding the host of Node-RED where your UI will be accessible
    Include Page Path in Label: The side navigation lists all available Pages for the Dashboard. By default, this will just show the page name, but this option allows you to also show the page's path.
    Side Navigation Style: The style the side navigation menu should use (default, fixed, icon, temporary, none)
---

<script setup>
    import AddedIn from '../../components/AddedIn.vue';
    import SideBySideImages from '../../components/SideBySideImages.vue';
</script>

# Config: UI Base `ui-base`

Some details here about the ui-base config node

## Properties

<PropsTable :hide-dynamic="true"/>

## Navigation Style Options <AddedIn version="1.2.0" />

### Collapsing (default)

<SideBySideImages
    caption="Example of how the 'Collapsing' option looks when open (left) and closed (right)."
    left="/images/node-examples/ui-base-layout-default-open.png"
    right="/images/node-examples/ui-base-layout-sidebar-closed.png"
/>

This open will shift the entire content of the Dashboard when opened, and not be visisble at all when closed.

### Fixed

![Example of how the 'Fixed' option looks at all times](/images/node-examples/ui-base-layout-fixed.png "Example of how the 'Fixed' option looks at all times"){data-zoomable}
_Example of how the 'Fixed' option looks at all times_

Will always remain open. At our mobile breakdpoint (768px), this value is overriden, and an "Appear Over" option is used. Note that at mobile-scale (screen width less than 768px), then the Fixed layout will revert back to the "Default" option.

### Collapse to icons

Similar to "Collapsing" when opened, but when closed, the icons for each page still show.

<SideBySideImages
    caption="Example of how the 'Collapsing' option looks when open (left) and closed (right)."
    left="../../public/images/node-examples/ui-base-layout-default-open.png"
    right="../../public/images/node-examples/ui-base-layout-icon-closed.png"
/>

### Appear over content

<SideBySideImages
    caption="Example of how the 'Collapsing' option looks when open (left) and closed (right)."
    left="../../public/images/node-examples/ui-base-layout-over-open.png"
    right="../../public/images/node-examples/ui-base-layout-sidebar-closed.png"
/>

Not visible when closed, and when open, will appear over the Dashboard content, without shifting it.

### Always Hide

![Example of how the 'Always Hide' option looks](/images/node-examples/ui-base-layout-hide.png "Example of how the 'Always Hide' option looks"){data-zoomable}
_Example of how the 'Always Hide' option looks_

The sidebar will not be visible under any circumstances. All pages are still accesible via their direct links or a [ui-control](../widgets/ui-control.md) node.