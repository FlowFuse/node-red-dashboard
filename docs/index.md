# Node-RED Dashboard 2.0

Welcome to the documentation for the Node-RED Dashboard 2.0, the successor to the original, and very popular, [Node-RED Dashboard](https://flows.nodered.org/node/node-red-dashboard).

This project was formed by [FlowForge](https://flowforge.com/), as part of efforts to upgrade the original Dashboard to steer away from Angular v1.0 which has long been deprecated. You can read our full statement about _why_ we're building Dashboard 2.0 [here](https://flowforge.com/blog/2023/06/dashboard-announcement/).

## Technologies

### Node-RED

Node-RED is a flow-based programming tool, originally developed by IBM's Emerging Technology Services team and now a part of the JS Foundation. It provides a browser-based editor that makes it easy to wire together flows using the wide range of nodes in the palette that can be deployed to its runtime in a single-click.

### Vue.js v3.0

Vue.js is a progressive, incrementally-adoptable JavaScript framework for building UI on the web. It is a popular choice for building modern web applications.

We chose Vue.js over other popular frameworks like React and Angular because of its shallow learning curve, and ease of use/readibility for non-front-end developers.

### Socket IO

Socket.IO enables real-time, bidirectional and event-based communication. It works on every platform, browser or device, focusing equally on reliability and speed.

In Dashboard 2.0 we use Socket IO to communicate between Node-RED and the Dashboard UI.