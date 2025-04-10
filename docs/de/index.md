---
layout: home
head:
  - ['script', { src: '//js-eu1.hsforms.net/forms/embed/v2.js' }]
  - ['script', {}, "function checkHbspt() { if (typeof window.hbspt === 'undefined') { setTimeout(checkHbspt, 50); return; } else { hbspt.forms.create({
    target: '#ebook-form',
    region: 'eu1',
    portalId: '26586079',
    formId: '372e557c-9f90-48e8-81da-d7e462f8ef55'
  }); } ;}; checkHbspt()"]
hero:
  name: Dashboard 2.0
  text: Erstellen Sie Ihr eigenes UI mit Node-RED
  tagline: Eine einfach zu verwendende Sammlung von Knoten für Node-RED, mit der Sie datengesteuerte Dashboards und Datenvisualisierungen erstellen können.
  image:
    src: /logo.png
    alt: Node-RED Dashboard 2.0
  actions:
    - theme: brand
      text: Erste Schritte
      link: /de/getting-started
    - theme: alt
      text: Widget-Sammlung
      link: /de/getting-started
    - theme: alt
      text: Auf GitHub ansehen
      link: https://github.com/FlowFuse/node-red-dashboard
---

<script setup>
    import { ref } from 'vue';

    import HomeExtension from './../components/HomeExtension.vue';
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
  <h2>Verfügbar im Palette-Manager von Node-RED</h2>
  <code v-if="!copied">@flowfuse/node-red-dashboard <CopyIcon @click="copy"/></code>
  <code v-else>kopiert!</code>
</div>

## Laden Sie unser E-Book herunter

<div class="ebook-advert">
    <img style="max-height: 300px;" src="./../assets/images/ebook-dashboard-render.png" />
    <div id="ebook-form"></div>
</div>

## Empfohlene Tutorials

<RecommendedTutorials />

## Weitere empfohlene Lektüre

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