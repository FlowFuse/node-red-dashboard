---
layout: home
title: Node-RED Dashboard 2.0 - FlowFuse Dashboard
titleTemplate: false
description: "Node-RED-Dashboards mit FlowFuse Dashboard 2.0 erstellen: Open-Source-Paket installieren, Widgets und Beispiele entdecken, Migration planen."
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
      text: Widgets entdecken
      link: /de/nodes/widgets
    - theme: alt
      text: Von Node-RED Dashboard migrieren
      link: /de/user/migration
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
  <h2>Verfügbar im Palette-Manager von Node-RED</h2>
  <code v-if="!copied">@flowfuse/node-red-dashboard <CopyIcon @click="copy"/></code>
  <code v-else>kopiert!</code>
  <p class="aka">Auch bekannt als Node-RED Dashboard 2.0 · Open Source unter Apache 2.0</p>
</div>

## Erste Schritte

1. Öffnen Sie im Node-RED-Editor das Menü und wählen Sie **Manage Palette**.
2. Suchen Sie im Tab **Install** nach `@flowfuse/node-red-dashboard` und installieren Sie es. Hinweis: Dies ist nicht das veraltete Paket `node-red-dashboard`.
3. Fügen Sie einem Flow einen `ui-button`-Knoten hinzu und deployen Sie. Base, Seite, Gruppe und Theme werden automatisch erstellt, und Ihr Dashboard ist unter `/dashboard` erreichbar.

Sie bevorzugen die Kommandozeile? Führen Sie `npm install @flowfuse/node-red-dashboard` in Ihrem Node-RED-Benutzerverzeichnis aus (meist `~/.node-red`) und starten Sie Node-RED neu. Alles Weitere erklärt der [Leitfaden für die ersten Schritte](/de/getting-started).

## Dashboard-Showcase

Eine kleine Sammlung von Beispiel-Dashboards mit Links zu weiteren Informationen. Wenn Sie ein Dashboard haben, das Sie hier zeigen möchten, melden Sie sich gerne bei uns!

<DashboardExamples />

## Von Node-RED Dashboard migrieren

Das ursprüngliche Paket `node-red-dashboard` wurde im Juni 2024 als veraltet markiert, und FlowFuse Dashboard (Node-RED Dashboard 2.0) ist der empfohlene Nachfolger. Beide können parallel laufen, sodass Sie schrittweise migrieren können. Der [Migrationsservice](https://flowfuse.com/platform/dashboard/) konvertiert unterstützte Knoten, während einige Widgets und Templates manuell angepasst werden müssen. [Zum Migrationsleitfaden](/de/user/migration).

## Empfohlene Tutorials

<RecommendedTutorials />

## Weitere empfohlene Lektüre

<RecommendedReading />

## Laden Sie unser E-Book herunter

<div class="ebook-advert">
    <img style="max-height: 300px;" src="./../assets/images/ebook-dashboard-render.png" alt="Cover des FlowFuse Dashboard E-Books" />
    <div id="ebook-form"></div>
</div>

## Häufige Fragen

<div class="faq">

<details>
<summary>Ist FlowFuse Dashboard kostenlos?</summary>

Ja. Das Paket `@flowfuse/node-red-dashboard` ist Open Source unter der Apache-2.0-Lizenz und kann in jeder Node-RED-Umgebung installiert werden. FlowFuse-Hosting und Plattformdienste sind vom Paket unabhängig.

</details>

<details>
<summary>Ist Node-RED Dashboard veraltet?</summary>

Das ursprüngliche Paket `node-red-dashboard` [ist veraltet](https://flowfuse.com/blog/2024/06/dashboard-1-deprecated/). FlowFuse Dashboard, auch bekannt als Node-RED Dashboard 2.0, ist der gepflegte Nachfolger. Node-RED selbst ist nicht veraltet.

</details>

<details>
<summary>Brauche ich ein FlowFuse-Konto?</summary>

Nein. Sie können das Paket ohne FlowFuse-Konto in jeder selbst verwalteten Node-RED-Umgebung installieren.

</details>

<details>
<summary>Funktioniert mein bestehendes Dashboard ohne Änderungen?</summary>

Planen Sie eine Überprüfung der Migration ein. Unterstützte Knoten können mit dem Migrationsservice konvertiert werden, andere Teile müssen eventuell neu erstellt werden. AngularJS-Templates erfordern besondere Aufmerksamkeit, da FlowFuse Dashboard Vue verwendet.

</details>

<details>
<summary>Kann ich es auf einem Smartphone oder Tablet nutzen?</summary>

Ja. Layouts sind responsiv und unterstützen konfigurierbare Breakpoints. Sie können ein Dashboard auch [als App auf Ihrem Smartphone installieren](/de/user/pwa).

</details>

<details>
<summary>Können verschiedene Benutzer unterschiedliche Daten sehen?</summary>

Ja. Konfigurieren Sie clientspezifisches Routing für die Widgets, die es benötigen, und richten Sie eine Authentifizierung ein, wenn die Anwendung Benutzer identifizieren muss. Siehe den [Multi-User-Leitfaden](/de/user/multi-tenancy).

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