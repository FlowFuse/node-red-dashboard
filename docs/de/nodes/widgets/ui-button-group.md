---
description: Erstellen Sie gruppierte Schaltflächenoberflächen im Node-RED Dashboard 2.0 für effizientes Aktionsmanagement.
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Größe: Steuert die Breite der Schaltfläche in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
    Label:  
        description: Der Text, der innerhalb der Schaltfläche angezeigt wird. HTML-Inhalt ist erlaubt.
        dynamic: true
    Erscheinungsbild: Geben Sie an, ob die Form des Widgets rechteckig oder mit abgerundeten Ecken sein soll.
    Verwenden Sie Themenfarben: Geben Sie an, ob die Themenfarben verwendet werden sollen. Wenn nicht aktiv, können für jede Option separat benutzerdefinierte Farben angegeben werden.
    Optionen:
        description: Geben Sie an, welche Optionen angezeigt werden sollen. Jede Option kann ein Label, ein Symbol, einen Wert und eine Farbe angeben. HTML-Inhalt ist für die Labels erlaubt.
        dynamic: true
    Thema: Der Text, der im msg.topic-Feld gesendet werden muss.
    Passthrough: Geben Sie an, ob Eingabenachrichten als Ausgabenachrichten weitergeleitet werden sollen.
    Klasse:
        payload: msg.ui_update.class
        structure: ["String"]
controls:
    aktiviert:
        example: true | false
        description: Ermöglicht die Steuerung, ob die Schaltfläche anklickbar ist oder nicht.
dynamic:
    Deaktivierter Zustand:
        payload: msg.enabled
        structure: ["Boolean"]
    Label:
        payload: msg.ui_update.label
        structure: ["String"]
    Optionen:
        payload: msg.ui_update.options
        structure: ["Array<String>", "Array<{value: String}>", "Array<{value: String, label: String}>", "Array<{value: String, icon: String}>"]
---

<script setup>
    import AddedIn from '../../../components/AddedIn.vue';
    import TryDemo from "./../../../components/TryDemo.vue"
</script>

<TryDemo href="button-group" title="Demo Ausprobieren">

# Schaltfläche `ui-button-group` <AddedIn version="1.3.0" />

</TryDemo>

Fügt Ihrem Dashboard eine Reihe von Schaltflächen hinzu, die als Multi-State-Schalter fungieren. Wenn eine einzelne Schaltfläche angeklickt wird, wird sie aktiv und alle anderen Schaltflächen in der Gruppe werden inaktiv, wobei der neu ausgewählte Wert vom Knoten in Node-RED ausgegeben wird.

Die ausgewählte Option kann durch Senden eines `msg.payload` mit dem Wert der auszuwählenden Schaltfläche festgelegt werden.

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Beispiele

![Beispiele einer Schaltflächengruppe](/images/node-examples/ui-button-group.png "Beispiel einer Schaltflächengruppe"){data-zoomable}
*Beispiel einiger gerenderter Schaltflächengruppen in einem Dashboard.*