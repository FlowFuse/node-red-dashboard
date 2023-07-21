---
props:
    Surface: Controls the color of the navigation and side menus
    Primary: Any interactive element is styled with this color, including buttons, sliders and focus state of input fields.
    Pages - Background: The background color of the full page
    Groups - Background: The background color of any groups rendered on the page
    Groups - Outline: The color of the border of any groups rendered on the page
---

<script setup>
</script>

# Config: UI Theme `ui-theme`

Each page can be assigned a theme, which will be used to render the page. The theme is a collection of colors that control the look and feel of the widgets.

## Colors

<PropsTable/>

## Example

Example Config of ui-theme in Node-RED:

<img src="/images/theme-config.png" alt="Example config for a Theme" width="450"/>

Resulting Dashboard with the theme applied:

![Resulting Dashboard with applied theme](/images/theme-example.png "Resulting Dashboard with applied theme")
