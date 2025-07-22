---
description: Integrieren Sie ui-dropdown im Node-RED Dashboard 2.0 für Benutzerauswahlen und dynamische Inhaltsfilterung.
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Größe: Steuert die Breite des Dropdowns in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
    Beschriftung:
        description: Der Text, der links vom Dropdown angezeigt wird. HTML-Inhalt ist erlaubt.
        dynamic: true
    Optionen:
        description: Eine Liste der im Dropdown verfügbaren Optionen. Jede Zeile definiert eine 'Beschriftung' (im Dropdown angezeigt) und eine `Wert`-Eigenschaft (bei Auswahl ausgegeben).
        dynamic: true
    Mehrfachauswahl erlauben:
        description: Ob ein Benutzer mehrere Optionen auswählen kann, wenn ja, werden Kontrollkästchen angezeigt und der Wert wird in einem Array ausgegeben.
        dynamic: true
    Chips:
        description: Zeigt ausgewählte Elemente in Chips an.
        dynamic: false        
    Löschbar:
        description: Auswahl mit Schaltfläche löschen.
        dynamic: false
    Suche erlauben:
        description: Ermöglicht dem Benutzer, einen neuen Wert einzugeben, der die Liste der möglichen Werte zum Auswählen filtert.         
    Nachrichten-Trigger:
        description: Gibt an, wann eine Ausgabemeldung gesendet werden soll. Bei jeder Änderung oder wenn das Dropdown geschlossen wird.
dynamic:
    Beschriftung:
        payload: msg.ui_update.label
        structure: ["String"]
    Optionen:
        payload: msg.ui_update.options
        structure: ["Array<String>", "Array<{value: String}>", "Array<{value: String, label: String}>"]
    Mehrfachauswahl erlauben:
        payload: msg.ui_update.multiple
        structure: ["Boolean"]
    Klasse:
        payload: msg.ui_update.class
        structure: ["String"]
    Nachrichten-Trigger:
        payload: msg.ui_update.msgTrigger
        structure: ["String"]
---

<script setup>
    import TryDemo from "./../../../components/TryDemo.vue";
</script>

<TryDemo href="dropdown" title="Demo Ausprobieren">

# Dropdown `ui-dropdown`

</TryDemo>

Fügt Ihrem Dashboard ein Dropdown hinzu, das Werte in Node-RED unter `msg.payload` ausgibt, sobald sich sein Wert ändert.

## Programmatische Auswahlen

Sie können dynamisch Auswahlen für dieses Dropdown treffen, indem Sie den jeweiligen `Wert` an `msg.payload` übergeben.

### Einzelauswahl

Um eine Einzelauswahl zu treffen, übergeben Sie den `Wert` der Option als `msg.payload`, z.B. `msg.payload = "option1"`.

### Mehrfachauswahl

Um eine Mehrfachauswahl zu treffen, müssen Sie zuerst "Mehrfachauswahl erlauben" auf dem Knoten aktiviert haben, dann können Sie ein Array von `Wert` der jeweiligen Optionen als `msg.payload` übergeben, z.B. `msg.payload = ["option1", "option2"]`.

### Auswahl löschen

Um eine Auswahl für ein Dropdown zu löschen, übergeben Sie ein leeres Array `[]` als `msg.payload`.

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Beispiel

![Beispiel eines Dropdowns](/images/node-examples/ui-dropdown.png "Beispiel eines Dropdowns"){data-zoomable}
*Beispiel eines gerenderten Dropdowns in einem Dashboard.*

![Beispiel eines Dropdowns mit Mehrfachauswahl](/images/node-examples/ui-dropdown-multi-chips-clearable.png "Beispiel eines Dropdowns mit Mehrfachauswahl"){data-zoomable}
*Dropdown mit Mehrfachauswahl, Chips und Löschtaste.*