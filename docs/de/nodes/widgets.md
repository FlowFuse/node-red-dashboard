---
description: Entdecken Sie die große Auswahl an Widgets, die im Node-RED Dashboard 2.0 verfügbar sind, um die Interaktivität Ihres Dashboards zu verbessern.
---

<script setup>
    import { ref } from 'vue'
    import WidgetCard from '../../components/WidgetCard.vue'
    import WidgetGrid from '../../components/WidgetGrid.vue'

    const general = [{
        name: 'Audio',
        widget: 'ui-audio',
        image: '/images/node-examples/ui-audio.png',
        description: 'Fügt Ihrem Dashboard einen Audioplayer hinzu.'
    }, {
        name: 'Button',
        widget: 'ui-button',
        image: '/images/node-examples/ui-button.png',
        description: 'Fügt Ihrem Dashboard einen klickbaren Button hinzu.'
    }, {
        name: 'Markdown',
        widget: 'ui-markdown',
        image: '/images/node-examples/ui-markdown.png',
        description: 'Rendert dynamisches Markdown (einschließlich Mermaid-Diagramme).'
    }, {
        name: 'Notification',
        widget: 'ui-notification',
        image: '/images/node-examples/ui-notification.png',
        description: 'Zeigt eine Nachricht für eine definierte Zeitdauer an.'
    }, {
        name: 'Template',
        widget: 'ui-template',
        image: '/images/node-examples/ui-template.png',
        description: 'Rendert benutzerdefinierte Vorlagen auf Ihrem Dashboard.'
    }, {
        name: 'Text',
        widget: 'ui-text',
        image: '/images/node-examples/ui-text.png',
        description: 'Zeigt ein nicht bearbeitbares Textfeld auf Ihrem Dashboard an.'
    }, {
        name: 'Spacer',
        widget: 'ui-spacer',
        description: 'Fügt Ihrer Gruppe einen einfachen Abstandshalter hinzu.'
    }]

    const form = [{
        name: 'Dropdown',
        widget: 'ui-button',
        image: '/images/node-examples/ui-dropdown.png',
        description: 'Fügt Ihrem Dashboard einen klickbaren Button hinzu.'
    }, {
        name: 'Form',
        widget: 'ui-form',
        image: '/images/node-examples/ui-form.png',
        description: 'Fügt Ihrem Dashboard einen klickbaren Button hinzu.'
    }, {
        name: 'Radio Group',
        widget: 'ui-radio-group',
        image: '/images/node-examples/ui-radio.png',
        description: 'Fügt Ihrem Dashboard eine Radiogruppe hinzu.'
    }, {
        name: 'Slider',
        widget: 'ui-slider',
        image: '/images/node-examples/ui-slider.png',
        description: 'Fügt Ihrem Dashboard einen Schieberegler hinzu.'
    }, {
        name: 'Switch',
        widget: 'ui-switch',
        image: '/images/node-examples/ui-switch.png',
        description: 'Fügt Ihrem Dashboard einen klickbaren Schalter hinzu.'
    }, {
        name: 'Text Input',
        widget: 'ui-text-input',
        image: '/images/node-examples/ui-text-input.png',
        description: 'Fügt Ihrem Dashboard ein Texteingabefeld hinzu.'
    }]

    const data = [{
        name: 'Chart',
        widget: 'ui-chart',
        image: '/images/node-examples/ui-chart-line.png',
        description: 'Fügt Ihrem Dashboard ein Diagramm hinzu.'
    }, {
        name: 'Table',
        widget: 'ui-table',
        image: '/images/node-examples/ui-table.png',
        description: 'Fügt Ihrem Dashboard eine Tabelle hinzu.'
    }]
    const events = [{
        name: 'Event',
        widget: 'ui-event',
        description: 'Überwacht Ereignisse im Dashboard und sendet entsprechend aus.'
    }]
    const widgets = ref({
        general,
        form,
        data,
        events
    })
</script>

# Widgets

## Kern-Widgets

Dashboard-Widgets sind die Bausteine Ihres Dashboards. Verbinden Sie sie nach Belieben, um Ihre benutzerdefinierten Datenvisualisierungen und Benutzeroberflächen zu erstellen.

Die folgenden Widgets sind im Node-RED Dashboard 2.0 enthalten:

### Allgemein

<WidgetGrid>
    <WidgetCard v-for="widget in widgets.general" :widget="widget"></WidgetCard>
</WidgetGrid>

### Formulare & Steuerungen

<WidgetGrid>
    <WidgetCard v-for="widget in widgets.form" :widget="widget"></WidgetCard>
