---
description: Explore how layout managers in FlowFuse Dashboard can help organize your dashboard's appearance effectively.
---

# Layout Managers

Dashboard's UI is built around the central core of a "Layout Manager" which is responsible for rendering the UI, and managing the layout of the widgets within it.

The navigational hierarchy of the Dashboard UI is as follows:

- **UI** - `ui-base` - Multiple endpoints can be served within a single Dashboard. Later work will be done to treat these as completely isolated interfaces.
- **Page** - `ui-page` - All pages within a single UI are listed in the navigation drawer (left menu). Each page is configured to use a given "Layout Manager", and that manager will render 
- **Group** - `ui-group` - A group is a collection of widgets that will be positioned together on a page. Each page "layout" defines how these groups are laid out, but internally, within a group, layout is always consistent, using a bootstrap-style Column Layout (default width of 6).
- **Widget** - `ui-<widget-name>` - Each widget is defined as a Vue component. You can checkout an example `<widget>.vue` file in our [Adding Widgets](../widgets/core-widgets#example-widget-vue) guide.


## Baseline Layouts

`/Layouts/Baseline.vue` defines the basic structure of a page (header and left-side navigation drawer). Other layouts then can extend this baseline and define _how_ the widgets are rendered within the baseline's default `<slot></slot>`.

This list of baseline layouts will likely grow in time, and for now, just includes a _very_ basic starter template (side navigation and header).

## Adding a new Layout Manager

### Checklist 

If you're looking to define your own Layout manager to add to Dashboard, then you need to ensure you've completed the following steps:

1. Created `YourLayout.vue` in `/ui/src/layouts/`
1. Add your layout in `/ui/src/layouts/index.js` with a specific key, e.g. `your-layout`
1. Add your layout to the options in `/nodes/config/ui-page_html`, inside the `oneditprepare` function. Ensure to have the `value` set as the key you used in Step 2.

### Example `.vue` file

The below example can help you get started with your own layout.

We have also documented the structure of the [Widget](./events#widget) object (used in `line 13`), which will provide detail on what data you have available for a given widget/component.

```vue:line-numbers {1}
<template>
    <!-- Extend the Baseline Template, and render the page title appropriately -->
    <BaselineLayout :page-title="$route.name">
        <!-- Retrieve our widgets assigned to this page (page id = $route.meta.id) -->
        <div class="nrdb-layout--flex" v-if="widgets && widgets[$route.meta.id]">
            <!-- Loop over the widgets defined for this page -->
            <div v-for="w in widgets[$route.meta.id]" :key="w.id">
                <!-- here we wrap all of our widgets inside a Vuetify v-card -->
                <v-card variant="outlined" class="">
                    <!-- draw our widget into the #text slot of the v-card -->
                    <template #text>
                        <!-- render the widget's component, passing in the widget id, props and state -->
                        <component  :is="w.component" :id="w.id" :props="w.props" :state="w.state"/>
                    </template>
                </v-card>
            </div>
        </div>
    </BaselineLayout>
</template>

<script>
    import BaselineLayout from './Baseline.vue'
    import { mapState } from 'vuex';

    export default {
        name: 'LayoutFlex',
        computed: {
            // our "ui" vue store contains a collection
            //of widgets mapped by Page ID ($route.meta.id)
            ...mapState('ui', ['widgets']),
        },
        components: {
            // extend the BaselineLayout component to get
            // the header and navigation drawer
            BaselineLayout
        }
    }
</script>

<style scoped>
/*
    any CSS you have for this layout can go here,
    mapped with appropriate CSS classes
*/
</style>
```