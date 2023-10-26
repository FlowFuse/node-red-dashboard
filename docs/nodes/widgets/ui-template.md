---
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Scope: Template nodes can be used  for 3 purposes/scopes. Firstly, as a standard HTML widget rendered in a group in the Dashboard. Alternatively, to define custom CSS classes/styling for a page/UI. This scope defines the extent of which any CSS defined in a <style> tage will be applied.
    Class: Appends CSS classes to the widget
    Template: The content of the widget or CSS <style>. If using this for CSS, you do not need to include any <style> tags, as these will be automatically added.
---

<script setup>
</script>

# Text `ui-template`
 
Provide custom HTML (including any [Vuetify components](https://vuetifyjs.com/en/components/all/)) to render in the Dashboard.

## Properties

<PropsTable/>

## Examples

![Examples of UI Template](/images/node-examples/ui-template.png "Examples of UI Template"){data-zoomable}
*Examples of variants of ui-template, one with a functional form, and another showing use of random Vuetify components.*

### Built In Functions 
The template also has access to two built-in functions:

- `send` - Outputs a message (defined by the input to this function call) from this node in the Node-RED flow. 
- `submit` - Send a `FormData` object when attached to a `<form>` element. The created object will consnist of the `name` attributes for each form element, corresponding to their respective `value` attributes.

_Note: Currently restricted to custom HTML only, but there are plans to add `<style>` and `<script>` editors in the future too (track [here](https://github.com/FlowFuse/node-red-dashboard/issues/115))._
### Binding variables to Custom Widgets

If you want to `send` a value onwards from the `ui-template` node, that is defined by some input or action taken on your template, this is currently possible using an exposed variable on the `ui-template` named `value`.

![Example of UI Template using Vuetify's Rating Widget](/images/node-examples/ui-template-rating1.png "Example of UI Template using Vuetify's Rating Widget"){data-zoomable}

Let's consider a use case where a user wants to add [Vuetify's star rating widget](https://vuetifyjs.com/en/components/ratings/):

```html
<v-rating hover :length="5" :size="32" v-model="value"
    active-color="primary" @update:modelValue="send({payload: value})"/>
```

Here, we've used Vue's `v-model` to create a two-way binding of the variable to whatever selection a user makes in the `v-rating` widget. Then, defined an `@update:modelValue` event, such that when that bound value changes, we call our in-built `send(msg)` function, where we can make our `msg` on the fly in the function call itself.


When changed, if wired to a "Debug" node, then we can see the resulting outcome is as follows:

![Example output from using Vuetify's Rating Widget](/images/node-examples/ui-template-rating2.png "Example output from using Vuetify's Rating Widget"){data-zoomable}


