---
description: "Play dynamically audio files with ui-audio in FlowFuse Dashboard."
props:
    Mode: Select between Audio Player (play audio files from a URL) or Text-to-Speech (speak text using the browser's built-in TTS capabilities).
    UI: The UI (<code>ui-base</code>) that this page will be added to (TTS only). 
    Group: Defines which group of the UI Dashboard this widget will render in (Audio Player only).
    Size: Controls the width of the button with respect to the parent group. Maximum value is the width of the group.
    Source:
        description: The source is the url where the audio file can be fetched from (Audio Player only).
        dynamic: true 
    Autoplay:
        description: Specify whether the audio file will start playing automatically (Audio Player only).
        dynamic: true
    Loop:
        description: Specify whether the audio should be looping, i.e. start playing automatically again when ended (Audio Player only).
        dynamic: true
    Muted:
        description: Specify whether the audio should be muted (Audio Player only).
        dynamic: true
    Voice:
        description: The voice to use for Text-to-Speech (TTS only).
        dynamic: false
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

    import TryDemo from "./../../../components/TryDemo.vue"
    
</script>


<TryDemo href="audio-example">

# Audio `ui-audio`

</TryDemo>

Adds audio capabilities to the dashboard.

## Modes

You can select between two modes: "Audio Player" and "Text-to-Speech".

### Audio Player
If you select the "Audio Player" mode, the node will render an audio player in the dashboard that can play audio files from a URL.
You can specify the URL in the node configuration or dynamically via incoming messages (see Dynamic Properties below)
Additionally, sending a string `payload` to the node will set the audio source to that string and start playing it (if autoplay is enabled).

### Text to Speech (TTS)
If you select the "Text-to-Speech" mode, the node will use the browser's built-in TTS capabilities to speak out text. This requires a user gesture (e.g. click on the dashboard) before it will work (browser security restrictions).

When the `payload` of the incoming message is a string, it will be used as the text to speak.
When the `payload` is an `object`, you can specify additional options (`text` is required):

Example: Say "Hello World" with the "Google US English" voice at 1.1x rate, 0.9x pitch and 88% volume

```json
{
    "payload": {
        "text": "Hello World",
        "voice": "Google US English",
        "rate": 1.1,
        "pitch": 0.9,
        "volume": 88
    }
}
```

NOTES:
- The available voices depend on the browser and operating system. You can get the list of available voices by running `speechSynthesis.getVoices()` in the browser console.
- The `voice` property is optional. This can be the name of a voice (e.g. "Google US English") or an index (e.g. `0` for the first voice, `1` for the second, etc.). Setting `voice` to an empty string `""` will instruct the browser to select the default voice.
- The `lang` property can be used to select a voice that matches the specified language. This is useful if you want to use a specific language but don't know the exact voice name. The browser will select the first voice that matches the specified language. Note: if `voice` is set, it takes precedence over `lang`.

## Playback
The node also supports playback control via incoming messages.
Send a message with the `playback` set to one of the following strings to control playback:
- `play`: Start or resume playback. If the audio is paused, it will resume from the current position.
- `resume`: (alias for `play`)
- `pause`: Pause playback
- `stop`: Stop playback and reset to the beginning

## Properties

<PropsTable/>

## Dynamic Properties

<DynamicPropsTable/>

## Controls

<ControlsTable/>
