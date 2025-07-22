---
description: Präsentieren Sie Text und Dokumentation elegant mit dem ui-markdown-Viewer im Node-RED Dashboard 2.0.
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Inhalt: Das Markdown, das an die UI übergeben und gerendert wird.
dynamic:
    Klasse:
        payload: msg.class
        structure: ["String"]
---

<script setup>
    import AddedIn from '../../../components/AddedIn.vue';
    import TryDemo from "./../../../components/TryDemo.vue";
</script>


<TryDemo href="markdown-viewer" title="Demo Ausprobieren">

# Markdown-Viewer `ui-markdown`

</TryDemo>

Ermöglicht es, Markdown innerhalb des Node-RED-Editors zu definieren und in die UI zu rendern. Kann zum Rendern von Beschriftungen, Überschriften oder sogar vollständigen Blogartikeln verwendet werden.

Sie können `msg`-Werte in das Markdown einfügen, indem Sie:

::: v-pre
`{{ msg?.payload }}`
:::

Dies wird durch den Wert von `msg?.payload` ersetzt, wenn eine Nachricht an den Knoten gesendet wird. Wenn Sie einen Platzhalterwert haben möchten, bevor eine Nachricht empfangen wird, können Sie verwenden:

::: v-pre
`{{ msg?.payload || 'Platzhalter' }}`
:::

Wenn Sie nach einem schnellen Spickzettel suchen, wie man Markdown schreibt, können Sie FlowFuse's Anleitung [hier](https://flowfuse.com/handbook/development/markdown-how-to/#markdown-how-to) ansehen.

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Beispiel

![Beispiel für gerendertes Markdown](/images/node-examples/ui-markdown.png "Beispiel für gerendertes Markdown"){data-zoomable}
*Beispiel für gerendertes Markdown in einem Dashboard.*

Das obige Beispiel wird mit dem folgenden Markdown gerendert:

````md
# Markdown-Inhalt

## Sekundäre Überschrift

### Dritte Überschrift

Absatz hier...

inline `<code-example />` mit anderem Text auf beiden Seiten

```js
// mehrzeilig
function () {
    console.log('hallo welt')
}
```

- Listenelement 1
- Listenelement 1
- Listenelement 1
- Listenelement 1

[Hyperlink](https://news.bbc.co.uk)

---

> Lorum Ipsum Zitat über zwei Zeilen 

| Überschrift 1 | Überschrift 2 |
|-|-|
| `msg.payload` | {{ msg.payload || 'Platzhalter' }} |
````

## Mermaid-Diagramme <AddedIn version="0.5.0" />

Das `ui-markdown`-Widget unterstützt auch die Einbindung von [Mermaid](https://mermaid.js.org/intro/). Dazu können Sie eine Mermaid-Diagrammdefinition in einem Markdown-Codeblock einfügen, der mit dem Typ `mermaid` definiert ist:

````md
# Hier ist etwas Markdown

und hier ist eine Definition für ein Mermaid-Diagramm:

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```
````

### Dynamische Mermaid-Diagramme

Es ist auch möglich, `msg`-Werte in die Mermaid-Diagrammdefinition einzufügen, indem Sie Mustache-Templating wie bei der Standard-Markdown-Definition verwenden, z.B.:

````md
# Hier ist etwas Markdown

und hier ist eine Definition für ein Mermaid-Diagramm:

```mermaid
pie title NETFLIX
         "Zeit, die mit der Suche nach einem Film verbracht wird" : {{ msg.payload }}
         "Zeit, die mit dem Ansehen verbracht wird" : 10
```
````

Das Dashboard rendert dann das Mermaid-Diagramm anstelle des Codeblocks, z.B.:

![Beispiel eines Mermaid-Diagramms im Dashboard](/images/node-examples/ui-markdown-mermaid.png "Beispiel eines Mermaid-Diagramms im Dashboard"){data-zoomable}
*Beispiel eines Mermaid-Diagramms im Dashboard.*


### Diagramme überschreiben

Sie können `msg` verwenden, um ein Mermaid-Diagramm vollständig neu zu definieren, jedoch müssen Sie den initialen Codeblock mit dem Typ `mermaid` im `ui-markdown`-Editor einfügen, z.B.:

````md
```mermaid
{{ msg.payload }}
```
````

Der Inhalt von `msg.payload` kann in diesem Fall eine Definition eines beliebigen Mermaid-Diagramms sein, ohne den umgebenden Codeblock, z.B.:

```
pie title NETFLIX
         "Zeit, die mit der Suche nach einem Film verbracht wird" : {{ msg.payload }}
         "Zeit, die mit dem Ansehen verbracht wird" : 10
```