---
description: Gruppieren Sie Ihre Widgets effektiv im Node-RED Dashboard 2.0 für eine bessere Organisation und Benutzerführung.
props:
    Name: Beschreibender Name für diese Gruppe, wird im Node-RED Editor und als Label im Dashboard angezeigt.
    Seite: Die Seite (<code>ui-page</code>), auf der diese Gruppe gerendert wird.
    Typ: Bestimmt, ob die Gruppe als Standardgruppe oder als Dialog erscheint, der manuell mit ui-control ausgelöst werden muss. Sie können zwischen den Typen 'Standard' und 'Dialog' wählen.
    Größe: Die Breite und Höhe der Gruppe. Die Höhe wird immer durch diesen Wert verstärkt, die Höhe ist im Allgemeinen eine <i>Mindest</i>höhe und wird erweitert, um den Inhalt zu passen.
    Klasse: Alle benutzerdefinierten CSS-Klassen, die Sie der Gruppe hinzufügen möchten.
    Standardzustand: <ul><li><b>Sichtbarkeit</b> - Definiert die Standardsichtbarkeit dieser Gruppe.</li><li><b>Interaktivität</b> - Bestimmt, ob die Gruppe und ihr Inhalt beim Laden der Seite deaktiviert/aktiviert sind.</li></ul><p>Beide können vom Benutzer zur Laufzeit mit einem <code>ui-control</code>-Knoten überschrieben werden.</p>
---

<script setup>
    
    import { ref } from 'vue'
    import FlowViewer from '../../../components/FlowViewer.vue'
    import ExampleGroupDialog from '../../../examples/group-dialog-type.json'

    const examples = ref({
      'group-dialog': ExampleGroupDialog
    })
</script>

# Konfiguration: UI-Gruppe `ui-group`

Jede Gruppe wird innerhalb einer `ui-page` als Teil eines [Layouts](../../contributing/guides/layouts) gerendert. Jedes Layout unterscheidet sich darin, wie diese Gruppen gerendert werden, aber grundsätzlich ist eine Gruppe eine Sammlung von Widgets und hat im Allgemeinen ein Label, um den Inhalt einer einzelnen Gruppe zu kategorisieren.

## Eigenschaften

<PropsTable :hide-dynamic="true"/>

## Typ

Definiert, wie die Gruppe angezeigt wird. Entweder als reguläre (**Standard**) Gruppe oder als **Dialog** Gruppe. Eine 'Standard' Gruppe ist standardmäßig sichtbar, während eine 'Dialog' Gruppe manuell mit dem `ui-control` Knoten ausgelöst werden muss ([siehe Dokumentation](/en/nodes/widgets/ui-control.html#show-hide)). Sie können zwischen diesen beiden Optionen basierend auf Ihren Layoutanforderungen wählen.

### Standardgruppen

![Beispiel, wie die Option 'Standard' aussieht](/images/node-examples/ui-group-type-default.png "Beispiel, wie die Option 'Standard' aussieht"){data-zoomable}
_Beispiel, wie die Option 'Standard' aussieht_

### Dialoggruppen

![Beispiel, wie die Option 'Dialog' aussieht](/images/node-examples/ui-group-type-dialog.png "Beispiel, wie die Option 'Dialog' aussieht"){data-zoomable}
_Beispiel, wie die Option 'Dialog' aussieht_

<FlowViewer :flow="examples['group-dialog']" height="250px" />