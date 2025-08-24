# Running Node-RED within Home Assistant
Author: omrid01, 24-Aug-2025

Node-RED (**NR**) can be integrated with Home Assistant (**HA**) in 2 main ways:
- Running NR on an external host, and connecting to the HA server via HTTP messaging or the `node-red-contrib-home-assistant-websocket` node-set 
- Using the internal NR add-on within HA, which by default is part of the HA installation

### Configuring Node-RED dashboard 2.0 in Home Assistant
As of today, the NR add-on within HA includes the NR dashboard 1.0 nodes (`node-red-dashboard`), and exposes its URL (`.../ui`). 

NR dashboard 1.0 is now deprecated and replaced by dashboard 2.0. Following are instructions for installing & configuring dashboard 2.0 into the NR add-on in HA

1. Within the NR add-on, install the dashboard 2.0 node-set (`@flowfuse/node-red-dashboard`)

2. Create a new iframe container for hosting the dashboard 2.0 clients:
- In HA, go to **Settings->Dashboards->Add dashboard**, select **Webpage**

![Image](https://github.com/user-attachments/assets/6b6323f1-e3a3-41d2-8893-c4a79a2cb341)

- Set the URL of the dashboard, e.g. `<HA host>:1880/endpoint/dashboard`

![Image](https://github.com/user-attachments/assets/9815d378-ca6c-458c-8de4-33b40934bd05)
- Set the iframe a title & optional icon (which will show in the HA sidebar), and click **Create**

![Image](https://github.com/user-attachments/assets/38428345-cac0-4be7-b1fc-33c741c2db95)

- You can now open the NR dashboard 2.0 from the HA sidebar, or directly via the endpoint URL defined above

![Image](https://github.com/user-attachments/assets/45beadf3-bfe1-45da-83c8-561191387d2e)
