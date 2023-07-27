---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Content: The markdown to be passed to the UI and rendered
---

<script setup>
</script>

# Markdown Viewer `ui-markdown`

Allows for markdown to be defined within Node-RED editor and rendered into the UI. Can be use for rendering labels, headers or even full blog articles.

If you're looking for a quick cheat sheet on how to write Markdown, you can check out FlowForge's guide [here](https://flowforge.com/handbook/development/markdown-how-to/#markdown-how-to).

## Properties

<PropsTable/>

## Example

![Example of rendered Markdown](../../assets/images/node-examples/ui-markdown.png "Example of rendered Markdown"){data-zoomable}
*Example of rendered markdown in a Dashboard.*

The above example is rendered using the following markdown:

```md
# Markdown Content

## Secondary header

### Third Header

Goes here...

`<code-example />`

- List Item 1
- List Item 1
- List Item 1
- List Item 1

[Hyperlink](https://url.here)

---

> Lorum Ipsum Quotation Over two lines 
```
