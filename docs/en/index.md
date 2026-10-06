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
  <p class="aka">Also known as Node-RED Dashboard 2.0 · Open source under Apache 2.0</p>
</div>

## Get started

1. In the Node-RED editor, open the menu and select **Manage Palette**.
2. On the **Install** tab, search for `@flowfuse/node-red-dashboard` and install it. Note that this is not the deprecated `node-red-dashboard` package.
3. Add a `ui-button` node to a flow and deploy. The base, page, group and theme are created for you, and your dashboard is available at `/dashboard`.

Prefer the command line? Run `npm install @flowfuse/node-red-dashboard` in your Node-RED user directory (usually `~/.node-red`) and restart Node-RED. The [getting started guide](/getting-started) covers the rest.

## Dashboard Showcase

A small collection of example dashboards, with links to more information about each one. If you have a dashboard you want to feature here, please get in touch!

<DashboardExamples />

## Migrating from Dashboard 1.0

The original `node-red-dashboard` package was deprecated in June 2024, and FlowFuse Dashboard is its recommended replacement. Both can run side by side, so you can migrate in stages. The [migration service](https://flowfuse.com/platform/dashboard/) converts supported nodes, while some widgets and templates need manual changes. [Read the migration guide](/user/migration).

## Recommended Tutorials

<RecommendedTutorials />

## More Recommended Reading

<RecommendedReading />

## Download our E-Book

<div class="ebook-advert">
    <img style="max-height: 300px;" src="./../assets/images/ebook-dashboard-render.png" alt="FlowFuse Dashboard ebook cover" />
    <div id="ebook-form"></div>
</div>

## Common Questions

<div class="faq">

<details>
<summary>Is FlowFuse Dashboard free to use?</summary>

Yes. The `@flowfuse/node-red-dashboard` package is open source under the Apache 2.0 license, and you can install it in any Node-RED environment. FlowFuse hosting and platform services are separate from the package.

</details>

<details>
<summary>Is Node-RED Dashboard deprecated?</summary>

The original `node-red-dashboard` package [is deprecated](https://flowfuse.com/blog/2024/06/dashboard-1-deprecated/). FlowFuse Dashboard, also known as Node-RED Dashboard 2.0, is its maintained successor. Node-RED itself is not deprecated.

</details>

<details>
<summary>Do I need a FlowFuse account?</summary>

No. You can install the package into any self-managed Node-RED environment without a FlowFuse account.

</details>

<details>
<summary>Will my existing dashboard work without changes?</summary>

Plan to review the migration. Supported nodes can be converted with the migration service, while other parts may need to be rebuilt. AngularJS templates need particular attention because FlowFuse Dashboard uses Vue.

</details>

<details>
<summary>Can I use it on a phone or tablet?</summary>

Yes. Layouts are responsive and support configurable breakpoints. You can also [install a dashboard on your phone](/user/pwa) as an app.

</details>

<details>
<summary>Can different users see different data?</summary>

Yes. Configure client-specific routing for the widgets that need it, and set up authentication when the application needs to identify users. See the [multi-user guide](/user/multi-tenancy).

</details>

</div>

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

.cta-palette .aka {
  margin-top: 12px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.faq details {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0 16px;
  margin: 0 0 8px;
  background-color: var(--vp-c-bg-soft);
}

.faq summary {
  cursor: pointer;
  margin: 0;
  padding: 10px 0;
  line-height: 24px;
  font-weight: 600;
}

.faq details p {
  margin: 4px 0 12px;
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