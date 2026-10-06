---
layout: home
title: Node-RED Dashboard 2.0 - FlowFuse Dashboard
titleTemplate: false
description: Build Node-RED dashboards with FlowFuse Dashboard 2.0. Install the open-source package, explore widgets and examples, and plan your migration.
head:
  - ['script', { src: '//js-eu1.hsforms.net/forms/embed/v2.js' }]
  - ['script', {}, "function checkHbspt() { if (typeof window.hbspt === 'undefined') { setTimeout(checkHbspt, 50); return; } else { hbspt.forms.create({
    target: '#ebook-form',
    region: 'eu1',
    portalId: '26586079',
    formId: '372e557c-9f90-48e8-81da-d7e462f8ef55'
  }); } ;}; checkHbspt()"]
hero:
  name: FlowFuse Dashboard
  text: Build your own UI using Node-RED
  tagline: An easy-to-use collection of nodes for Node-RED that provides tools to create data-driven applications, dashboards & data visualisations.
  image:
    src: /logo.png
    alt: FlowFuse Dashboard
  actions:
    - theme: brand
      text: Get started
      link: /getting-started
    - theme: alt
      text: Explore widgets
      link: /nodes/widgets
    - theme: alt
      text: Migrate from Dashboard 1.0
      link: /user/migration
---

<script setup>
    import { ref } from 'vue';

    import HomeExtension from './../components/HomeExtension.vue';
    import DashboardExamples from './../components/DashboardExamples.vue';
    import RecommendedTutorials from './../components/RecommendedTutorials.vue';
    import RecommendedReading from './../components/RecommendedReading.vue';
    import FlowFuseAdvert from './../components/FlowFuseAdvert.vue';
    import CopyIcon from './../components/icons/CopyIcon.vue';

    const copied = ref(false); 

    function copy () {
        navigator.clipboard.writeText('@flowfuse/node-red-dashboard');
        copied.value = true;
    }
</script>

<HomeExtension>

<div class="cta-palette">
  <h2>Available in Node-RED's Palette Manager</h2>
  <code v-if="!copied">@flowfuse/node-red-dashboard <CopyIcon @click="copy"/></code>
  <code v-else>copied!</code>
</div>

