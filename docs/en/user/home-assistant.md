# Running Node-RED with Home Assistant

Node-RED can be integrated with Home Assistant (**HA**) in 2 modes:
1. Running Node-RED on an separate host, and connecting to the HA server via HTTP messaging or the `node-red-contrib-home-assistant-websocket` node-set 
2. Using the internal Node-RED add-on within HA, which comes by default as part of the HA installation

### Configuring FlowFuse Dashboard (Node-RED dashboard 2.0) in Home Assistant

As of today, the Node-RED add-on within HA includes the Node-RED dashboard 1.0 nodes (`node-red-dashboard`), and exposes its base URL (`.../ui`). However, Node-RED Dashboard 1.0 is now deprecated and has been replaced by FlowFuse Dashboard. 

Below are guidelines for installing & configuring FlowFuse Dashboard in the Node-RED add-on within HA

1. Within the Node-RED add-on, install the FlowFuse Dashboard node-set (`@flowfuse/node-red-dashboard`) using the "Manage Palette" option.

2. Create a new iframe container for hosting the FlowFuse Dashboard clients:
- In HA, go to **Settings->Dashboards->Add dashboard**, select **Webpage**

![Image](https://github.com/user-attachments/assets/6b6323f1-e3a3-41d2-8893-c4a79a2cb341)

- Set the URL of the dashboard, e.g. `<HA host>:1880/endpoint/dashboard`

![Image](https://github.com/user-attachments/assets/9815d378-ca6c-458c-8de4-33b40934bd05)

- Set the iframe title & optional icon (which will show in the HA sidebar), and click **Create**

![Image](https://github.com/user-attachments/assets/38428345-cac0-4be7-b1fc-33c741c2db95)

- You can now open the FlowFuse Dashboard from the HA sidebar, or directly via the endpoint URL defined above

![Image](https://github.com/user-attachments/assets/45beadf3-bfe1-45da-83c8-561191387d2e)
