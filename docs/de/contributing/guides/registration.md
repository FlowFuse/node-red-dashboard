---
description: Erfahren Sie den Prozess der Widget-Registrierung im Node-RED Dashboard 2.0, um die Funktionalität Ihres Dashboards zu erweitern.
---

# Widget-Registrierung

Jede `ui-base`, `ui-page` und `ui-group` hat eine `.register`-Funktion. Die Kernregistrierungsfunktion befindet sich in `ui-base`.

Diese Funktion wird von allen Widgets verwendet, um das Dashboard über ihre Existenz zu informieren, und ermöglicht es dem Widget, zu definieren, zu welcher Gruppe/Seite/UI es gehört, zusammen mit den relevanten Eigenschaften, die das Widget hat, und allen Ereignishandlern (z.B. `onInput` oder `onAction`).

Die Funktion wird innerhalb der Node-RED `.js`-Datei des Knotens aufgerufen, und im Fall eines Widgets, das als Teil einer Gruppe registriert wird (der häufigste Anwendungsfall), würde es ungefähr so aussehen:

```js
module.exports = function (RED) {
    function MyNode (config) {
        // Knoten in Node-RED erstellen
        RED.nodes.createNode(this, config)
        // Referenz auf unseren Node-RED-Knoten speichern
        const node = this

        // in welcher Gruppe rendern wir dieses Widget
        const group = RED.nodes.getNode(config.group)

        // ein Objekt, das die zu abonnierenden Ereignisse beschreibt
        const evts = {}

        // das Dashboard-UI informieren, dass wir diesen Knoten hinzufügen
        group.register(node, config, evts)
    }

    RED.nodes.registerType('ui-mywidget', MyNode)
}
```

## Argumente

Die Eingaben der Registrierungsfunktion unterscheiden sich leicht, je nachdem, ob sie auf `ui-group`, `ui-page` oder `ui-base` aufgerufen wird:

- `group.register(node, config, evts)`
- `page.register(group, node, config, evts)`
- `base.register(page, group, node, config, evts)`

Beachten Sie jedoch, dass sie alle 3 gemeinsame Eingaben haben:

### `node`

Dies ist das `this` des Konstruktors Ihres Knotens und kann direkt aus dem von Node-RED bereitgestellten Wert verwendet werden.

### `config`

Dies wird von Node-RED als Eingabe für den Konstruktor bereitgestellt und kann im Allgemeinen ohne Änderung direkt in die `.register`-Funktion übergeben werden. Es wird ein Objekt sein, das alle Eigenschaften und Werte abbildet, die in der `.html`-Definition des Knotens beschrieben wurden.

### `evts`

Wir stellen eine Reihe verschiedener Ereignishandler als Teil der `register`-Funktion bereit. Alle diese Handler laufen serverseitig (Node-RED).

In einigen Fällen ist es möglich, vollständige Funktionen zu definieren (die zu einem geeigneten Zeitpunkt im Ereignislebenszyklus ausgeführt werden), in anderen Fällen ist es nur möglich, einen `true`/`false`-Wert zu definieren, der das Dashboard darüber informiert, dass Sie möchten, dass das Widget dieses Ereignis sendet oder abonniert.

Eine vollständige Übersicht über den Ereignislebenszyklus finden Sie [hier](../../contributing/guides/events.md).

```js
const evts = {
    onAction:   // boolean
    onChange:   // boolean || function
    beforeSend: // function
    onInput:    // function
    onError:    // function
    onSocket    // object
}
```

## Ereignisse

