
<script setup>
    import AddedIn from '../components/AddedIn.vue';
</script>

# Dashboard 2.0 Sidebar

![Screenshot showing the Dashboard 2.0 sidebar in the Node-RED Editor.](/images/dashboard-sidebar.png){data-zoomable}
_Screenshot showing the Dashboard 2.0 sidebar in the Node-RED Editor._

The Dashboard 2.0 sidebar tab is added to the Node-RED sidebar. It is designed to provide a quick overview of the current state of the Dashboard, and support in the overall configuration of the Dashboard.

## Sidebar Tabs

### Layout

Provides an overview of all pages, links, groups and widgets configured for the respective Dashboard. From here you can re-order, re-group and edit any of these elements. There are also shortcuts to "+ Link", "+ Page" and "+ Group" to quickly add new structural elements to the Dashboard.

### Theming

Every page in the Dashboard can have a different theme applied to it. This tab provides an overview of all themes defined on the Dashboard, and allows you to edit or create new themes.

<img data-zoomable style="max-width: 400px; margin: auto;" src="/images/dashboard-sidebar-theme.png" alt="Screenshot showing the 'Theming' tab in the Dashboard 2.0 sidebar"/>
<em>Screenshot of a "Theming" tab, detailing a collection of themes defined on a given Dashboard.</em>

Each theme details how many pages are actively using that theme at present, and a preview of the colour palette used to help differentiate between themes.

### Client Data <AddedIn version="1.10.0" />

Dashboard 2.0 can append data to every `msg` a node emits that details information on the user/client interacting with the Dashboard.

<img data-zoomable style="max-width: 400px; margin: auto;" src="/images/dashboard-sidebar-clientdata.png" alt="Screenshot of an example 'Client Data' tab"/>
<em>Screenshot of an example "Client Data" tab</em>

#### Include Client Data

Defines whether or not any client data is being appended to messages emitted by the Dashboard. If on, then a new `msg._client` value will be available to you which the relevant data included.

You will also find a list here of "Data providers" that are currently active in the Dashboard. In addition to the core provider (which provides `msg._client.socketId`), it will list any plugins that have declared `auth: true` in their `index.html` file (see [Plugins docs](../contributing/plugins/index.md) for more information)

#### Accepts Client Data

Here, on a widget type-by-type basis, you can define whether or not a node will utilise any `msg._client` data passed to it. 

For nodes that have this set, a `msg` injected into the node containing a `_client` object, will only be sent to the respective client. For example, a specific socket connection of `msg._client.socketId` is provided, or a specific user if a `msg._client.user` is provided by a plugin.

If you have checked this on for a node type, but want to send a message to all connections still, make sure you have removed the `msg._client` object from the message before sending. This can be done using a `change` node with a `delete` operation on the `msg._client` object.