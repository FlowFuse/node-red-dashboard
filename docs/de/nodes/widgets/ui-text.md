---
description: Verwenden Sie das ui-text-Widget im Node-RED Dashboard 2.0, um statische oder dynamische Textinhalte elegant auf Ihrem Dashboard anzuzeigen.
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Größe: Steuert die Breite des Buttons in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
    Beschriftung: Der Text, der innerhalb des Buttons angezeigt wird. HTML-Inhalt ist erlaubt.
    Layout: Wählen Sie, wie Sie Ihre Beschriftung (falls definiert) und den Wert anordnen möchten.
    Stil: Kontrollkästchen, um festzulegen, ob benutzerdefinierte Stile für den Text enthalten sein sollen. Wenn dies aktiviert ist, werden die unten stehenden Optionen angezeigt.
    Schriftart: Wenn "Stil" aktiviert ist, wird dies die Schriftart des Textes definieren.
    Textgröße: Wenn "Stil" aktiviert ist, wird dies die Größe des Textes definieren.
    Textfarbe: Wenn "Stil" aktiviert ist, wird dies die Farbe des Textes definieren.
dynamic:
    Beschriftung:
        payload: msg.ui_update.label
        structure: ["String"]
    Layout:
        payload: msg.ui_update.layout
        structure: ["String<'row-left', 'row-center', 'row-right', 'row-spread', 'col-center'>"]
    Schriftart:
        payload: msg.ui_update.font
        structure: ["String"]
    Schriftgröße:
        payload: msg.ui_update.fontSize
        structure: ["String"]
    Farbe:
        payload: msg.ui_update.color
        structure: ["String"]
    Klasse:
        payload: msg.class
        structure: ["String"]
---

<script setup>
    import { ref } from 'vue'
    import FlowViewer from '../../../components/FlowViewer.vue'
    import ExampleSuffix from '../../../examples/ui-text-suffix.json'
    import ExampleHTMLInjection from '../../../examples/ui-text-html-injection.json'
    import TryDemo from "./../../../components/TryDemo.vue"

    const examples = ref({
      'suffix': ExampleSuffix,
      'html-injection': ExampleHTMLInjection
    })
</script>


<TryDemo href="text" title="Demo Ausprobieren">

# Text `ui-text`

</TryDemo>
 
Zeigt ein nicht bearbeitbares Textfeld in der Benutzeroberfläche an. Jede empfangene `msg.payload` aktualisiert den neben der (optional) Beschriftung angezeigten Wert.

## Eigenschaften

<PropsTable/>

## Hinzufügen von Präfixen & Suffixen

Im Dashboard 1.0 gab es eine Option namens `valueFormat`, die es Ihnen ermöglichte, einem `ui-text`-Widget innerhalb der Knotenkonfiguration ein Präfix oder Suffix hinzuzufügen. Obwohl wertvoll, hatte dies viele Sicherheitslücken, daher haben wir uns mit Dashboard 2.0 entschieden, es zu entfernen.

Stattdessen verfolgen wir einen anderen Ansatz und verwenden den eingebauten "template"-Knoten von Node-RED:

<FlowViewer :flow="examples['suffix']" height="200px" />

Was folgendes rendert:

![Hinzufügen eines Suffixes zu einem UI-Text-Element](/images/node-examples/ui-text-prefix.gif "Hinzufügen eines Suffixes zu einem UI-Text-Element"){data-zoomable}
_Beispiel eines gerenderten Suffixes auf einem UI-Text-Element_

Wir tun dies, weil dieser Ansatz weit über das `ui-text`-Widget hinaus verwendet werden kann und HTML-Inhalte in jedes Widget durch [dynamische Eigenschaften](../../user/dynamic-properties.md) injizieren kann.

## HTML rendern

Das `ui-text`-Widget unterstützt HTML-Inhalte (über `msg.payload`). Dies ermöglicht es Ihnen, formatierten Text, Links, Bilder und mehr zu rendern. 

### Statisches HTML

Zum Beispiel, das Injizieren von:

```html
<a href="https://flowfuse.com" target="_blank">FlowFuse</a>
```

als `msg.payload` würde folgendes rendern:

![HTML-Inhalt im Text](/images/node-examples/ui-text-html-injection.png "HTML-Injektion im Text"){data-zoomable}

### `msg.`-Inhalt rendern

Wenn Sie den Inhalt einer `msg.` rendern und diesen dennoch mit HTML umwickeln möchten, können Sie den Standard-`template`-Knoten von Node-RED verwenden, um die HTML-Struktur zu definieren:

<FlowViewer :flow="examples['html-injection']" height="200px"/>

Mit dem Inhalt des `template`-Knotens auf:

![HTML-Inhalt im Text](/images/node-examples/ui-text-html-example.png "HTML-Injektion im Text"){data-zoomable}
_Beispiel eines "template"-Knotens zur Strukturierung von HTML-Inhalten in einem Textknoten_

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Beispiel

![Beispiele für Text](/images/node-examples/ui-text.png "Beispiele für Text"){data-zoomable}
*Beispiele für Varianten von ui-text, die in einem Dashboard gerendert werden.*