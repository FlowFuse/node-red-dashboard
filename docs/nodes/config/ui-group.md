---
description: Group your widgets effectively in Node-RED Dashboard 2.0 for better organization and user navigation.
props:
    Name: Descriptive name for this group, will show in the Node-RED Editor and as a label in the Dashboard.
    Page: The Page (<code>ui-page</code>) that this group will render on.
    Type: Controls whether the group appears as a default group or as a dialog, which needs to be triggered manually using ui-control. You can choose between 'Default' and 'Dialog' types.
    Size: The width and height of the group. Height will always be reinforced by this value, the height is generally a <i>minimum</i> height, and will extend to fit it's content.
    Class: Any custom CSS classes you wish to add to the Group.
    Default State: <ul><li><b>Visibility</b> - Defines the default visibility of this group.</li><li><b>Interactivity</b> - Controls whether the group and it's contents are disabled/enabled when the page is loaded.</li></ul><p>Both of these can be overridden by the user at runtime using a <code>ui-control</code> node.</p>
---

<script setup>
</script>

# Config: UI Group `ui-group`

Each group is rendered within a `ui-page` as part of a [Layout](../../contributing/guides/layouts). Each layout will differ in how those groups are rendered, but fundamentally, a group is a collection of widgets, and generally has a label to categorise the contents of a single group.

## Properties

<PropsTable :hide-dynamic="true"/>

## Type

Title: **Group Type**

Defines how the group will be displayed. Either as a regular (**Default**) group or as a **Dialog** group. A 'Default' group is visible by default, while a 'Dialog' group must be triggered manually using the `ui-control` node [See the documentation](/nodes/widgets/ui-control.html#show-hide). You can choose between these two options based on your layout needs.

### Default Groups:

![Example of how the type 'Default' option looks](/images/node-examples/ui-group-type-default.png "Example of how the type 'Default' option looks"){data-zoomable}
_Example of how the type 'Default' option looks_


### Dialog Groups:

![Example of how the type 'Dialog' option looks](/images/node-examples/ui-group-type-dialog.png "Example of how the type 'Dialog' option looks"){data-zoomable}
_Example of how the type 'Dialog' option looks_

![Example of the flow of the group type configurations](/images/node-examples/ui-group-type-flow.png "Example of the flow of the group type configurations"){data-zoomable}
_Example of the flow of the group type configurations_

<details>
  <summary>Example for a Dialog Group:</summary>
  
  ```json
[
    {
        "id": "0aa38a714b8a3d67",
        "type": "ui-form",
        "z": "9337c17e1a7f6875",
        "name": "",
        "group": "c7871ac53089d535",
        "label": "New User",
        "order": 1,
        "width": 0,
        "height": 0,
        "options": [
            {
                "label": "Name",
                "key": "name",
                "type": "text",
                "required": true,
                "rows": null
            },
            {
                "label": "Admin",
                "key": "isAdmin",
                "type": "switch",
                "required": false,
                "rows": null
            }
        ],
        "formValue": {
            "name": "",
            "isAdmin": false
        },
        "payload": "",
        "submit": "Add",
        "cancel": "clear",
        "resetOnSubmit": true,
        "topic": "topic",
        "topicType": "msg",
        "splitLayout": "",
        "className": "",
        "passthru": false,
        "dropdownOptions": [],
        "x": 220,
        "y": 100,
        "wires": [
            [
                "adbd76ecf97076a1"
            ]
        ]
    },
    {
        "id": "fa4925a5253341ce",
        "type": "ui-control",
        "z": "9337c17e1a7f6875",
        "name": "",
        "ui": "c2e1aa56f50f03bd",
        "events": "all",
        "x": 580,
        "y": 100,
        "wires": [
            []
        ]
    },
    {
        "id": "adbd76ecf97076a1",
        "type": "change",
        "z": "9337c17e1a7f6875",
        "name": "Hide Dialog",
        "rules": [
            {
                "t": "set",
                "p": "payload",
                "pt": "msg",
                "to": "{\"groups\":{\"hide\":[\"Active Development:Dialog Group\"]}}",
                "tot": "json"
            }
        ],
        "action": "",
        "property": "",
        "from": "",
        "to": "",
        "reg": false,
        "x": 390,
        "y": 100,
        "wires": [
            [
                "fa4925a5253341ce",
                "b9d77a856b1be020"
            ]
        ]
    },
    {
        "id": "294ac777d99f5789",
        "type": "ui-button",
        "z": "9337c17e1a7f6875",
        "group": "497106faf38a5190",
        "name": "",
        "label": "Add User (Dialog)",
        "order": 1,
        "width": 0,
        "height": 0,
        "emulateClick": false,
        "tooltip": "",
        "color": "",
        "bgcolor": "",
        "className": "",
        "icon": "",
        "iconPosition": "left",
        "payload": "{\"groups\":{\"show\":[\"Active Development:Dialog Group\"]}}",
        "payloadType": "json",
        "topic": "topic",
        "topicType": "msg",
        "buttonColor": "",
        "textColor": "",
        "iconColor": "",
        "x": 370,
        "y": 140,
        "wires": [
            [
                "fa4925a5253341ce",
                "b9d77a856b1be020"
            ]
        ]
    },
    {
        "id": "b9d77a856b1be020",
        "type": "debug",
        "z": "9337c17e1a7f6875",
        "name": "debug 2572",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "statusVal": "",
        "statusType": "auto",
        "x": 590,
        "y": 140,
        "wires": []
    },
    {
        "id": "c7871ac53089d535",
        "type": "ui-group",
        "name": "Dialog Group",
        "page": "22b5519aa675ad88",
        "width": "6",
        "height": "1",
        "order": 1,
        "showTitle": true,
        "className": "",
        "visible": "true",
        "disabled": "false",
        "groupType": "dialog"
    },
    {
        "id": "c2e1aa56f50f03bd",
        "type": "ui-base",
        "name": "Dashboard",
        "path": "/dashboard",
        "includeClientData": true,
        "acceptsClientConfig": [
            "ui-control",
            "ui-notification"
        ],
        "showPathInSidebar": false,
        "showPageTitle": false,
        "navigationStyle": "icon",
        "titleBarStyle": "default"
    },
    {
        "id": "497106faf38a5190",
        "type": "ui-group",
        "name": "Button Groups",
        "page": "22b5519aa675ad88",
        "width": "6",
        "height": "1",
        "order": 10,
        "showTitle": true,
        "className": "",
        "visible": "true",
        "disabled": "false"
    },
    {
        "id": "22b5519aa675ad88",
        "type": "ui-page",
        "name": "Active Development",
        "ui": "c2e1aa56f50f03bd",
        "path": "/active-development",
        "icon": "forum",
        "layout": "grid",
        "theme": "129e99574def90a3",
        "order": 1,
        "className": "",
        "visible": "true",
        "disabled": "false"
    },
    {
        "id": "129e99574def90a3",
        "type": "ui-theme",
        "name": "Custom Theme",
        "colors": {
            "surface": "#000000",
            "primary": "#ff4000",
            "bgPage": "#f0f0f0",
            "groupBg": "#ffffff",
            "groupOutline": "#d9d9d9"
        },
        "sizes": {
            "pagePadding": "24px",
            "groupGap": "12px",
            "groupBorderRadius": "9px",
            "widgetGap": "6px",
            "density": "default"
        }
    }
]
```
</details>