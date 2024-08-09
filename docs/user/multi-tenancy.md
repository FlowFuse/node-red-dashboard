<script setup>
    import { ref } from 'vue'
    import AuthProvider from '../components/AuthProvider.vue'
    import FlowViewer from '../components/FlowViewer.vue'
    import ExampleSlider from '../examples/multi-tenancy.json'
    import ExampleForm from '../examples/multi-tenancy-form.json'

    const examples = ref({
      'multi-tenant-slider': ExampleSlider,
      'multi-tenant-form': ExampleForm
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

### Authentication Providers

Plugins, such as the [FlowFuse User Addon](https://flowfuse.com/blog/2024/04/displaying-logged-in-users-on-dashboard/), are available to append additional information to the `_client` object. 

These Authentication plugins can be installed via the Node-RED Palette Manager, and often require Node-RED to be setup with a given Authentication provider, separately from Dashboard.

The plugins will append additional information to the `_client` object, such as the `user` object, which details the user's name, email address, and any other information that the Authentication provider has available.

#### FlowFuse User Addon

<AuthProvider img="/images/addon-logos/flowfuse-logo-square.png">
  The <a class="https://flows.nodered.org/node/@flowfuse/node-red-dashboard-2-user-addon">FlowFuse User Plugin</a>, has a requirement for Node-RED to be running on <a href="https://flowfuse.com/">FlowFuse</a> with the <a href="https://flowfuse.com/docs/user/instance-settings/#flowfuse-user-authentication">FlowFuse User Authentication</a> option enabled.

  FlowFuse automatically handles all of the authentication provider setup, and so there is no need for you to configure this yourself.
</AuthProvider>

#### Cloudflare Access

<AuthProvider img="/images/addon-logos/auth-plugin-cloudflare.jpg">
  The <a href="https://flows.nodered.org/node/@fullmetal-fred/node-red-dashboard-2-cloudflare-auth" target="_blank">Cloudflare Access Plugin</a> requires Node-RED to be setup with <a href="https://www.cloudflare.com/en-gb/zero-trust/products/access/" target="_blank">Cloudflare Access</a>, with a Cloudflare tunnel configured for your node-RED instance, and the relevant access policy setup.
</AuthProvider>

#### Authelia Auth

<AuthProvider img="/images/addon-logos/auth-plugin-authelia.png">
  The <a href="https://flows.nodered.org/node/@aikitori/node-red-dashboard-2-authelia-auth" target="_blank">Authelia Auth Plugin</a> plugin adds user data if your Node-RED instance is secured with the open-source authentication server, <a href="https://www.authelia.com/" target="_blank">Authelia</a>.
</AuthProvider>

#### Authentik Auth

<AuthProvider img="/images/addon-logos/auth-plugin-authentik.png">
  This <a href="https://flows.nodered.org/node/@cgjgh/node-red-dashboard-2-authentik-auth" target="_blank">Authentik Plugin</a> plugin adds user data if your Node-RED instance is secured with the open-source authentication server, <a href="https://goauthentik.io/" target="_blank">Authentik</a>.

  This plugin assumes that you have a running Authentik instance and that you have configured it to use a forward auth Proxy Provider as an authentication provider for Node-RED.

  The proxy provider will set the appropriate headers necessary for Dashboard 2.0 to receive the user info from Authentik.
</AuthProvider>

## Configuring Client Data

In the [Dashboard sidebar](./sidebar.md#client-data) within the Node-RED Editor, you will find the "Client Data" tab:

<img data-zoomable style="max-width: 400px; margin: auto;" src="/images/dashboard-sidebar-clientdata.png" alt="Screenshot of an example 'Client Data' tab"/>
<em>Screenshot of an example "Client Data" tab</em>

Client data defines information on the user/client interacting with the Dashboard. This data can be appended to every `msg` a node emits, underneath teh `msg._client` object.

When "Include Client Data" is enabled, every `msg._client` will detail the `socketId` and `socketIp` of any connected users. 

## Examples

### Storing User Data

By default, Dashboard will store the latest messages received against a given node in it's own context stores. However, for nodes that are setup to "Accept Client Data", this is not he case, as it's very memory inefficient for us to automatically store data for _every_ message, for _every_ user against every _widget_.

Instead, the recommended pattern is to use the "change" node, and the built-in `global` and `flow` context stores of Node-RED. We can make use of the `[]` annotation available in the "change" node, to store an object of the latest submitted form for a given user (making the most of the FlowFuse User Addon to get `msg._client.user.username`):

![Screenshot showing the configuration of the "change" node to map dat against a specific user](/images/multiuser-context-store.png "Screenshot showing the configuration of the 'change' node to map dat against a specific user")
_Screenshot showing the configuration of the "change" node to map dat against a specific user_

In a full flow, we'd be able to then do the following:

<FlowViewer :flow="examples['multi-tenant-form']" height="300px"/>


Let's take a look at the steps involved here:

1. When a user loads the page, `ui-event` triggers a `$pageview` event, containing the details of the user viewing the page. 
2. We check our `global` context store to see if we have any data stored against the user's username.
3. If we do, we set `msg.payload` to the contents of the store, otherwise, branch to a "debug" node.
4. Send the `msg.payload` to the form to populate it with the stored values
5. On submit of the form, save the contents of the form to the `global` context store, using the user's username as the key.

### Comparing different communication options

Here we demonstrate three different clients opening the same Dashboard.

The Dashboard consists of three sliders and a chart, and is running on FlowFuse, with the "FlowFuse User Addon" plugin enabled.

Two of the clients are logged in as the same user, and the third, "Another User".

<video controls>
    <source src="https://github.com/FlowFuse/node-red-dashboard/assets/99246719/76601b4c-8d25-451c-b04f-e5ee4cf7efb0" type="video/mp4">
    Your browser does not support the video tag.
</video>

We can see how it's possible to control the interaction of a widget, and how the data emitted from that widget is shared to other components and clients.

1. "Send to All Users" slider pass through a change node which removes the `_client` object from the message, meaning that the data is sent to all clients, as no constraints are defined.

2. "Send to Same User" slider passes through a change node, and has the `socketId` field removed from `msg._client`, leaving just the `user` object. This means the data is sent to any connected clients where the same authenticated user is found.

3. "Single Client" slider just passes it's default output to the "Chart" node, including the full `msg._client` object. This means that the data is only sent to the client (`socketId`) & user (`user`) that interacted with the slider.

Below you will find the flow that runs the above example:

<FlowViewer :flow="examples['multi-tenant-slider']" height="300px"/>
