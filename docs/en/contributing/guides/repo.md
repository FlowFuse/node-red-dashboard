---
description: Understand the repository structure of Node-RED Dashboard 2.0 for better code management and contribution.
---

# Repository Structure

The purpose of this page is to give an overview how of Dashboard 2.0 is structured so that you can better navigate around the repository and contribute effectively.

## Core Folders

The repository contains two primary folders:

### /nodes

The `/nodes` directory contains the collection of Node-RED nodes that are available within the Node-RED editor. These nodes are responsible for handling the configuration of the Dashboard, which widgets are shown, and for sending and receiving events to and from the Dashboard, based on their configuration within the Node-RED editor.

### /ui

This folder contains our Vue.js Application. This can be built using `npm run build`, and the output of this build is then copied into the `/dist` directory, where it is served by Node-RED.

