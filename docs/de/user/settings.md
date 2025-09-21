---
description: Passen Sie Ihr Node-RED Dashboard 2.0-Erlebnis mit detaillierten Einstellungen für optimale Dashboard-Leistung und -Aussehen an.
---

# Einstellungen

Während die meisten Dashboard-Konfigurationen im Node-RED-Editor vorgenommen werden, können einige Einstellungen
in der [Node-RED Runtime-Einstellungsdatei](https://nodered.org/docs/user-guide/runtime/settings-file) bereitgestellt werden.

Die Datei `settings.js` befindet sich typischerweise im Verzeichnis `~/.node-red`. Wenn Sie
nicht sicher sind, wo das ist, können Sie auch die Protokollausgabe von Node-RED beim Start überprüfen.
Zum Beispiel:

```
12 Sep 13:31:37 - [info] Einstellungsdatei  : /Users/nol/.node-red/settings.js
```

Die Datei ist als JavaScript-Modul strukturiert:

```js
module.exports = {
    // Viele Einstellungen...
}
```

Node-RED Dashboard 2.0 sucht nach einer Eigenschaft namens `dashboard` innerhalb des Einstellungsobjekts.
Wenn es keine findet, sucht es nach einer Eigenschaft namens `ui` - dies ist das Einstellungsobjekt,
das vom ursprünglichen Node-RED Dashboard verwendet wird. Dies erleichtert die Migration zwischen den beiden Dashboard-Versionen.

Bearbeiten Sie die Datei `settings.js` und fügen Sie eine `dashboard`-Eigenschaft innerhalb des `module.exports`-Objekts hinzu.
Dies muss von jeder anderen Einstellung durch ein Komma getrennt sein:

```js
dashboard: {

}
```

Sie können dann Dashboardspezifische Einstellungen innerhalb dieser Eigenschaft hinzufügen. Die verfügbaren
Einstellungen sind unten beschrieben.

Wann immer Sie Änderungen an der Datei `settings.js` vornehmen, müssen Sie
Node-RED neu starten, um diese Änderungen zu laden.

### Dashboard-Einstellungen

Die folgenden Einstellungen sind verfügbar.

#### `middleware`

Dies fügt ein benutzerdefiniertes [Express](https://expressjs.com/) Middleware vor dem Dashboard hinzu.
Dies kann verwendet werden, um benutzerdefinierte Authentifizierung, Protokollierung oder jede andere Art von Verarbeitung
vor jeder Anfrage an das Dashboard anzuwenden.


```js
dashboard: {
    middleware: (request, response, next) => {
        console.log(`Neue Dashboard-Anfrage von ${request.ip} zu ${request.path}`)
        next()
    }
}
```

#### `ioMiddleware`

Dies fügt ein benutzerdefiniertes [Socket.IO Middleware](https://socket.io/docs/v4/middlewares/) vor
der Websocket-Verbindung zwischen der Dashboard-Seite und Node-RED hinzu.

```js
dashboard: {
    ioMiddleware: (socket, next) => {
        if (isValid(socket.request)) {
            next();
        } else {
            next(new Error("ungültig"));
        }
    }
}
```

#### `maxHttpBufferSize`

Dies setzt die maximale Nachrichtengröße (in Bytes), die der Socket senden kann.
Der Standardwert ist 1MiB (1E6 Bytes).

Ändern Sie diesen Wert, um größere Dateien hochladen zu können.

```js
dashboard: {
    maxHttpBufferSize: 1e8 // Größe in Bytes, Beispiel: 100 MB
}
```