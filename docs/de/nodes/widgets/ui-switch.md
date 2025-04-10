---
description: Verwenden Sie das ui-switch-Widget im Node-RED Dashboard 2.0, um interaktive Umschaltsteuerungen für dynamische Dashboard-Interaktionen zu erstellen.
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Größe: Steuert die Breite des Buttons in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
    Beschriftung:
        description: Der Text, der innerhalb des Buttons angezeigt wird. HTML-Inhalt ist erlaubt.
        dynamic: true
    Layout:
        description: Definiert, wie die Beschriftung und der Schalter angeordnet sind. Benutzer können zwischen verschiedenen Layout-Optionen wählen, wie z.B. Elemente links ausrichten, links umgekehrt, gleichmäßig verteilen oder gleichmäßig verteilen, aber in umgekehrter Reihenfolge.
        dynamic: true
    Klickbar:
        description: Der klickbare Bereich (der zum Umschalten des Schalters führt).
        dynamic: true
    Ein-Icon:
        description: Wenn bereitgestellt, wird dieses <a href="https://pictogrammers.com/library/mdi/" target="_blank">Material Design Icon</a> den Standardschalter im "Ein"-Zustand ersetzen. Es ist nicht notwendig, das <code>mdi</code>-Präfix einzuschließen.
        dynamic: true
    Aus-Icon:
        description: Wenn bereitgestellt, wird dieses <a href="https://pictogrammers.com/library/mdi/" target="_blank">Material Design Icon</a> den Standardschalter im "Aus"-Zustand ersetzen. Es ist nicht notwendig, das <code>mdi</code>-Präfix einzuschließen.
        dynamic: true
    Ein-Farbe:
        description: Wenn mit einem Icon bereitgestellt, wird diese Farbe für das Icon im "Ein"-Zustand verwendet.
        dynamic: true
    Aus-Farbe:
        description: Wenn mit einem Icon bereitgestellt, wird diese Farbe für das Icon im "Aus"-Zustand verwendet.
        dynamic: true
    Durchreichen: Wenn aktiviert, wird das Widget die Eingabenachricht an die Ausgabe weiterleiten.
    Indikator: Nur verfügbar, wenn "Durchreichen" auf <code>false</code> gesetzt ist. Definiert, ob der Schalter den Status der Ausgabe oder eine bereitgestellte Eingabe über <code>msg.payload</code> anzeigt.
    Ein-Payload: Der Typ & Wert, der in <code>msg.payload</code> ausgegeben wird, wenn der Schalter eingeschaltet wird.
    Aus-Payload: Der Typ & Wert, der in <code>msg.payload</code> ausgegeben wird, wenn der Schalter ausgeschaltet wird.
controls:
    aktiviert:
        example: true | false
        description: Ermöglicht die Steuerung darüber, ob der Schalter über die UI umgeschaltet werden kann.
dynamic:
    Klasse:
        payload: msg.ui_update.class
        structure: ["String"]
    Beschriftung:
        payload: msg.ui_update.label
        structure: ["Boolean"]
    Layout:
        payload: msg.ui_update.layout
        structure: ["String"]
    Klickbar:
        payload: msg.ui_update.clickableArea
        structure: ["String"]
    Durchreichen:
        payload: msg.ui_update.passthru
        structure: ["Boolean"]
    Indikator:
        payload: msg.ui_update.decouple
        structure: ["Boolean"]
    Ein-Farbe:
        payload: msg.ui_update.oncolor
        structure: ["String"]
    Aus-Farbe:
        payload: msg.ui_update.offcolor
        structure: ["String"]
    Ein-Icon:
        payload: msg.ui_update.onicon
        structure: ["String"]
    Aus-Icon:
        payload: msg.ui_update.officon
        structure: ["String"]
---

<script setup>
    import TryDemo from "./../../../components/TryDemo.vue";
</script>


<TryDemo href="switch" title="Demo Ausprobieren">

# Umschalter `ui-switch`

</TryDemo>

Fügt der Benutzeroberfläche einen Umschalter hinzu.

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Steuerungen

<ControlsTable/>

## Beispiel

![Beispiel eines Umschalters](/images/node-examples/ui-switch.png "Beispiel eines Umschalters"){data-zoomable}
*Beispiel von gerenderten Schaltern in einem Dashboard.*