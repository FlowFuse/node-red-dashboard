---
description: Erleichtern Sie die einfache Auswahl von Optionen mit ui-radio-group im Node-RED Dashboard 2.0 für optimierte Benutzerentscheidungen.
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Beschriftung:
        description: Der Text, der über der Radio-Gruppe angezeigt wird, um den Benutzer über die verfügbaren Optionen zu informieren. HTML-Inhalt ist erlaubt.
        dynamic: true
    Optionen:
        description: Eine Liste der in der Radio-Gruppe verfügbaren Optionen. Jede Zeile definiert eine `Beschriftung` (wird neben jedem Radio-Button angezeigt) und eine `Wert`-Eigenschaft (wird bei Auswahl ausgegeben).
        dynamic: true
    Spalten:
        description: Die Anzahl der Rasterspalten, in denen die Radio-Gruppe gerendert wird. Dies ist nützlich, wenn Sie die Optionen horizontal rendern möchten oder wenn Sie viele Optionen haben und vertikalen Platz sparen möchten.
        dynamic: true
    Thema: Das `msg.topic`, das in allen ausgegebenen Werten enthalten sein wird.
dynamic:
    Beschriftung:
        payload: msg.ui_update.label
        structure: ["String"]
    Optionen:
        payload: msg.ui_update.options
        structure: ["Array<String>", "Array<{value: String}>", "Array<{value: String, label: String}>"]
    Klasse:
        payload: msg.ui_update.class
        structure: ["String"]
    Spalten:
        payload: msg.ui_update.columns
        structure: ["Number"]
---

<script setup>
    import TryDemo from "./../../../components/TryDemo.vue";
</script>


<TryDemo href="radio-group" title="Demo Ausprobieren">

# Radio-Gruppe `ui-radio-group`

</TryDemo>

Fügt Ihrem Dashboard eine Radio-Gruppe hinzu, die Werte in Node-RED unter `msg.payload` ausgibt, sobald ein Wert ausgewählt wird.

## Programmatische Auswahlen

Sie können dynamisch Auswahlen für dieses Dropdown treffen, indem Sie den jeweiligen `Wert` an `msg.payload` übergeben, z.B. `msg.payload = "option1"`.

### Auswahl löschen

Um eine Auswahl für ein Dropdown zu löschen, übergeben Sie einen leeren String `""` als `msg.payload`.

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Beispiel

![Beispiel einer Radio-Gruppe](/images/node-examples/ui-radio.png "Beispiel einer Radio-Gruppe"){data-zoomable}
*Beispiel einer gerenderten Radio-Gruppe in einem Dashboard mit 2 Spalten.*