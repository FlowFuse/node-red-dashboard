
<script setup>
    import AddedIn from '../../components/AddedIn.vue';
</script>

# Installing Dashboards on Mobile <AddedIn version="1.9.0" />

FlowFuse Dashboard is built and deployed as a [Progressive Web App](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps). This means whilst it's built as a web application, it can be installed on your mobile device and run as a standalone application, behaving as if it was a native app.

## Installing on Android

To install the Dashboard on an Android device, open the browser and navigate to your Dashboard. From the browser's options, select _"Add to Home Screen"_ (you may be presented directly with an option to _"Install"_ here, depending on your Chrome version):

<img src="../../assets/images/pwa-android-options.jpg" alt="Options presented in Chrome on Android" style="max-width: 300px;margin: auto;">
<em>Options presented in Chrome on Android</em>

This will then prompt you to either "Install" Dashboard as an application, or "Create a Shortcut" on your home screen:

<img src="../../assets/images/pwa-android-install.jpg" alt="Options presented in Chrome on Android" style="max-width: 300px;margin: auto;">
<em>Options presented in Chrome on Android</em>

If you install, the Dashboard will be added to your home screen and can be launched as a standalone application, without the surrounding Browser experience.

## Installing on iOS

To install the Dashboard on an iOS device, open the browser and navigate to your Dashboard. From the browser's options, select _"Add to Home Screen"_:

<img src="../../assets/images/pwa-ios-options.jpg" alt="Options presented in Safari on iOS" style="max-width: 300px;margin: auto;">
<em>Options presented in Safari on iOS</em>

You'll then be prompted to name your application:

<img src="../../assets/images/pwa-ios-install.jpg" alt="Options presented in Safari on Android" style="max-width: 300px;margin: auto;">
<em>Options presented in Safari on iOS</em>

## Customization

### Name

You can personalize your application's name to enhance branding and make it easily recognizable. 

To customize the name, select "Edit Settings" in the Dashboard 2.0 sidebar. Then modify the "Name" field. You may need to restart Node-RED in order for the change to take effect in the application when installed.

### Icon

You can personalize your Dashboard's App Icon to enhance branding and make it easily recognizable. To customize the icon, simply add a URL to the image in the App Icon field under the ui-base configuration. For detailed instructions, visit the [UI Base documentation](/en/nodes/config/ui-base.html#application-icon).
