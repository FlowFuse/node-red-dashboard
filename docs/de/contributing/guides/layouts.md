---
description: Erfahren Sie, wie Layout-Manager im Node-RED Dashboard 2.0 helfen können, das Erscheinungsbild Ihres Dashboards effektiv zu organisieren.
---

# Layout-Manager

Die Benutzeroberfläche des Dashboards basiert auf dem zentralen Kern eines "Layout-Managers", der für das Rendern der Benutzeroberfläche und die Verwaltung des Layouts der darin enthaltenen Widgets verantwortlich ist.

Die Navigationshierarchie der Dashboard-Benutzeroberfläche ist wie folgt:

- **UI** - `ui-base` - Mehrere Endpunkte können innerhalb eines einzigen Dashboards bedient werden. Später wird daran gearbeitet, diese als vollständig isolierte Schnittstellen zu behandeln.
- **Seite** - `ui-page` - Alle Seiten innerhalb einer einzigen Benutzeroberfläche sind in der Navigationsleiste (linkes Menü) aufgeführt. Jede Seite ist so konfiguriert, dass sie einen bestimmten "Layout-Manager" verwendet, und dieser Manager wird rendern
- **Gruppe** - `ui-group` - Eine Gruppe ist eine Sammlung von Widgets, die zusammen auf einer Seite positioniert werden. Jedes Seitenlayout definiert, wie diese Gruppen angeordnet sind, aber intern, innerhalb einer Gruppe, ist das Layout immer konsistent und verwendet ein Bootstrap-ähnliches Spaltenlayout (Standardbreite von 6).
- **Widget** - `ui-<widget-name>` - Jedes Widget ist als Vue-Komponente definiert. Sie können ein Beispiel für eine `<widget>.vue`-Datei in unserem [Widgets hinzufügen](../widgets/core-widgets#example-widget-vue) Leitfaden ansehen.


## Basislayouts

`/Layouts/Baseline.vue` definiert die Grundstruktur einer Seite (Header und linke Navigationsleiste). Andere Layouts können dann diese Basis erweitern und definieren, _wie_ die Widgets innerhalb des Standard-`<slot></slot>` der Basis gerendert werden.

Diese Liste von Basislayouts wird wahrscheinlich im Laufe der Zeit wachsen und umfasst derzeit nur eine _sehr_ einfache Startervorlage (Seitenleiste und Header).

## Hinzufügen eines neuen Layout-Managers

### Checkliste 

Wenn Sie Ihren eigenen Layout-Manager definieren möchten, um ihn dem Dashboard hinzuzufügen, müssen Sie sicherstellen, dass Sie die folgenden Schritte abgeschlossen haben:

1. Erstellen Sie `YourLayout.vue` in `/ui/src/layouts/`
1. Fügen Sie Ihr Layout in `/ui/src/layouts/index.js` mit einem bestimmten Schlüssel hinzu, z.B. `your-layout`
1. Fügen Sie Ihr Layout zu den Optionen in `/nodes/config/ui-page_html` innerhalb der `oneditprepare`-Funktion hinzu. Stellen Sie sicher, dass der `value` als der Schlüssel gesetzt ist, den Sie in Schritt 2 verwendet haben.

### Beispiel `.vue` Datei

Das folgende Beispiel kann Ihnen helfen, mit Ihrem eigenen Layout zu beginnen.

Wir haben auch die Struktur des [Widget](./events#widget) Objekts dokumentiert (verwendet in `Zeile 13`), das Details darüber liefert, welche Daten für ein bestimmtes Widget/Komponente verfügbar sind.

```vue:line-numbers {1}
<template>
    <!-- Erweitern Sie die Baseline-Vorlage und rendern Sie den Seitentitel entsprechend -->
    <BaselineLayout :page-title="$route.name">
        <!-- Rufen Sie unsere Widgets ab, die dieser Seite zugewiesen sind (Seiten-ID = $route.meta.id) -->
        <div class="nrdb-layout--flex" v-if="widgets && widgets[$route.meta.id]">
            <!-- Schleife über die Widgets, die für diese Seite definiert sind -->
            <div v-for="w in widgets[$route.meta.id]" :key="w.id">
                <!-- hier umschließen wir alle unsere Widgets in einer Vuetify v-card -->
                <v-card variant="outlined" class="">
                    <!-- zeichnen Sie unser Widget in den #text Slot der v-card -->
                    <template #text>
                        <!-- rendern Sie die Komponente des Widgets und übergeben Sie die Widget-ID, Props und Zustand -->
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
            // unser "ui" vue store enthält eine Sammlung
            //von Widgets, die nach Seiten-ID ($route.meta.id) abgebildet sind
            ...mapState('ui', ['widgets']),
        },
        components: {
            // erweitern Sie die BaselineLayout-Komponente, um
            // den Header und die Navigationsleiste zu erhalten
            BaselineLayout
        }
    }
</script>

<style scoped>
/*
    jeder CSS, den Sie für dieses Layout haben, kann hier platziert werden,
    abgebildet mit den entsprechenden CSS-Klassen
*/
</style>
```