---
description: "Play dynamically audio files with ui-audio in Node-RED Dashboard 2.0."
props:
    Group: Defines which group of the UI Dashboard this widget will render in.
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Source:
        description: The source is the url where the audio file can be fetched..
        dynamic: true 
    Autoplay:
        description: Specify whether the audio file will start playing automatically.
        dynamic: true
    Loop:
        description: Specify whether the audio should be looping, i.e. start playing automatically again when ended.
        dynamic: true
    Muted:
        description: Specify whether the audio should be muted.
        dynamic: true
controls:
    enabled:
        example: true | false
        description: Allow control over whether or not the button is clickable.
dynamic:
    Source:
        payload: msg.ui_update.source
        structure: ["String"]
    Autoplay:
        payload: msg.ui_update.autoplay
        structure: ["'on' | 'off'"]
    Loop:
        payload: msg.ui_update.loop
        structure: ["'on' | 'off'"]
    Muted:
        payload: msg.ui_update.muted
        structure: ["'on' | 'off'"]
---

<script setup>
    import { ref } from 'vue'

    import ExampleButtonHold from '../../examples/ui-button-hold.json'

    import TryDemo from "./../../components/TryDemo.vue"
    import FlowViewer from '../../components/FlowViewer.vue'
    
    const examples = ref({
      'hold': ExampleButtonHold
    })
</script>


<TryDemo href="button-example">

# Audio `ui-audio`

</TryDemo>

Adds an audio player to the dashboard.
The audio player can be controlled by the user or by control messages.

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Controls

<ControlsTable/>
