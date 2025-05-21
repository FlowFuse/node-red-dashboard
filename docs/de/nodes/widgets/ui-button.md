---
description: "Schaltflächen erstellen interaktive UIs und können Flows in Node-RED auslösen"
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Größe: Steuert die Breite der Schaltfläche in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
    Symbol:
        description: Rendert ein Material Design-Symbol innerhalb der Schaltfläche. Es ist nicht erforderlich, das "mdi-" Präfix einzuschließen.
        dynamic: true 
    Symbolposition:
        description: Wenn "Symbol" definiert ist, steuert diese Eigenschaft, auf welcher Seite des "Labels" das Symbol gerendert wird.
        dynamic: true
    Label:
        description: Der Text, der innerhalb der Schaltfläche angezeigt wird. Wenn nicht angegeben, wird die Schaltfläche nur das Symbol rendern.
        dynamic: true
    Schaltflächenfarbe:
        description: Schaltflächenfarbe. Wenn nicht angegeben, wird die Standard-Themenfarbe verwendet.
        dynamic: true
    Textfarbe:
        description: Text (Label) Farbe. Wenn nicht angegeben, wird automatisch basierend auf der Schaltflächenfarbe Schwarz oder Weiß berechnet.
        dynamic: true
    Symbolfarbe:
        description: Symbolfarbe. Wenn nicht angegeben, hat es die gleiche Farbe wie Text / Label.
        dynamic: true
    Zeigerhoch-Ereignis aktivieren:
        description: Ermöglicht das Erfassen von Zeigerhoch-Ereignissen auf der Schaltfläche. Die Ausgabe enthält <code>msg._event</code>, das den <i>Typ</i> der Interaktion beschreibt, die das Ereignis verursacht.
        dynamic: false
    Zeigerniedrig-Ereignis aktivieren:
        description: Ermöglicht das Erfassen von Zeigerniedrig-Ereignissen auf der Schaltfläche. Die Ausgabe enthält <code>msg._event</code>, das den <i>Typ</i> der Interaktion beschreibt, die das Ereignis verursacht.
        dynamic: false
    Klick-Ereignis aktivieren:
        description: Ermöglicht das Erfassen von Klick-Ereignissen auf der Schaltfläche, d.h. wenn sowohl das Zeigerniedrig- als auch das Zeigerhoch-Ereignis auftreten, während die Maus innerhalb der Schaltfläche bleibt. Die Ausgabe enthält <code>msg._event</code>, das den <i>Typ</i> der Interaktion beschreibt, die das Ereignis verursacht.
        dynamic: false
    Schaltflächenklick emulieren: Wenn aktiviert, löst jede empfangene Nachricht einen Schaltflächenklick aus und gibt die entsprechende Nutzlast und das Thema aus.
controls:
    aktiviert:
        example: true | false
        description: Ermöglicht die Steuerung, ob die Schaltfläche anklickbar ist oder nicht.
dynamic:
    Symbol:
        payload: msg.ui_update.icon
        structure: ["String"]
    Symbolposition:
        payload: msg.ui_update.iconPosition
        structure: ["String"]
    Label:
        payload: msg.ui_update.label
        structure: ["String"]
    Schaltflächenfarbe:
        payload: msg.ui_update.buttonColor
        structure: ["String"]
    Textfarbe:
        payload: msg.ui_update.textColor
        structure: ["String"]
    Symbolfarbe:
        payload: msg.ui_update.iconColor
        structure: ["String"]
    Klasse:
        payload: msg.ui_update.class
        structure: ["String"]
---

<script setup>
    import { ref } from 'vue'

    import ExampleButtonHold from '../../../examples/ui-button-hold.json'

    import TryDemo from "./../../../components/TryDemo.vue"
    import FlowViewer from '../../../components/FlowViewer.vue'
    
    const examples = ref({
      'hold': ExampleButtonHold
    })
</script>


<TryDemo href="button-example" title="Demo Ausprobieren">

# Schaltfläche `ui-button`

</TryDemo>

Fügt Ihrem Dashboard eine anklickbare Schaltfläche hinzu.

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Steuerungen

<ControlsTable/>

## Beispiel

### Einfache Schaltfläche

![Beispiel einer Schaltfläche](/images/node-examples/ui-button.png "Beispiel einer Schaltfläche"){data-zoomable}
*Beispiel einer gerenderten Schaltfläche in einem Dashboard.*

### Haltezeit messen

Es ist möglich, eine Schaltfläche so zu konfigurieren, dass sie `Zeigerniedrig`- und `Zeigerhoch`-Ereignisse ausgibt. Damit ist es möglich zu messen, wie lange eine Schaltfläche gedrückt gehalten wird.

<video controls height="200px">
    <source src="/videos/demo-button-hold.mp4" type="video/mp4">
</video>

Der Flow, um diese Demo zu erreichen, ist wie folgt:

<FlowViewer :flow="examples['hold']" height="200px"/>