</WidgetGrid>

### Datenvisualisierung

<WidgetGrid>
    <WidgetCard v-for="widget in widgets.data" :widget="widget"></WidgetCard>
</WidgetGrid>

### Ereignisse & Steuerung

Sammlung von Widgets, die keine Inhalte in das Dashboard rendern, sondern stattdessen die Kommunikation zum/vom Dashboard ermöglichen, um Aktivitäten zu überwachen und den Dashboard-Zustand zu steuern.

<WidgetGrid>
    <WidgetCard v-for="widget in widgets.events" :widget="widget"></WidgetCard>
</WidgetGrid>

## Drittanbieter-Widgets

Zusätzlich zu den Kern-Widgets haben wir die Architektur, um Drittanbieter-Widgets zu unterstützen. Wenn Sie daran interessiert sind, selbst welche zu entwickeln, können Sie unseren [Leitfaden zur Erstellung von Drittanbieter-Widgets](../contributing/widgets/third-party.md) lesen.

Hier ist eine Liste der Drittanbieter-Widgets, von denen wir wissen, um es Ihnen leichter zu machen, das zu finden, wonach Sie suchen. Diese Widgets werden von uns und der Community erstellt und können über den Node-RED Palette Manager installiert werden.

- [@sumit_shinde_84/ui-webcam](https://flows.nodered.org/node/@sumit_shinde_84/node-red-dashboard-2-ui-webcam): Ermöglicht Benutzern, Webcam-Funktionalität in das Node-RED Dashboard 2.0 zu integrieren, sodass Benutzer Bilder aufnehmen und Videos über verschiedene Kameras streamen können.
- [@flowfuse/ui-iframe](https://flows.nodered.org/node/@flowfuse/node-red-dashboard-2-ui-iframe): Betten Sie eine externe Webseite in Ihr Dashboard ein, indem Sie ein iframe verwenden.
- [@flowfuse/ui-led](https://flows.nodered.org/node/@flowfuse/node-red-dashboard-2-ui-led): Fügt Ihrem Dashboard eine LED-Statusanzeige hinzu.
- [@flowfuse/ui-flowviewer](https://flows.nodered.org/node/@flowfuse/node-red-dashboard-2-ui-flowviewer): Visualisiert gültige Node-RED `flow.json` in einem statischen Flow-Viewer.
- [@flowfuse/user-addon](https://flows.nodered.org/node/@flowfuse/node-red-dashboard-2-user-addon): Fügt Benutzerdaten zu allen Dashboard-Ereignissen unter `msg._client.user` hinzu, wenn Node-RED auf FlowFuse läuft und die "FlowFuse-Benutzerauthentifizierung" aktiviert ist.
- [@colinl/ui-gauge-classic](https://flows.nodered.org/node/@colinl/node-red-dashboard-2-ui-gauge-classic): Rendert ein Mehrnadel-Messgerät auf Ihrem Dashboard mit einem eher "klassischen" visuellen Stil.
- [@fullmetal-fred/cloudflare-auth](https://flows.nodered.org/node/@fullmetal-fred/node-red-dashboard-2-cloudflare-auth): Fügt Benutzerdaten zu allen Dashboard-Ereignissen unter `msg._client.user` hinzu, wenn Node-RED mit Cloudflare-Authentifizierung konfiguriert ist.
- [@omrid01/table-tabulator](https://flows.nodered.org/node/@omrid01/node-red-dashboard-2-table-tabulator): Bietet ein reichhaltiges Tabellen-Widget für das Dashboard, das die beliebte [Tabulator](http://tabulator.info/) JavaScript-Bibliothek erweitert.
- [@revolutionpi/hmi](https://flows.nodered.org/node/@revolutionpi/node-red-dashboard-2-hmi): Ein anpassbarer runder Button, der nach industriellen HMI-Drucktasten gestaltet ist.
- [@cgjgh/ui-scheduler](https://flows.nodered.org/node/@cgjgh/node-red-dashboard-2-ui-scheduler): Ein Planer-Widget für die UI-basierte Zeitplanverwaltung.

### In Entwicklung

Die folgenden sind eine Liste von Knoten, von denen wir wissen, dass sie in aktiver Entwicklung sind, aber noch nicht im Node-RED Palette Manager veröffentlicht wurden.

- [@bartbutenaers/ui-svg](https://github.com/bartbutenaers/node-red-dashboard-2-ui-svg/tree/master): Fügt Ihrem Dashboard ein SVG-Widget hinzu, mit dynamischen Steuerungen über das Plotten und Styling.