FlowFuse Dashboard, also known as Node-RED Dashboard 2.0, is an open-source collection of nodes for building interfaces in Node-RED. Display live data, collect user input and connect on-screen actions to your flows. Install it in your own Node-RED environment, or use it with the [FlowFuse platform](https://flowfuse.com/platform/dashboard/).

## Install FlowFuse Dashboard

Already running Node-RED? Install the package through the editor:

1. Open the menu in the top-right corner and select **Manage Palette**.
2. Open the **Install** tab and search for `@flowfuse/node-red-dashboard`.
3. Install that exact package. It is separate from the deprecated `node-red-dashboard` package.

Prefer the command line? Run the following command from your Node-RED user directory, which is usually `~/.node-red`, then restart Node-RED:

```bash
npm install @flowfuse/node-red-dashboard
```

## Build your first dashboard

Add a `ui-button` node to a flow, configure it and deploy. FlowFuse Dashboard can create the initial base, page, group and theme for you. Open the configured dashboard path on your Node-RED host. The default path is `/dashboard`.

From there, add widgets and organize them into groups and pages. The [getting started guide](/getting-started) walks through the structure and layout options.

## Choose widgets for your application

Start with the widgets you need, connect them to your flow and configure how they display or accept data.

| Capability | What you can do |
| --- | --- |
| Charts and gauges | Show changing measurements, compare values and make current conditions easy to read. |
| Tables and text | Present records, status information and calculated values from your flows. |
| Forms and controls | Collect information with forms and inputs, or send user actions into your flow with buttons, switches and sliders. |
| Notifications and events | Give users feedback and react to dashboard activity in your flows. |
| Custom interfaces | Use [`ui-template`](/nodes/widgets/ui-template) for custom HTML, Vue components, JavaScript and CSS when you need more than the standard widgets. |

Data connections and processing belong in your Node-RED flows. FlowFuse Dashboard provides the interface that displays the results and captures user input. [Browse the widget reference](/nodes/widgets).

Each page can use a Grid, Fixed, Notebook or Tabs layout, with configurable breakpoints for different screen sizes. [Explore layouts](/layouts/). When different users need to see different data, read the [multi-user guide](/user/multi-tenancy).

## See what you can build

### Start with interactive widgets

Explore charts, gauges and a form that adds records to a table. The getting started blueprint shows how user input and displayed data work together. [Explore the starter blueprint](https://flowfuse.com/blueprints/getting-started/dashboard/)

### Explore historical measurements

Build a dashboard that stores and retrieves time-series data, following the flow from incoming measurements through PostgreSQL storage to the dashboard. [Build a historical data dashboard](https://flowfuse.com/blog/2025/08/time-series-dashboard-flowfuse-postgresql/)

### Track defects and quality trends

Create a view of production defects with summary values, a Pareto chart and filters for line, shift and date range. [Follow the quality monitoring tutorial](https://flowfuse.com/blog/2026/07/defect-and-quality-monitoring/)

### Dashboard showcase

A small collection of example dashboards, with links to more information about each one. If you have a dashboard you want to feature here, please get in touch!

<DashboardExamples />

## Moving from the original dashboard

The original `node-red-dashboard` package was deprecated in June 2024. FlowFuse Dashboard is a separately maintained project and is the recommended replacement.

| Area | Original dashboard | FlowFuse Dashboard |
| --- | --- | --- |
| Package | `node-red-dashboard` | `@flowfuse/node-red-dashboard` |
| Project status | Deprecated | Actively maintained |
| UI foundation | AngularJS | Vue and Vuetify |

You can install FlowFuse Dashboard alongside the original package and migrate in stages. The [migration service](https://flowfuse.com/platform/dashboard/) can convert supported nodes, but some widgets and templates need manual changes. [Read the migration guide](/user/migration) and test the resulting flows before replacing a working dashboard.

## Common questions

### Is FlowFuse Dashboard free to use?

Yes. The `@flowfuse/node-red-dashboard` package is open source under the Apache 2.0 license, and you can install it in your own Node-RED environment. FlowFuse hosting and platform services are separate from the package.

### Is Node-RED Dashboard deprecated?

The original `node-red-dashboard` package is deprecated. FlowFuse Dashboard, also known as Node-RED Dashboard 2.0, is its maintained successor. Node-RED itself is not deprecated.

### Do I need a FlowFuse account?

No. You can install the package into any self-managed Node-RED environment without a FlowFuse account.

### Will my existing dashboard work without changes?

Plan to review the migration. Supported nodes can be converted with the migration service, while other parts may need to be rebuilt. AngularJS templates need particular attention because FlowFuse Dashboard uses Vue. You can run both packages side by side while testing.

### Can I use it on a phone or tablet?

Yes. Layouts are responsive and support configurable breakpoints. Test your controls, charts and tables at the widths your users need, particularly with fixed layouts or custom templates.

### Can different users see different data?

Yes. Configure client-specific routing for the widgets that need it, and set up authentication when the application needs to identify users. See the [multi-user guide](/user/multi-tenancy).

## Keep learning

<RecommendedTutorials />

<RecommendedReading />

## Download our E-Book

<div class="ebook-advert">
    <img style="max-height: 300px;" src="./../assets/images/ebook-dashboard-render.png" alt="FlowFuse Dashboard ebook cover" />
    <div id="ebook-form"></div>
</div>

## Contribute to FlowFuse Dashboard

FlowFuse Dashboard is developed in the open. Visit the [GitHub repository](https://github.com/FlowFuse/node-red-dashboard) to explore the project, report an issue or find out how to contribute.

<FlowFuseAdvert />

</HomeExtension>

<style scoped>
.cta-palette {
  text-align: center;
  margin-top: -32px;
  margin-bottom: -12px;
}

.cta-palette code {
  text-align: center;
  color: #7C0808;
  background-color: #FFFAFA;
  border: 1px solid #DBC0C0;
  padding: 9px 18px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.icon {
  width: 20px;
  &:hover {
    cursor: pointer;
    color: black;
  }
}

.ebook-advert {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 16px;
}

.ebook-advert #ebook-form {
  flex-grow: 1;
  min-width: 300px;
  max-width: 100%;
}

</style>