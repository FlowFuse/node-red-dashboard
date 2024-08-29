---
description: Gather user input efficiently with ui-form in Node-RED Dashboard 2.0 for interactive data collection.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Label:
        description: A label shown before the form rows.
        dynamic: true
    Options:
        description: >
            A list of the rows presented in the form. Each row has the following properties:
            <ul>
                <li>Label: A label shown in the form row.</li>
                <li>Name: The name of the form element, which will be used as the key in the <code>msg.payload</code> object.</li>
                <li>Type: The type of input to display. Options - <code>text | multiline | password | email | number | checkbox | switch | date | time</code></li>
                <li>Required: Whether the form element is required to be filled in before the form can be submitted.</li>
        dynamic: true
    Buttons: The text shown on each of the form's buttons. If "cancel" text is left empty, then no cancel button will be shown.
    Two Columns: Will render the form as a two-column layout.
    Reset on Submit: If checked, the form will be reset to an empty state after the form is submitted.
    Topic: Defines how to compute the topic, included in the `msg` object, when the form is submitted.
    Dropdown Options:
        dynamic: true
        description: This list can define options for multiple dropdown/select field in a single form.
dynamic:
    Label:
        payload: msg.ui_update.label
        structure: ["String"]
    Options:
        payload: msg.ui_update.options
        structure: ["Array<Object>"]
    Dropdown Options:
        payload: msg.ui_update.dropdownOptions
        structure: ["Array<{ dropdown: <string>, key: <string>, label: <string> }>"]
    Class:
        payload: msg.class
        structure: ["String"]
---

<script setup>
    import TryDemo from "./../../components/TryDemo.vue";
</script>

<TryDemo href="form">

# Form `ui-form`

</TryDemo>

Adds a form to user interface which helps to collect multiple value from the user on submit button click as an object in `msg.payload`.

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

### Populating Form Data

If you want to set defaults, or pre-fill values in your form, you can do so by passing a `msg.payload` value. This value should be an object, where each key represents the `key` of a form element, and the value represents the default value for that element.

Foe example, if you want to pre-fill a form with a "text" field, with a name, "first_name", you can pass the following `msg`:

```js
msg.payload = {
    "first_name": "John"
}
```

### Defining Form Elements (Options)

If you want to override the configuration for your `ui-form`, and provide details of your elements after your Node-RED flow has been deployed, you can do so by passing a `msg.ui_update.options` value. This value should be an array of objects, where each object represents a form element. Each object should have the following properties:

#### Element: Text

```json
{
    "type": "text",
    "label": "Name",
    "key": "name",
    "required": true
}
```

#### Element: Multiline

```json
{
    "type": "multiline",
    "label": "Name",
    "key": "name",
    "required": true,
    "rows": 4
}
```

#### Element: Password

```json
{
    "type": "password",
    "label": "Password",
    "key": "password",
    "required": true
}
```

#### Element: Email

```json
{
    "type": "email",
    "label": "E-Mail Address",
    "key": "email",
    "required": true
}
```

#### Element: Number

```json
{
    "type": "number",
    "label": "Age",
    "key": "age",
    "required": true
}
```

#### Element: Checkbox

```json
{
    "type": "checkbox",
    "label": "Subscribe to Newsletter",
    "key": "newsletter"
}
```

#### Element: Switch

```json
{
    "type": "switch",
    "label": "Enable Notifications",
    "key": "notifications"
}
```

#### Element: Date

```json
{
    "type": "date",
    "label": "Date of Birth",
    "key": "dob",
    "required": true
}
```

#### Element: Time

```json
{
    "type": "time",
    "label": "Time of Birth",
    "key": "tob",
    "required": true
}
```


## Example

![Example of a Form](/images/node-examples/ui-form.png "Example of two-column Form"){data-zoomable}
*Example of a rendered form in a Dashboard.*
