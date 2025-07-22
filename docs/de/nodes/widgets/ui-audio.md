---
description: "Spielen Sie dynamisch Audiodateien mit ui-audio im Node-RED Dashboard 2.0 ab."
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Größe: Steuert die Breite der Schaltfläche in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
    Quelle:
        description: Die Quelle ist die URL, von der die Audiodatei abgerufen werden kann.
        dynamic: true 
    Autoplay:
        description: Gibt an, ob die Audiodatei automatisch abgespielt wird.
        dynamic: true
    Schleife:
        description: Gibt an, ob das Audio in einer Schleife abgespielt werden soll, d.h. automatisch wieder von vorne beginnt, wenn es endet.
        dynamic: true
    Stumm:
        description: Gibt an, ob das Audio stummgeschaltet sein soll.
        dynamic: true
controls:
    aktiviert:
        example: true | false
        description: Ermöglicht die Steuerung, ob die Schaltfläche anklickbar ist oder nicht.
dynamic:
    Quelle:
        payload: msg.ui_update.source
        structure: ["String"]
    Autoplay:
        payload: msg.ui_update.autoplay
        structure: ["'on' | 'off'"]
    Schleife:
        payload: msg.ui_update.loop
        structure: ["'on' | 'off'"]
    Stumm:
        payload: msg.ui_update.muted
        structure: ["'on' | 'off'"]
---

<script setup>
    import { ref } from 'vue'

    import TryDemo from "./../../../components/TryDemo.vue"
    
</script>


<TryDemo href="audio-example" title="Demo Ausprobieren">

# Audio `ui-audio`

</TryDemo>

Fügt dem Dashboard einen Audioplayer hinzu.
Der Audioplayer kann vom Benutzer oder durch Steuerungsnachrichten gesteuert werden.

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Steuerungen

<ControlsTable/>