Alle diese Ereignishandler definieren Verhalten, das serverseitig ausgeführt wird (d.h. innerhalb von Node-RED). Wenn Sie nach clientseitigen Ereignishandlern suchen, sehen Sie [hier](../widgets/third-party.md#configuring-your-node).

### `.onAction` (`boolean`)

Wenn auf `true` gesetzt, löst dieses Flag den Standardhandler aus, wenn die Dashboard-Widgets ein `widget-action`-Ereignis senden.

1. Weist den bereitgestellten Wert `msg.payload` zu
2. Fügt ein `msg.topic` hinzu, das in der Knotenkonfiguration definiert ist
3. Führt `evts.beforeSend()` aus _(falls bereitgestellt)_
4. Sendet das `msg` an alle verbundenen Knoten mit `node.send(msg)`

Ein Beispiel dafür ist `ui-button`, bei dem das `UIButton` des Widgets eine `@click`-Funktion enthält, die folgendes enthält:

```js
this.$socket.emit('widget-action', this.id, msg)
```

Dies sendet eine Nachricht über SocketIO an Node-RED, mit dem Thema der Widget-ID. Da `ui-button` `onAction: true` in seiner Registrierung hat, wird es folglich den oben beschriebenen Standardhandler ausführen.

### `.onChange` (`boolean` || `function`)

Ähnlich wie `onAction`, löst dieses Flag, wenn es als Boolean verwendet wird, den Standardhandler für ein `onChange`-Ereignis aus. 

#### Standard `onChange` Handler

1. Weist den bereitgestellten Wert `msg.payload` zu
2. Fügt ein `msg.topic` hinzu, das in der Knotenkonfiguration definiert ist
3. Führt `evts.beforeSend()` aus _(falls bereitgestellt)_
4. Speichert die letzte Nachricht auf dem Widget unter der `._msg`-Eigenschaft, die den neuesten Zustand/Wert des Widgets enthält
5. Löst ein `widget-sync`-Ereignis aus, um die Widgets in allen Clients zu synchronisieren.
6. Sendet das `msg` an alle verbundenen Knoten

#### Benutzerdefinierter `onChange` Handler

Alternativ können Sie dieses Standardverhalten überschreiben, indem Sie eine benutzerdefinierte `onChange`-Funktion bereitstellen. Ein Beispiel dafür ist der `ui-switch`-Knoten, der `node.status`-Updates benötigt, damit der Node-RED-Editor seinen neuesten Status widerspiegelt:

```js
/**
 * Eingabe vom Widget verarbeiten
 * @param {object} msg - die zuletzt bekannte empfangene Nachricht (vor diesem neuen Wert)
 * @param {boolean} value - der vom Widget gesendete aktualisierte Wert
 * @param {Socket} conn - socket.io-Socket, der mit dem Server verbindet
 * @param {String} id - Widget-ID, die die Aktion sendet
 */
onChange: async function (msg, value, conn, id) {
    // sicherstellen, dass wir die neueste Instanz des Widget-Knotens haben
    const wNode = RED.nodes.getNode(node.id)

    node.status({
        fill: value ? 'green' : 'red',
        shape: 'ring',
        text: value ? states[1] : states[0]
    })

    // den zugewiesenen Ein-/Aus-Wert abrufen
    const on = RED.util.evaluateNodeProperty(config.onvalue, config.onvalueType, wNode)
    const off = RED.util.evaluateNodeProperty(config.offvalue, config.offvalueType, wNode)
    msg.payload = value ? on : off

    // diese Änderung an alle Clients mit demselben Widget synchronisieren
    const exclude = [conn.id] 
    base.emit('widget-sync:' + id, msg, node, exclude)

    // simulieren, dass der Node-RED-Knoten eine Eingabe erhält
    wNode.send(msg)
}
```

### `.beforeSend(msg)` (`function`)

Diese Middleware-Funktion wird ausgeführt, bevor der Knoten eine `msg` an nachfolgende Knoten sendet, die im Editor verbunden sind (z.B. in `onInput`, `onAction` und `onChange` Standardhandler). 

Die Funktion muss `msg` als Eingabe nehmen und auch `msg` als Ausgabe zurückgeben.

In `ui-button` verwenden wir `beforeSend`, um die `msg.payload` zu bewerten, da wir ein `TypedInput` ([docs](https://nodered.org/docs/api/ui/typedInput/)) haben. Das `TypedInput` muss innerhalb von Node-RED bewertet werden, da es auf Variablen außerhalb der Domäne des Button-Knotens verweisen kann (z.B. `global` oder `flow`). Der Standard `onInput`-Handler nimmt dann die Ausgabe von unserem `beforeSend` und verarbeitet sie entsprechend.

### `.onInput(msg, send)` (`function`)

Das Definieren dieser Funktion überschreibt den Standard `onInput`-Handler. 

#### Standard `onInput` Handler

1. Speichert die letzte Nachricht auf dem Widget unter `node._msg`
2. Fügt ein `msg.topic` hinzu, das in der Knotenkonfiguration definiert ist
3. Überprüft, ob das Widget eine `passthru`-Eigenschaft hat:
    - Wenn keine `passthru`-Eigenschaft gefunden wird, wird `send(msg)` ausgeführt
    - Wenn die Eigenschaft vorhanden ist, wird `send(msg)` nur ausgeführt, wenn `passthru` auf `true` gesetzt ist

#### Benutzerdefinierter `onInput` Handler

Wenn bereitgestellt, überschreibt dies den Standardhandler.

Wir verwenden dies in den Kern-Widgets im Dashboard mit `ui-chart`, wo wir die Historie der letzten `msg`-Werte speichern möchten, anstatt nur den neuesten Wert, wie im Standardhandler. Wir verwenden es auch hier, um sicherzustellen, dass wir nicht zu viele Datenpunkte haben (wie in der `ui-chart`-Konfiguration definiert).

Ein weiterer Anwendungsfall wäre, wenn Sie keine eingehenden `msg`-Payloads automatisch an verbundene Knoten weitergeben möchten. Zum Beispiel könnten Sie eine Reihe von Befehlstyp-`msg`-Payloads haben, die Ihren Knoten anweisen, etwas zu tun, die dann für keine vorhergehenden Knoten im Flow relevant sind.

### `.onError(err)` (`function`)

Diese Funktion wird innerhalb der Handler für `onAction`, `onChange` und `onInput` aufgerufen. Wenn es jemals ein Problem mit diesen Handlern gibt (einschließlich der bereitgestellten benutzerdefinierten Handler), wird die `onError`-Funktion aufgerufen.

### `.onSocket` (`object`)

Dies ist ein etwas einzigartiger Ereignishandler, der nur von extern entwickelten Widgets verwendet wird (d.h. nicht Teil der in dieser Dokumentation beschriebenen Kern-Dashboard-Widgets). Es wird bereitgestellt, damit Entwickler benutzerdefinierte SocketIO-Ereignisse `emit` und folglich abonnieren können, die von ihren benutzerdefinierten Widgets übertragen werden.

Ein detaillierteres Beispiel finden Sie in unserer Dokumentation [hier](../widgets/third-party.md#custom-socketio-events).

Die allgemeine Struktur von `onSocket` ist wie folgt:

```js
const evts = {
    onSocket: {
        'my-custom-event': function (id, msg) {
            console.log('my-custom-event', id, msg)
        }
    }
}
```

Beachten Sie, dass diese Ereignisse vom Dashboard gesendet werden, und daher werden diese Handler innerhalb von Node-RED ausgeführt.