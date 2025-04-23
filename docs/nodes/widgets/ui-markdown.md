---
description: Present text and documentation elegantly with ui-markdown viewer in FlowFuse Dashboard.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Content: The markdown to be passed to the UI and rendered
dynamic:
    Class:
        payload: msg.class
        structure: ["String"]
---

<script setup>
    import AddedIn from '../../components/AddedIn.vue';
    import TryDemo from "./../../components/TryDemo.vue";
</script>


<TryDemo href="markdown-viewer">

# Markdown Viewer `ui-markdown`

</TryDemo>

Allows for markdown to be defined within Node-RED editor and rendered into the UI. Can be used for rendering labels, headers or even full blog articles.

You can inject `msg` values into the markdown using:

::: v-pre
`{{ msg?.payload }}`
:::

This will be replaced with the value of `msg?.payload` when a message is received to the node. If you'd like to have a placeholder value before a message is received you can use:

::: v-pre
`{{ msg?.payload || 'Placeholder' }}`
:::

If you're looking for a quick cheat sheet on how to write Markdown, you can check out FlowFuse's guide [here](https://flowfuse.com/handbook/development/markdown-how-to/#markdown-how-to).

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Example

![Example of rendered Markdown](/images/node-examples/ui-markdown.png "Example of rendered Markdown"){data-zoomable}
*Example of rendered markdown in a Dashboard.*

The above example is rendered using the following markdown:

````md
# Markdown Content

## Secondary Header

### Third Header

Paragraph here...

inline `<code-example />` with other text either side

```js
// multiline
function () {
    console.log('hello world')
}
```

- List Item 1
- List Item 1
- List Item 1
- List Item 1

[Hyperlink](https://news.bbc.co.uk)

---

> Lorum Ipsum Quotation Over two lines 

| Header 1 | Header 2 |
|-|-|
| `msg.payload` | {{ msg.payload || 'Placeholder' }} |
````

## Mermaid Charts <AddedIn version="0.5.0" />

The `ui-markdown` widget also supports the injection of [Mermaid](https://mermaid.js.org/intro/). To do so, you can include a mermaid chart definition inside a Markdown fenced code block, defined with the `mermaid` type:

````md
# Here is some Markdown

and here is a definition for a Mermaid Chart:

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```
````

### Dynamic Mermaid Charts

It is also possible to inject `msg` values into the mermaid chart definition using mustache templating as with the standard Markdown definition, e.g:

````md
# Here is some Markdown

and here is a definition for a Mermaid Chart:

```mermaid
pie title NETFLIX
         "Time spent looking for movie" : {{ msg.payload }}
         "Time spent watching it" : 10
```
````

Dashboard will then render the mermaid chart in place of the code block, e.g:

![Example of a Mermaid Chart in Dashboard](/images/node-examples/ui-markdown-mermaid.png "Example of a Mermaid Chart in Dashboard"){data-zoomable}
*Example of a Mermaid Chart in Dashboard.*


### Overriding Charts

You can use `msg` to completely redefine a mermaid chart, however, you must include the initial code fence, with `mermaid` type in the `ui-markdown` editor, e.g:

````md
```mermaid
{{ msg.payload }}
```
````

The content of `msg.payload` in this case can then be a definition of any Mermaid Chart, without the surrounding code fence, e.g:

```
pie title NETFLIX
         "Time spent looking for movie" : {{ msg.payload }}
         "Time spent watching it" : 10
```