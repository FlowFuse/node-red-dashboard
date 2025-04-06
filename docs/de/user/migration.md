---
description: Migrieren Sie mühelos von Dashboard 1.0 zu 2.0 mit diesem umfassenden Leitfaden, um einen reibungslosen Übergang für Ihre Projekte zu gewährleisten.
---
<script setup>
    import { ref } from 'vue'
    import MigrationWidgetProfile from '../../components/MigrationWidgetProfile.vue'

    import uiButton from './migration/ui_button.json'
    import uiChart from './migration/ui_chart.json'
    import uiControl from './migration/ui_control.json'
    import uiDropdown from './migration/ui_dropdown.json'
    import uiForm from './migration/ui_form.json'
    import uiGauge from './migration/ui_gauge.json'
    import uiLink from './migration/ui_link.json'
    import uiSlider from './migration/ui_slider.json'
    import uiSwitch from './migration/ui_switch.json'
    import uiTemplate from './migration/ui_template.json'
    import uiText from './migration/ui_text.json'
    import uiTextInput from './migration/ui_text_input.json'
    import uiToast from './migration/ui_toast.json'

    const widgets = ref({
        'ui_button': uiButton,
        'ui_chart': uiChart,
        'ui_control': uiControl,
        'ui_dropdown': uiDropdown,
        'ui_form': uiForm,
        'ui_gauge': uiGauge,
        'ui_link': uiLink,
        'ui_slider': uiSlider,
        'ui_switch': uiSwitch,
        'ui_template': uiTemplate,
        'ui_text': uiText,
        'ui_text_input': uiTextInput,
        'ui_toast': uiToast
    })
</script>
    
# Dashboard 1.0 Migrationsleitfaden


## Warum migrieren?

