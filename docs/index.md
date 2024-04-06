---
layout: home

hero:
  name: Dashboard 2.0
  text: Build your own UI using Node-RED
  tagline: An easy to use collection of nodes for Node-RED that allows you to create data-driven dashboards & data visualisations.
  image:
    src: /logo.png
    alt: VitePress
  actions:
    - theme: brand
      text: Getting Started
      link: /getting-started
    - theme: alt
      text: Widget Collection
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/FlowFuse/node-red-dashboard
---

<script setup>
    import { ref } from 'vue';

    import HomeExtension from './components/HomeExtension.vue';
    import RecommendedReading from './components/RecommendedReading.vue';
    import FlowFuseAdvert from './components/FlowFuseAdvert.vue';
    import CopyIcon from './components/icons/CopyIcon.vue';

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

## Recommended Reading

<RecommendedReading />

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

</style>