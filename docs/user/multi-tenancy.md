<script setup>
    import { ref } from 'vue'
    import FlowViewer from '../components/FlowViewer.vue'
    import ExampleSlider from '../examples/multi-tenancy.json'

    const examples = ref({
      'multi-tenant-slider': ExampleSlider
    })
</script>

# Building Multi-Tenant Dashboards

We have two fundamental design patterns when building a Dashboard:

- **Single Source of Truth:** All users of your Dashboard will see the same data. This is useful for industrial IoT or Home Automation applications.
- **Multi Tenancy:** Data shown in a particular widget is unique to a given client/session/user. This represents a more traditional web application, where each user has their own session and associated data.

By default, any data passed to a Dashboard node is broadcast to all connected clients, and therefore visible to all users ("Single Source of Truth"). In Industrial IoT type use-cases, this is very useful where you may have a chart showing data about a given piece of equipment.

In other cases though, you may wish to send data to just a single client/user, this is where multi-tenancy comes in, and allows you to define constraints on which clients receive particular data.

You can read more about the design patterns [here](../getting-started.md#design-patterns).

## Understanding Client Data

With "Include Client Data" enabled, every `msg` a node emits will have a `_client` object appended to it. This object will detail any available information about the client/user interacting with a given Dashboard.

### Core Client Data

Out of the box, Dashboard will append two piece of information to the `_client` object:

- `socketId`: The unique ID of the socket connection that the client is using to interact with the Dashboard.
- `socketIp`: The IP address of the client interacting with the Dashboard.

### Plugin Data Providers

Plugins, such as the [FlowFuse User Addon](https://flowfuse.com/blog/2024/04/displaying-logged-in-users-on-dashboard/), are available to append additional information to the `_client` object. 

These Authentication plugins can be installed via the Node-RED Palette Manager, and often require Node-RED to be setup with a given Authentication provider, separately from Dashboard. For example, for the FlowFuse User Addon, it is a requirement for Node-RED to be running on FlowFuse with the ["FlowFuse User Authentication"](https://flowfuse.com/docs/user/instance-settings/#flowfuse-user-authentication) option enabled.

The plugins will append additional information to the `_client` object, such as the `user` object, which details the user's name, email address, and any other information that the Authentication provider has available.

## Configuring Client Data

In the [Dashboard sidebar](./sidebar.md#client-data) within the Node-RED Editor, you will find the "Client Data" tab:

<img data-zoomable style="max-width: 400px; margin: auto;" src="/images/dashboard-sidebar-clientdata.png" alt="Screenshot of an example 'Client Data' tab"/>
<em>Screenshot of an example "Client Data" tab</em>

Client data defines information on the user/client interacting with the Dashboard. This data can be appended to every `msg` a node emits, underneath teh `msg._client` object.

When "Include Client Data" is enabled, every `msg._client` will detail the `socketId` and `socketIp` of any connected users. 

## Simple Example

Here we demonstrate three different clients opening the same Dashboard.

The Dashboard consists of three sliers and a chart, and is running on FlowFuse, with the "FlowFuse User Addon" plugin enabled.

Two of the clients are logged in as the same user, and the third, "Another User".

<video controls>
    <source src="https://github.com/FlowFuse/node-red-dashboard/assets/99246719/76601b4c-8d25-451c-b04f-e5ee4cf7efb0" type="video/mp4">
    Your browser does not support the video tag.
</video>

We can see how it's possible to control the interaction of a widget, and how the data emitted from that widget is shared to other components and clients.

The first, "Send to All Users" slider pass through a change node which removes the `_client` object from the message, meaning that the data is sent to all clients, as no constraints are defined.

The second, "Send to Same User" slider passes through a change node, and has the `socketId` field removed from `msg._client`, leaving just the `user` object. This means the data is sent to any connected clients where the same authenticated user is found.

Finally, the "Single Client" slider just passes it's default output to the "Chart" node, including the full `msg._client` object. This means that the data is only sent to the client (`socketId`) & user (`user`) that interacted with the slider.

Below you will find the flow that runs the above example:

<FlowViewer :flow="examples['multi-tenant-slider']" height="300px"/>
