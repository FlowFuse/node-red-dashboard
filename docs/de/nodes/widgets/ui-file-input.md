---
description: Das Datei-Upload-Widget ermöglicht es Benutzern, Dateien zu Node-RED hochzuladen.
props:
    Gruppe: Definiert, in welcher Gruppe des UI-Dashboards dieses Widget gerendert wird.
    Größe: Steuert die Breite des Dropdowns in Bezug auf die übergeordnete Gruppe. Der Maximalwert ist die Breite der Gruppe.
    Beschriftung:
        description: Der Text, der dem Benutzer angezeigt wird und erklärt, was hochgeladen werden soll.
    Symbol:
        description: Standardmäßig "Büroklammer". Das Symbol, das links vom Eingabefeld angezeigt wird. Die vollständige Liste der Symbole finden Sie <a href="https://pictogrammers.com/library/mdi/" target="_blank">hier</a>.
    Akzeptieren:
        description: String-Darstellung der "erlaubten" Dateityp-Selektoren. Die vollständige Liste der Optionen finden Sie <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept#unique_file_type_specifiers" target="_blank">hier</a>.  
    Mehrfach:
        description: Ermöglicht Endbenutzern, mehrere Dateien gleichzeitig hochzuladen. Jede Datei wird als eindeutige Nachricht gesendet.
---

<script setup>
    import AddedIn from '../../../components/AddedIn.vue';
    import TryDemo from "./../../../components/TryDemo.vue";
</script>

<TryDemo href="file-input" title="Demo Ausprobieren">

# Datei-Upload <AddedIn version="1.12.0" />

</TryDemo>

Das Datei-Upload-Widget ermöglicht es Benutzern, Dateien zu Node-RED hochzuladen. Das Widget kann so konfiguriert werden, dass es bestimmte Dateitypen akzeptiert und mehrere Dateien zulässt.

## Eigenschaften

<PropsTable/>

## Ausgabe

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

## Aktuelle Einschränkungen

_Derzeit_ ist das Datei-Upload-Widget durch eine maximale Dateigröße begrenzt, die durch die Websocket-Verbindung definiert wird. Der Standardwert hier beträgt 5 MB. Dies kann erhöht werden, indem die `maxHttpBufferSize`-Eigenschaft in der `settings.js`-Datei im Node-RED-Installationsverzeichnis geändert wird:

```
dashboard: {
    maxHttpBufferSize: 1e8 // Größe in Bytes, Beispiel: 100 MB
}
```

Lesen Sie mehr über die Dashboard-Konfiguration in der `settings.js` [hier](/de/user/settings.html#maxhttpbuffersize).

Beachten Sie, dass wir planen, dieses Verhalten zu verbessern, indem wir Dateien in kleinere Teile aufteilen und sie auf der Serverseite wieder zusammensetzen. Dies wird es ermöglichen, größere Dateien hochzuladen und wird in einer zukünftigen Version implementiert.

## Beispiel

![Beispiel eines Datei-Uploads](/images/node-examples/ui-file-input-select.png "Beispiel eines Datei-Uploads"){data-zoomable}
_Screenshot, um ein Beispiel für eine Dateieingabe zu zeigen, wenn sie bereit ist, eine Datei auszuwählen_

![Beispiel eines Datei-Uploads](/images/node-examples/ui-file-input-chosen.png "Beispiel eines Datei-Uploads"){data-zoomable}
_Screenshot, um ein Beispiel für eine Dateieingabe zu zeigen, wenn eine Datei ausgewählt wurde und bereit zum "Hochladen" ist_