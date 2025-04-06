---
description: The File Upload widget allows users to upload files to Node-RED.
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the dropdown with respect to the parent group. Maximum value is the width of the group.
    Label:
        description: The text shown to the user, explaining what the user should upload.
    Icon:
        description: Defaults to "paperclip". The icon shown to the left of the input field. See the full list of icons <a href="https://pictogrammers.com/library/mdi/" target="_blank">here</a>.
    Accept:
        description: String representation of the "allow" file type selectors. See full list of options <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept#unique_file_type_specifiers" target="_blank">here</a>.  
    Multiple:
        description: Allow end-users to upload multiple files at once. Each file will be sent as a unique message.
---

<script setup>
    import AddedIn from '../../../components/AddedIn.vue';
    import TryDemo from "./../../../components/TryDemo.vue";
</script>

<TryDemo href="file-input">

# File Upload <AddedIn version="1.12.0" />

</TryDemo>

The File Upload widget allows users to upload files to Node-RED. The widget can be configured to accept specific file types and allow for multiple files.

## Properties

<PropsTable/>

## Output

```js
{
    payload: <Buffer>,
    file: {
        name: <String>,
        type: <String>,
        size: <Number>
    },
    topic: <String>,
}
```

## Current Limitations

_Currently_, the File Upload widget is limited by a maximum file size defined by the Websocket connection. The default maximum here is 5MB. This can be increased by modifying the `maxHttpBufferSize` property in the `settings.js` file in the Node-RED installation directory:

```
dashboard: {
    maxHttpBufferSize: 1e8 // size in bytes, example: 100 MB
}
```

Read more about Dashboard configuration in the `settings.js` [here](/en/user/settings.html#maxhttpbuffersize).

Note that we do have plans to improve this behavior by chunking files into smaller parts, and reassembling them on the server side. This will allow for larger files to be uploaded, and will be implemented in a future release.

## Example

![Example of a File Upload](/images/node-examples/ui-file-input-select.png "Example of a File Upload"){data-zoomable}
_Screenshot to show an example file input, when ready to have a file selected_

![Example of a File Upload](/images/node-examples/ui-file-input-chosen.png "Example of a File Upload"){data-zoomable}
_Screenshot to show an example file input, when a file has been selected, and is ready for "Upload"_
