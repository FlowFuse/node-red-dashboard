---
description: Benachrichtigen Sie Benutzer über wichtige Updates und Warnungen mit ui-notification im Node-RED Dashboard 2.0.
props:
    UI: Im Gegensatz zu den meisten Widgets werden Benachrichtigungen von einer "UI" und nicht von einer Gruppe verwaltet. Dadurch können Benachrichtigungen auf allen Seiten angezeigt werden.
    Position: Die Position auf dem Bildschirm, an der die Benachrichtigung angezeigt wird.
    Farbe: Die Farbe, die für den Benachrichtigungsrahmen verwendet werden soll.
    Timeout: Anzahl der Sekunden, bevor die Benachrichtigung automatisch geschlossen wird.
    Countdown-Leiste anzeigen: Ob eine abnehmende Fortschrittsleiste angezeigt werden soll, um die verbleibende Zeit anzuzeigen, bevor die Benachrichtigung geschlossen wird.
    Manuelle Schließung zulassen: Zeigt einen Button für Benutzer an, um die Benachrichtigung zu <b>schließen</b>. Andernfalls wird sie nur nach dem Timeout geschlossen.
    Manuelle Schließung zulassen - Button-Beschriftung: Wenn <i>"Manuelle Schließung zulassen"</i> aktiviert ist, ist dies die Beschriftung für den Button.
    Manuelle Bestätigung zulassen: Zeigt einen Button für Benutzer an, um die Benachrichtigung zu <b>bestätigen</b>. Andernfalls wird sie nur nach dem Timeout geschlossen.
    Manuelle Bestätigung zulassen - Button-Beschriftung: Wenn <i>"Manuelle Bestätigung zulassen"</i> aktiviert ist, ist dies die Beschriftung für den Button.
    Rohdaten akzeptieren: Ob Sie rohes HTML übergeben, das clientseitig verarbeitet werden soll.
    Klasse: Fügt dem Widget CSS-Klassen hinzu
dynamic:
    Deaktivierter Zustand:
        payload: msg.enabled
        structure: ["Boolean"]
    Bestätigung zulassen:
        payload: msg.ui_update.allowConfirm
        structure: ["Boolean"]
    Schließung zulassen:
        payload: msg.ui_update.allowDismiss
        structure: ["Boolean"]
    Farbe:
        payload: msg.ui_update.color
        structure: ["String"]
    Bestätigungsbutton-Text:
        payload: msg.ui_update.confirmText
        structure: ["String"]
    Schließungsbutton-Text:
        payload: msg.ui_update.dismissText
        structure: ["String"]
    Anzeigedauer (Timeout):
        payload: msg.ui_update.displayTime
        structure: ["Number"]
    Position:
        payload: msg.ui_update.position
        structure: ["top right", "top center", "top left", "bottom right", "bottom center", "bottom left", "center center"]
    Fortschrittsleistenfarbe:
        payload: msg.ui_update.progressColor
        structure: ["String"]
    Rohes HTML akzeptieren:
        payload: msg.ui_update.raw
        structure: ["Boolean"]
    Countdown-Leiste anzeigen:
        payload: msg.ui_update.showCountdown
        structure: ["Boolean"]
controls:
    anzeigen:
        example: true | false
        description: Ermöglicht die Steuerung darüber, ob die Benachrichtigung sichtbar ist.
---

<script setup>
    import AddedIn from '../../../components/AddedIn.vue';
    import TryDemo from "./../../../components/TryDemo.vue";
</script>

# Benachrichtigung `ui-notification` <AddedIn version="0.5.0" />

<TryDemo href="notification" title="Demo Ausprobieren"/>

Im Dashboard 1.0 als "Toast" bekannt, zeigt dieses Widget Text/HTML in einem kleinen Fenster an, das für eine definierte Dauer (`timeout`) und an einem definierten Ort auf dem Bildschirm (`position`) erscheint.

Wenn Sie möchten, dass die Benachrichtigung unbegrenzt angezeigt wird, können Sie `timeout` auf `0` setzen. Es wird nicht möglich sein, die Benachrichtigung manuell zu schließen, es sei denn, Sie setzen auch `allowDismiss` oder `allowConfirm` auf `true`.

## Eigenschaften

<PropsTable/>

## Dynamische Eigenschaften

<DynamicPropsTable/>

## Steuerungen

<ControlsTable/>

## Beispiel

![Beispiel einer gerenderten Benachrichtigung](/images/node-examples/ui-notification.png "Beispiel einer gerenderten Benachrichtigung"){data-zoomable}
*Beispiel einer gerenderten Benachrichtigung in einem Dashboard mit einer Fortschrittsleiste, die anzeigt, wie lange es noch dauert, bis sie automatisch geschlossen wird.*

Diese Benachrichtigung wurde mit einem `msg.payload` von:

```html
<h3>Generierte Benachrichtigung</h3><p>Dies ist benutzerdefiniertes HTML, das in <b>Node-RED</b> eingefügt wurde</p>
```

### An alle Clients senden

Benachrichtigungen sind standardmäßig darauf beschränkt, an einen einzelnen Benutzer/Client gesendet zu werden. Im Dashboard 2.0 wird diese Einschränkung durch `msg._client` definiert. Sie können mehr darüber [hier](../../user/multi-tenancy.md#configuring-client-data) lesen.

Wenn Sie eine Benachrichtigung an _alle_ verbundenen Clients senden möchten, können Sie den `msg._client`-Wert mit einem "Änderungs"-Knoten entfernen, der so konfiguriert ist, dass die `_client`-Eigenschaft "gelöscht" wird.