Das [ursprüngliche Node-RED Dashboard](https://flows.nodered.org/node/node-red-dashboard) wird nicht mehr aktiv entwickelt, mit folgendem Hinweis im GH-Repository:

> Dieses Projekt basiert auf Angular v1 - Da dies nun nicht mehr gewartet wird, sollte dieses Projekt als "lebensunterstützend" betrachtet werden. Kleine Patches werden nach bestem Können angewendet, aber es wird keine größeren Funktions-Upgrades geben, und es können grundlegende Sicherheitslücken auftreten.

Dieser Leitfaden soll Benutzern helfen, vom ursprünglichen Dashboard (1.0) zu diesem neuen Projekt, Dashboard 2.0, zu migrieren.

Wir haben, wo möglich, die Funktionalität von Dashboard 1.0 repliziert und in einigen Fällen verbessert. Wenn es Funktionen gibt, die Ihnen fehlen, melden Sie bitte ein Problem im [GitHub-Repository](https://github.com/FlowFuse/node-red-dashboard/issues).

## Wo anfangen

Obwohl wir viel Zeit damit verbracht haben, herauszufinden, wie wir Dashboard 2.0 rückwärtskompatibel mit Dashboard 1.0 machen könnten, ist es uns leider nicht gelungen. Daher ist das erneute Erstellen von Dashboards in Dashboard 2.0 (derzeit) ein manueller Prozess.

### Installation

Sie können beginnen, indem Sie das Dashboard 2.0-Modul über den Palettenmanager von Node-RED installieren - suchen Sie nach `@flowfuse/node-red-dashboard`.

Dashboard 2.0 funktioniert parallel zu Dashboard 1.0, sodass Sie Ihr neues Dashboard parallel zu Ihrem bestehenden erstellen können, wobei das neue Dashboard unter `http://<node-red-host>:<node-red-port>/dashboard` verfügbar ist.

### Migrationsskript

Wir haben einen [Migrationsdienst](https://flowfuse.com/product/dashboard/#migration-service) verfügbar, um Ihnen den Einstieg in die Migration Ihres bestehenden Dashboards 1.0 zu Dashboard 2.0 zu erleichtern.

Obwohl es nicht _alles_ migrieren wird, gibt es Ihnen einen erheblichen Vorsprung und automatisiert den Großteil davon für Sie. Alles, was nicht automatisch migriert werden kann, bleibt im Flow, wird aber deaktiviert, sodass sie als manuelle Eingriffe gekennzeichnet sind.

## Dashboard 1.0 Knoten

Im Folgenden finden Sie einen direkten Vergleich aller verfügbaren Eigenschaften auf jedem Knoten in Dashboard 1.0 und welche Änderungen, falls vorhanden, in Dashboard 2.0 vorgenommen wurden.

### `ui_audio`

<MigrationWidgetProfile :profile="widgets['ui_audio']" />

Sie können den Fortschritt verfolgen und Gedanken und Ideen dazu hier einbringen: [Widget: Audio #52](https://github.com/FlowFuse/node-red-dashboard/issues/52)

### `ui_button`

<MigrationWidgetProfile :profile="widgets['ui_button']" />

### `ui_chart`

<MigrationWidgetProfile :profile="widgets['ui_chart']" />

#### Daten injizieren

Es gibt eine signifikante Überschneidung zwischen Dashboard 1.0 und 2.0, wie Sie Daten in ein Diagramm injizieren können, aber einige wichtige und bemerkenswerte Unterschiede, die die neuen `series`- und `property`-Optionen nutzen.

Rohdaten können mit folgenden Methoden injiziert werden:

- `msg.payload = <value>`
    - In diesem Fall wird der vom Diagramm empfangene Wert als `y`-Wert verwendet, und der `x`-Wert wird automatisch als aktuelles Datum/Uhrzeit hinzugefügt.
- `msg.payload = { y: <value> }`
    - In diesem Fall wird der `y`-Wert wie definiert verwendet, und der `x`-Wert wird als aktuelles Datum/Uhrzeit berechnet.
- `msg.payload = { x: <value>, y: <value> }`
    - In diesem Fall werden die `x`- und `y`-Werte als `x`- und `y`-Werte des Datenpunkts verwendet.
- `msg.payload = [{ x: <value>, y: <value> }, { x: <value>, y: <value> }]`
    - In diesem Fall werden mehrere Punkte in einer einzigen Linie geplottet.
- `msg.payload = [{ x: <value>, y: <value>, line: <value> }, { x: <value>, y: <value>, line: <value> }]`
    - In diesem Fall werden mehrere Punkte geplottet, und wenn die `series`-Eigenschaft auf `property:line` gesetzt ist, wird die `line`-Eigenschaft verwendet, um zu bestimmen, auf welcher Linie jeder Datenpunkt geplottet werden soll.

Wenn Sie Daten in mehrere `series` in Dashboard 1.0 aufteilen möchten, mussten Sie ein entsprechendes `msg.topic` definieren. Dies ist jetzt eine konfigurierbare Option in Dashboard 2.0, mit dem Standardwert wie in Dashboard 1.0. Das bedeutet, dass Sie, wenn Sie mehrere Datenpunkte injizieren möchten, jetzt senden könnten:

```js
msg.payload = [{
    "category": "cat-1",
    "value": 2,
    "date": "2023-10-23"
}, {
    "category": "cat-2",
    "value": 3,
    "date": "2023-10-23"
}, {
    "category": "cat-1",
    "value": 1,
    "date": "2023-10-24"
}, {
    "category": "cat-2",
    "value": 6,
    "date": "2023-10-24"
}]
```

Wo die `series`-Eigenschaft dieses Diagramms auf `key:category` gesetzt werden könnte.

Diagramme speichern jetzt Daten auf Nachrichtenbasis für eine klarere Prüfung und speichern daher nicht wie in [Dashboard 1.0](https://github.com/node-red/node-red-dashboard/blob/master/Charts.md#line-charts-1). Das bedeutet, dass das Format:

```
[{
    "series": ["A", "B"],
    "data": [
        [
            { "x": 1504029632890, "y": 5 },
            { "x": 1504029636001, "y": 4 },
            { "x": 1504029638656, "y": 2 }
        ],
        [
            { "x": 1504029633514, "y": 6 },
            { "x": 1504029636622, "y": 7 },
            { "x": 1504029639539, "y": 6 }
        ]
    ],
    "labels": [""]
}]
```

derzeit _nicht_ unterstützt wird. Wenn dies von besonderer Bedeutung ist, äußern Sie bitte Ihre Unterstützung [hier](https://github.com/FlowFuse/node-red-dashboard/issues/229).

### `ui_colour_picker`

Obwohl es derzeit kein explizites `ui_colour_picker`-Widget gibt, kann das `ui_text_input`-Widget verwendet werden, um dasselbe Ergebnis zu erzielen, indem der _"type"_ auf _"color"_ gesetzt wird.

### `ui_control`

<MigrationWidgetProfile :profile="widgets['ui_control']" />

#### Steuerungsliste

Alle Steuerungen von Dashboard 1.0 werden in Dashboard 2.0 unterstützt, mit Ausnahme der `open/close`-Steuerung für eine Gruppe, die derzeit nicht unterstützt wird.

Detaillierte Dokumentation der verfügbaren Steuerungen und ausgelösten Ereignisse finden Sie [hier](/en/nodes/widgets/ui-control.html).

### `ui_date_picker`

Obwohl es derzeit kein explizites `ui_date_picker`-Widget gibt, kann das `ui_text_input`-Widget verwendet werden, um dasselbe Ergebnis zu erzielen, indem der _"type"_ auf _"date"_,  _"time"_,  _"week"_ oder  _"month"_ gesetzt wird.

Es gibt auch eine [Anfrage](https://github.com/FlowFuse/node-red-dashboard/issues/32) für eine Zeit-/Datumsbereichskomponente, die in Planung ist.

### `ui_dropdown`

<MigrationWidgetProfile :profile="widgets['ui_dropdown']" />

### `ui_form`

<MigrationWidgetProfile :profile="widgets['ui_form']" />

### `ui_gauge`

<MigrationWidgetProfile :profile="widgets['ui_gauge']" />

### `ui_link`

<MigrationWidgetProfile :profile="widgets['ui_link']" />

### `ui_numeric`

Obwohl dieses Widget nicht explizit in Dashboard 2.0 übertragen wurde, ist die Funktionalität weiterhin im `ui-text-input`-Widget verfügbar, wo Sie den _"type"_ auf _"number"_ setzen können.

Sie können den Fortschritt dieser Entwicklung hier verfolgen: [Issue #41](https://github.com/FlowFuse/node-red-dashboard/issues/41)

### `ui_slider`

<MigrationWidgetProfile :profile="widgets['ui_slider']" />

### `ui_switch`

<MigrationWidgetProfile :profile="widgets['ui_switch']" />

### `ui_template`

<MigrationWidgetProfile :profile="widgets['ui_template']" />

### `ui_text`

<MigrationWidgetProfile :profile="widgets['ui_text']" />

### `ui_text_input`

<MigrationWidgetProfile :profile="widgets['ui_text_input']" />


### `ui_toast`

<MigrationWidgetProfile :profile="widgets['ui_toast']" />


## Themen

Wir haben versucht, das Thema in Dashboard 2.0 benutzerfreundlicher zu gestalten, indem wir eine Reihe von freigelegten Eigenschaften und einen umschließenden `ui-theme`-Konfigurationsknoten bereitstellen, der auf der `ui-page`-Ebene zugewiesen wird.

![Beispiel für das Bearbeiten eines Themas](/images/theme-config.png "Beispiel für das Bearbeiten eines Themas"){data-zoomable}
_Beispiel der im Node-RED Editor freigelegten Eigenschaften beim Definieren eines Themas_

Wir haben Pläne, diese Themenkonfiguration weiter auszubauen, sodass Sie auch Rasterabstände, Schriftarten usw. definieren können.

Jede weitere Anpassung des gesamten Layouts und Themas des Dashboards erfordert benutzerdefiniertes CSS, das über den `ui_template`-Knoten injiziert werden kann.

## Layouts

Dashboard 2.0 folgt einer ähnlichen Architektur wie Dashboard 1.0 zur Verwaltung der Hierarchie in der Benutzeroberfläche. Die Unterschiede können gesehen werden, wenn wir sie nebeneinander vergleichen:

| Dashboard 1.0 | Dashboard 2.0 | Unterschied |
| --- | --- | --- |
| `ui-base` | `ui-base` | Wir haben dies als Konfigurationsknoten in Dashboard 2.0 freigelegt, wo eine `ui-page` einem übergeordneten `ui-base` zugewiesen wird. Obwohl noch nicht unterstützt, möchten wir schließlich _mehrere_ Basis-Dashboards in derselben Node-RED-Instanz unterstützen. |
| `ui-tab` | `ui-page` | Zusätzlich zu einer Umbenennung hier haben wir auch die Unterstützung für eine `ui-page` hinzugefügt, um ein definiertes "Thema" zu haben (gesteuert durch unsere neuen `ui-theme`-Konfigurationsknoten). Jede `ui-page` hat auch eine neue _"Layout"_ Option, die seitenweise eingestellt werden kann. |
| `ui-group` | `ui-group` | Derzeit kein "Zusammenklappen"-Verhalten, aber andere Funktionalität ist gleich. |

Wir haben derzeit drei Layouts in Dashboard 2.0 verfügbar:

- [**Raster**](../layouts/types/grid.md) - Modelliert mit dem CSS-`grid`-Layout, ist dies das Standardlayout und verwendet einen festen 12-Spalten-Ansatz, bei dem der Inhalt horizontal mit der Bildschirmbreite skaliert wird, was es viel freundlicher für reaktionsfähige Layouts macht.
- [**Fest**](../layouts/types/fixed.md) - Dies verwendet ein CSS-Flex-Layout und ist das ähnlichste, was wir derzeit zum einzigen Layout in Dashboard 1.0 haben. Verbesserungen sind hier erforderlich, um die "Pack"-Natur des Layouts zu verbessern.
- [**Notizbuch**](../layouts/types/notebook.md) - Nachahmung eines Jupyter-Notizbuch-Layouts, bietet dies Inhalte mit einer maximalen Breite, skaliert mit mobilen Geräten und ermöglicht es, Inhalte vertikal zu stapeln.

Wir haben auch zukünftige Pläne, die Injektion von Drittanbieter-Layouts und sogar clientseitig bearbeitbare Layouts (z.B. Drag-and-Drop-Layout-Design) zu unterstützen.

## Drittanbieter-Widgets

Alle Addons, die für Dashboard 1.0 erstellt wurden (z.B. `ui-svg`, `ui-worldmap`), werden in Dashboard 2.0 nicht unterstützt.

Wir benötigen Community-Beiträge, um sie auf die "Dashboard 2.0 Weise" neu zu erstellen. Wenn Sie daran interessiert sind, uns bei dieser Übung zu helfen, haben wir einen [Leitfaden zum Erstellen benutzerdefinierter Widgets](/en/contributing/widgets/third-party.md), um Ihnen den Einstieg zu erleichtern.