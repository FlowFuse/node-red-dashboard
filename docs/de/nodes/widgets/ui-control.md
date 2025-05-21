---
{
    "description": "Steuern Sie dynamisch Elemente auf Ihrem Dashboard durch ui-control für Node-RED Dashboard 2.0.",
    "events": [
        {
            "event": "$pageview",
            "payload": "{ page }",
            "description": "Wird gesendet, wann immer ein Benutzer eine bestimmte Seite im Dashboard <i>ansieht</i>"
        },
        {
            "event": "$pageleave",
            "payload": "{ page }",
            "description": "Wird gesendet, wann immer ein Benutzer eine bestimmte Seite im Dashboard <i>verlässt</i>"
        }
    ]
}
---

<script setup>
    import EventsList from '../../../components/EventsList.vue'
    import AddedIn from '../../../components/AddedIn.vue'
</script>

# Steuerung `ui-control` <AddedIn version="0.9.0" />

Dieses Widget rendert keinen Inhalt in Ihrem Dashboard. Stattdessen bietet es eine Schnittstelle, mit der Sie das Verhalten Ihres Dashboards aus dem Node-RED Editor heraus steuern können.

Die Funktionalität ist im Allgemeinen in zwei Hauptfunktionen unterteilt:

- **Navigation**: Erzwingen Sie, dass der Benutzer zu einer neuen Seite wechselt
- **Anzeige**: Gruppen und Seiten anzeigen/ausblenden
- **Deaktivierung**: Gruppen und Seiten aktivieren/deaktivieren, sie werden weiterhin angezeigt, aber die Interaktion wird verhindert

## Steuerungsliste

Derzeit unterstützen wir die folgenden Steuerungen:

### Navigation

Sie können die Navigation programmatisch mit den folgenden Nutzlasten mit `ui-control` erzwingen:

#### Seite wechseln

Wählen Sie explizit die Seite, zu der Sie navigieren möchten:

```js
// String
msg.payload = '<Seitenname>'

// Objekt
msg.payload = {
    page: '<Seitenname>',
}
```

Mit dem Objektformat können Sie auch Abfrageparameter angeben, mit denen die Seite geladen werden soll:

```js
msg.payload = {
    page: '<Seitenname>',
    query: {
        hello: 'world'
    }
}
```

Dies würde zu einer Seite mit `?hello=world` in der URL navigieren.

#### Nächste/Vorherige

Navigieren Sie zur nächsten oder vorherigen Seite in der Liste:

```js
// Nächste Seite
msg.payload = "+1"

// Vorherige Seite
msg.payload = "-1"
```

#### Aktualisieren

Sie können eine Aktualisierung der aktuellen Ansicht erzwingen, indem Sie eine leere Zeichenfolgen-Nutzlast senden:

```js
msg.payload = ""
```

#### Externe URL

Wenn Sie die Navigation zu einer externen Ressource oder Website auslösen möchten, können Sie dies tun, indem Sie eine `url`-Eigenschaft in die `msg.payload` einfügen, z.B.:

```js
msg.payload = {
    url: 'https://nodered.org'
}
```

 Sie können auch eine `target`-Eigenschaft angeben, um die Website in einem neuen Browserfenster oder Tab zu öffnen.
 
```js
msg.payload = {
    url: 'https://nodered.org',
    target: '_blank'
}
```

### Anzeigen/Ausblenden

Sie können Gruppen und Seiten programmatisch mit der folgenden Nutzlast in `ui-control` anzeigen/ausblenden:

```js
msg.payload = {
    pages: {
        show: ['<Seitenname>', '<Seitenname>'],
        hide: ['<Seitenname>']
    }
    groups: {
        show: ['<Seitenname>:<Gruppenname>', '<Seitenname>:<Gruppenname>'],
        hide: ['<Seitenname>:<Gruppenname>']
    }
}
```

_Hinweis:_ `pages` kann wie im Dashboard 1.0 durch `tabs` ersetzt werden und `groups` kann auch wie im Dashboard 1.0 durch `group` ersetzt werden.

### Aktivieren/Deaktivieren

Sie können Gruppen und Seiten programmatisch mit der folgenden Nutzlast in `ui-control` aktivieren/deaktivieren:

```js
msg.payload = {
    pages: {
        enable: ['<Seitenname>', '<Seitenname>'],
        disable: ['<Seitenname>']
    }
    groups: {
        enable: ['<Seitenname>:<Gruppenname>', '<Seitenname>:<Gruppenname>'],
        disable: ['<Seitenname>:<Gruppenname>']
    }
}
```

_Hinweis:_ `pages` kann wie im Dashboard 1.0 durch `tabs` ersetzt werden und `groups` kann auch wie im Dashboard 1.0 durch `group` ersetzt werden.

## Ereignisliste

Zusätzlich zur Eingabe von `ui-control`, um die UI zu _steuern_, haben wir hier auch die Unterstützung für alle Ereignisse beibehalten, die von `ui-control` aus Dashboard 1.0 gesendet werden.

### Verbindungsstatus

Wir folgen der Dashboard 1.0-Konvention für das Senden von socket-basierten Ereignissen vom `ui-control`-Knoten.

#### .on('connection')

Wenn ein neuer Dashboard-Client eine Verbindung zu Node-RED herstellt, sendet der `ui-control`-Knoten:

```js
msg = {
    payload: 'connect',
    socketid: '<socketid>',
    socketip: '<socketip>'
}
```

#### .on('disconnect')

Wenn ein Dashboard-Client die Verbindung zu Node-RED trennt, sendet der `ui-control`-Knoten:

```js
msg = {
    payload: 'lost',
    socketid: '<socketid>',
    socketip: '<socketip>'
}
```

### Tab-/Seitenwechsel

Wenn ein Benutzer den aktiven Tab oder die Seite wechselt, sendet der `ui-control`-Knoten:

```js
msg = {
    payload: 'change',
    socketid: '<socketid>',
    socketip: '<socketip>',
    tab: '<Seitenindex>',
    name: '<Seitenname>'
}
```