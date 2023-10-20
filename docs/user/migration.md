<script setup>
    import { ref } from 'vue'
    import MigrationWidgetProfile from '../components/MigrationWidgetProfile.vue'

    import uiButton from './migration/ui_button.json'

    const widgets = ref({
        'ui_button': uiButton
    })
</script>
    
# Dashboard 1.0 Migration Guide

Whilst we spent a lot of time trying to work out how we could make Dashboard 2.0 backward compatible with Dashboard 1.0, unfortunately, we've just been unable to accomplish that. As such, re-building Dashboards in Dashboard 2.0 is a manual process.

## Why Migrate?

The [original Node-RED Dashboard](https://flows.nodered.org/node/node-red-dashboard) is no longer being actively developed, with the following note on the GH repository:

> This project is based on Angular v1 - As that is now no longer maintained, this project should be considered to be on "life support". Small patches will be applied on a best can do basis, but there will be no major feature upgrades, and underlying security breakage may occur.

This guide is intended to help users migrate from the original Dashboard (1.0) to this new project, Dashboard 2.0.

We have, where possible, replicated functionality from Dashboard 1.0, and in some cases, improved upon it. If there are any features you feel are missing, please raise an issue on the [GitHub repository](https://github.com/FlowFuse/node-red-dashboard/issues)

## Where to start


## Third-Party Widgets

Any addons that were built for Dashboard 1.0 (e.g. `ui-svg`, `ui-worldmap`) are not supported in Dashboard 2.0.

We do need community contributions to re-build them the "Dashboard 2.0 way". If you're interested in helping us with this exercise, we have a [guide on how to build custom widgets](/docs/contributing/widgets/third-party.md) to help you get started.

## Dashboard 1.0 Nodes

The following details a direct comparison of all properties available on each node in Dashboard 1.0, and what changes have been made, if any, in Dashboard 2.0.

### `ui_audio`

<MigrationWidgetProfile :profile="widgets['ui_audio']" />

### `ui_button`

<MigrationWidgetProfile :profile="widgets['ui_button']" />