# Contributing

Contributions are always welcome for Dashboard 2.0. We have a lot of great ideas we want to get built, and we'd love to have your help!

## Installing Locally

1. Fork this repository to your own Github account:

   ![image](https://github.com/bartbutenaers/flowforge-nr-dashboard/assets/14224149/4a02c1ee-d143-4e18-ac47-47e6353ebdd1)

2. Logon to the machine where you have installed Node-RED, and navigate to your .node-red folder.
3. Optionally - when you have installed this dashboard already via your palette - uninstall your current dashboard:
   ```bash
   npm uninstall @flowforge/node-red-dashboard
   ```
4. Clone the forked repository from your Github account (into the *flowforge-nr-dashboard* subfolder of your .node-red folder):
   ```bash
   git clone https://github.com/your_github_account/flowforge-nr-dashboard.git
   ```
5. Install the forked dashboard into your Node-RED system:
   ```bash
   npm install ./flowforge-nr-dashboard
   ```
6. Navigate to the new *flowforge-nr-dashboard* subfolder that has been created automatically in the step 4.
7. Create a new branch for all the files of your forked dashboard:
   ```bash
   git checkout -b name_of_your_new_branch
   ```
8. Make sure all dependent packages (from the package.json file) are automatically installed:
   ```bash
   npm install
   ```
9. Do your required code/config changes in the *flowforge-nr-dashboard* folder.
10. Create a static build of the dashboard Vue component selection, based on Vue CLI (which has been installed in step 8):
    ```bash
    npm run build
    ```
11. Restart Node-RED to see the latest changes in the dashboard.
12. Refresh this newly build dashboard in the browser on http(s)://your_hostname_or_ip_address:1880/dashboard
13. Repeat step 9 to 12 over and over again, to test your changes in the updated dashboard.
14. As soon as all your changes work fine, commit your changes:
    ```bash
    git commit -a -m "Description of your change"
    ```
15. Push the committed changes to the dashboard fork on your Github account:
    ```bash
    git push origin
    ```
16. In your forked dashboard repository on Github, switch to the new branch and create a pull request.
