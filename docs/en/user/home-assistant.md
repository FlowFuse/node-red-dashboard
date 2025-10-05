# Running Node-RED with Home Assistant

Node-RED can be integrated with Home Assistant (**HA**) in 2 modes:
1. Running Node-RED on an separate host, and connecting to the HA server via HTTP messaging or through the `node-red-contrib-home-assistant-websocket` node-set
   
2. Using the internal Node-RED add-on within HA, which comes as part of the default HA installation

### Configuring FlowFuse Dashboard (Node-RED dashboard 2.0) in Home Assistant

As of today, the Node-RED add-on within HA includes the Node-RED dashboard 1.0 nodes (`node-red-dashboard`), and exposes its base URL (`.../ui`). However, Node-RED Dashboard 1.0 is now deprecated and has been replaced by FlowFuse Dashboard. 

Below are guidelines for installing & configuring FlowFuse Dashboard in the Node-RED add-on within HA

1. Within the Node-RED add-on, install the FlowFuse Dashboard node-set (`@flowfuse/node-red-dashboard`) using the "Manage Palette" option.

2. Create a new iframe container for hosting the FlowFuse Dashboard clients:
  - In HA, go to **Settings->Dashboards->Add dashboard**, select **Webpage**
    
  <img src="../../assets/images/ha1-new-dashboard.png" alt="Adding a new dashboard iFrame" data-zoomable><br>*Adding a new dashboard iFrame*<br><br>
  - Set the base URL of the dashboard, e.g. `<HA host>:1880/endpoint/dashboard`
    
  <img src="../../assets/images/ha2-set-dashboard-url.png" alt="Setting the base URL" data-zoomable><br>*Setting the base URL*<br><br>
   - Set the iframe title & optional icon (which will show in the HA sidebar), and click **Create**
     
  <img src="../../assets/images/ha3-set-title-icon.png" alt="Setting the title & icon" data-zoomable><br>*Setting the title & icon*<br><br>
  - You can now open the FlowFuse Dashboard from the HA sidebar, or directly via the endpoint URL defined above
  
  <img src="../../assets/images/ha4-show-dashboard.png" alt="Viewing the FlowFuse dashboard" data-zoomable><br>*Viewing the FlowFuse dashboard*
