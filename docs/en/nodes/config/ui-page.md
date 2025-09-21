---
description: Manage your dashboard pages with ease in FlowFuse Dashboard for a streamlined user experience.
props:
    UI: The UI (<code>ui-base</code>) that this page will be added to. 
    Path: Extending the parent UI path, defines where this page renders
    Icon: Which <a href="https://pictogrammers.com/library/mdi/">Material Designs Icon</a> to use for the page. No need to include the <code>mdi-</code> prefix.
    Theme: Which FlowFuse Dashboard theme to use for this page. You can customise your own too.
    Layout: Which Layout Manager to render the widgets with
    Default State: <ul><li><b>Visibility</b> - Defines the default visibility of this page in hte side navigation menu.</li><li><b>Interactivity</b> - Controls whether the item is disabled/enabled in the side navigation menu.</li></ul><p>Both of these can be overridden by the user at runtime using a <code>ui-control</code> node.</p>
    Breakpoints: Configure the responsive breakpoints for your Dashboard, controlling how many columns render at different screen sizes. Not available for "Fixed" layouts.
---

<script setup>
</script>

# Config: UI Page `ui-page`

Each page will be rendered in a navigation drawer within the UI, and can be accessed via the navigation bar at the top of the page. See [Layouts](../../contributing/guides/layouts) for more information on how layouts work.

## Properties

<PropsTable :hide-dynamic="true"/>

### Breakpoints

![Breakpoints](../../../assets/images/breakpoints-config.png)
_Screenshot showing the default breakpoints configuration_

As detailed in the Layouts section of the documentation, most layout types in Dashboard utilise "breakpoints". Each breakpoint defines:

- A **pixel** value, i.e. when the breakpoint comes into effect
- A **columns** value, i.e. how many columns should be rendered at this breakpoint

The more columns you have, the more groups and widgets you can fit _side-by-side_ in your page. After this, new content will render to a new row.

Note that configurable breakpoints are not available for "Fixed" layouts as that does not use the column approach to rendering groups.

The default breakpoints are:

### Mobile

- **Breakpoint:** < 576px
- **Columns:** 3

### Medium

- **Breakpoint:** > 576px
- **Columns:** 6

### Tablet

- **Breakpoint:** 768px
- **Columns:** 9

### Desktop

- **Breakpoint:** 1024px
- **Columns:** 12


